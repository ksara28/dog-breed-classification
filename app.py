from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import time
import hashlib
import uuid
import random
from typing import Optional

import requests
import numpy as np
import cv2

# Try to import tensorflow / keras model if available. If not present, the predict
# endpoint will return an error indicating the model is not available.
try:
	import tensorflow as tf
	tf_available = True
except Exception:
	tf_available = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
# allow cross-origin requests from the frontend during development
CORS(app)

# Attempts to load a Keras model file if present
MODEL_PATH = os.path.join(BASE_DIR, 'dog_breed_model.h5')
model = None
if tf_available and os.path.exists(MODEL_PATH):
	try:
		model = tf.keras.models.load_model(MODEL_PATH)
		print('Loaded model from', MODEL_PATH)
	except Exception as e:
		print('Failed to load model:', e)
		model = None

# Try to build BREED_NAMES from the images directory (best-effort)
def _discover_breeds():
	# common candidate locations relative to archive/
	candidates = [
		os.path.join(BASE_DIR, 'images', 'Images'),
		os.path.join(BASE_DIR, '..', 'images', 'Images'),
		os.path.join(BASE_DIR, '..', '..', 'images', 'Images'),
	]
	for p in candidates:
		try:
			if os.path.exists(p) and os.path.isdir(p):
				names = sorted([d for d in os.listdir(p) if os.path.isdir(os.path.join(p, d))])
				if names:
					return names
		except Exception:
			continue
	return []

BREED_NAMES = _discover_breeds()

# Simple in-memory cache for chat responses
CACHE_TTL = int(os.environ.get('CHAT_CACHE_TTL', '300'))
_qa_cache = {}

def cache_get(key: str) -> Optional[str]:
	entry = _qa_cache.get(key)
	if not entry:
		return None
	value, expires = entry
	if time.time() > expires:
		try:
			del _qa_cache[key]
		except Exception:
			pass
		return None
	return value

def cache_set(key: str, value: str, ttl: int = CACHE_TTL):
	_qa_cache[key] = (value, time.time() + ttl)

def question_key(q: str) -> str:
	return hashlib.sha256(q.strip().lower().encode('utf-8')).hexdigest()

def read_image_from_bytes(file_bytes: bytes):
	nparr = np.frombuffer(file_bytes, np.uint8)
	img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
	if img is None:
		raise ValueError('Could not decode image')
	img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
	img = cv2.resize(img, (224, 224))
	img = img.astype(np.float32) / 255.0
	img = np.expand_dims(img, axis=0)
	return img


@app.route('/predict', methods=['POST'])
def predict():
	if model is None:
		return jsonify({'error': 'Model not available on server'}), 500

	if 'image' not in request.files:
		return jsonify({'error': "No image file provided (field 'image')"}), 400

	file = request.files['image']
	try:
		img_bytes = file.read()
		img_input = read_image_from_bytes(img_bytes)
		preds = model.predict(img_input)
		pred_idx = int(np.argmax(preds, axis=1)[0])
		confidence_frac = float(np.max(preds))
		min_conf = float(os.environ.get('MIN_DOG_CONFIDENCE', '0.35'))
		if confidence_frac < min_conf:
			return jsonify({'error': 'please upload correct breed image'}), 400
		confidence = confidence_frac * 100.0
		if 0 <= pred_idx < len(BREED_NAMES):
			breed = BREED_NAMES[pred_idx]
		else:
			breed = str(pred_idx)
		return jsonify({'breed': breed, 'confidence': confidence})
	except Exception as e:
		return jsonify({'error': str(e)}), 500


def _orders_file_path():
	return os.path.join(BASE_DIR, 'orders.json')


def _read_orders():
	p = _orders_file_path()
	try:
		if not os.path.exists(p):
			return []
		with open(p, 'r', encoding='utf-8') as f:
			return json.load(f)
	except Exception:
		return []


def _write_orders(orders):
	p = _orders_file_path()
	try:
		with open(p, 'w', encoding='utf-8') as f:
			json.dump(orders, f, indent=2, ensure_ascii=False)
	except Exception as e:
		print('Failed to write orders file:', e)


@app.route('/order', methods=['POST'])
def create_order():
	data = request.get_json() or {}
	user = data.get('user') or {}
	items = data.get('items') or data.get('cart') or []
	payment = (data.get('payment_method') or data.get('payment') or 'cod').lower()
	notes = data.get('notes')
	if not user.get('name') or not user.get('address'):
		return jsonify({'error': 'user.name and user.address are required'}), 400
	if payment not in ('cod', 'online'):
		return jsonify({'error': 'payment_method must be "cod" or "online"'}), 400
	total = 0.0
	try:
		for it in items:
			qty = float(it.get('qty', 1))
			price = float(it.get('price', 0))
			total += qty * price
	except Exception:
		total = 0.0
	order_id = str(uuid.uuid4())
	order = {
		'id': order_id,
		'user': user,
		'items': items,
		'payment_method': payment,
		'notes': notes,
		'total': total,
		'status': 'pending',
		'created_at': int(time.time())
	}
	orders = _read_orders()
	orders.append(order)
	_write_orders(orders)
	if payment == 'online':
		order['status'] = 'awaiting_payment'
	return jsonify({'ok': True, 'order_id': order_id, 'order': order}), 200


@app.route('/orders', methods=['GET'])
def list_orders():
	orders = _read_orders()
	return jsonify({'count': len(orders), 'orders': orders})


def _extract_groq_text(resp_json):
	# Try several common Groq/OpenAI-like response shapes
	if not resp_json:
		return None
	if isinstance(resp_json, dict):
		# Groq responses often include an 'output' which may be a list of message objects
		if 'output' in resp_json:
			out = resp_json.get('output')
			# string output
			if isinstance(out, str):
				return out
			# single object
			if isinstance(out, dict):
				# common fields
				return out.get('text') or out.get('content')
			# list of outputs -> try to extract nested content texts
			if isinstance(out, list) and len(out) > 0:
				parts = []
				for entry in out:
					if not isinstance(entry, dict):
						continue
					# content may be under entry['content'] as list of fragments
					content = entry.get('content')
					if isinstance(content, str):
						parts.append(content)
					elif isinstance(content, dict):
						parts.append(content.get('text') or content.get('content') or '')
					elif isinstance(content, list):
						for c in content:
							if isinstance(c, dict) and 'text' in c:
								parts.append(c.get('text'))
							elif isinstance(c, str):
								parts.append(c)
					# older shapes: message
					msg = entry.get('message') or entry.get('msg')
					if isinstance(msg, dict):
						# try nested content
						mcont = msg.get('content')
						if isinstance(mcont, list):
							for c in mcont:
								if isinstance(c, dict) and 'text' in c:
									parts.append(c.get('text'))
								elif isinstance(c, str):
									parts.append(c)
						elif isinstance(mcont, str):
							parts.append(mcont)
				# fall back to text field
				if 'text' in entry and isinstance(entry.get('text'), str):
					parts.append(entry.get('text'))
				# join non-empty parts
				joined = '\n'.join([p for p in parts if p])
				if joined:
					return joined
		if 'text' in resp_json:
			return resp_json.get('text')
		if 'choices' in resp_json and isinstance(resp_json.get('choices'), list) and len(resp_json.get('choices'))>0:
			first = resp_json.get('choices')[0]
			if isinstance(first, dict):
				return first.get('text') or (first.get('message') and first.get('message').get('content'))
	return None


@app.route('/verify-groq', methods=['GET'])
def verify_groq():
	groq_key = os.environ.get('GROQ_API_KEY')
	groq_url = os.environ.get('GROQ_API_URL')
	if not groq_key or not groq_url:
		return jsonify({'ok': False, 'error': 'GROQ_API_KEY and/or GROQ_API_URL not set'}), 400
	try:
		headers = {'Authorization': f'Bearer {groq_key}', 'Content-Type': 'application/json'}
		payload = {'model': os.environ.get('GROQ_MODEL', 'gpt-4o-mini'), 'input': 'Verify Groq access'}
		r = requests.post(groq_url, headers=headers, data=json.dumps(payload), timeout=15)
		try:
			j = r.json()
		except Exception:
			j = {'status_code': r.status_code, 'text': r.text}
		return jsonify({'ok': r.status_code >= 200 and r.status_code < 300, 'groq_raw': j, 'status_code': r.status_code})
	except Exception as e:
		return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
	data = request.get_json() or {}
	question = (data.get('question') or '').strip()
	if not question:
		return jsonify({'error': 'No question provided'}), 400

	groq_key = os.environ.get('GROQ_API_KEY')
	groq_url = os.environ.get('GROQ_API_URL')
	if not groq_key or not groq_url:
		return jsonify({'error': 'GROQ not configured on server'}), 400

	# basic cache check
	k = question_key(question)
	cached = cache_get(k)
	if cached:
		return jsonify({'answer': cached, 'cached': True, 'source': 'cache'})

	headers = {'Authorization': f'Bearer {groq_key}', 'Content-Type': 'application/json'}
	payload = {'model': os.environ.get('GROQ_MODEL', 'gpt-4o-mini'), 'input': question}
	try:
		r = requests.post(groq_url, headers=headers, data=json.dumps(payload), timeout=30)
		if r.status_code < 200 or r.status_code >= 300:
			return jsonify({'error': f'Groq HTTP {r.status_code}', 'detail': r.text}), 502
		try:
			jr = r.json()
		except Exception:
			jr = None
		text = _extract_groq_text(jr) or (r.text if r.text else None)
		if not text:
			return jsonify({'error': 'Groq returned no text'}), 502
		cache_set(k, text)
		return jsonify({'answer': text, 'source': 'groq'})
	except Exception as e:
		return jsonify({'error': str(e)}), 502


	app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '5000')), debug=False)
if __name__ == '__main__':
	app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '5000')), debug=False)
