
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import io
import requests
import json
from openai import OpenAI
import random
import hashlib
import time
from typing import Optional
from dotenv import load_dotenv
import uuid
import errno

# load environment variables from a .env file if present
load_dotenv()

# configure openai from env if present
openai_api_key = os.environ.get('OPENAI_API_KEY')
openai_client = None
if openai_api_key:
	# prefer a singleton OpenAI client from the new openai-python (v1+) SDK
	try:
		openai_client = OpenAI(api_key=openai_api_key)
	except Exception:
		openai_client = None

app = Flask(__name__)
CORS(app)

# Configure Gemini (Google Generative) API key if present
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')


BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "dog_breed_model.h5")
DATA_DIR = os.path.join(BASE_DIR, "images", "Images")


def load_model_and_breeds():
	if not os.path.exists(MODEL_PATH):
		raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

	model = tf.keras.models.load_model(MODEL_PATH)

	if os.path.exists(DATA_DIR):
		breed_names = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])
	else:
		breed_names = []

	return model, breed_names


try:
	model, BREED_NAMES = load_model_and_breeds()
	print(f"Loaded model from {MODEL_PATH} and {len(BREED_NAMES)} breeds")
except Exception as e:
	model = None
	BREED_NAMES = []
	print("Warning: Failed to load model or breeds:", e)


def read_image_from_bytes(file_bytes):
	nparr = np.frombuffer(file_bytes, np.uint8)
	img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
	if img is None:
		raise ValueError("Could not decode image")
	img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
	img = cv2.resize(img, (224, 224))
	img = img.astype(np.float32) / 255.0
	img = np.expand_dims(img, axis=0)
	return img


# Simple in-memory cache for Q->A to reduce repeated OpenAI calls
CACHE_TTL = int(os.environ.get('CHAT_CACHE_TTL', '300'))  # seconds
_qa_cache = globals().get('_qa_cache') or {}
globals()['_qa_cache'] = _qa_cache

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

# Decide whether to route to OpenAI based on intent/length. Short, direct intents use templates
def should_use_openai(q: str, force: bool = False) -> bool:
	if force:
		return True
	# if the question is long or contains open-ended words, use OpenAI
	if len(q) > 120:
		return True
	open_ended_kw = ['why', 'compare', 'difference', 'recommend', 'advice', 'how to', 'what is', '?']
	if any(kw in q.lower() for kw in open_ended_kw):
		return True
	# otherwise prefer local templates for clear intents
	return False


def call_gemini(question: str, model: str = None, max_output_tokens: int = 512, temperature: float = 0.2) -> Optional[str]:
	"""Call Google Generative API (Gemini) using API key if available.
	This uses the REST endpoint for text-bison style models. Returns the generated text or None on failure.
	"""
	key = os.environ.get('GEMINI_API_KEY') or GEMINI_API_KEY
	if not key:
		return None

	# prefer model from env or default to text-bison-001 style name
	model = model or os.environ.get('GEMINI_MODEL', 'text-bison-001')
	# endpoint for the Generative Language API (v1beta2) using API key param
	url = f'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={key}'

	payload = {
		'prompt': {
			'text': question
		},
		'temperature': float(temperature),
		'maxOutputTokens': int(max_output_tokens)
	}

	try:
		resp = requests.post(url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload), timeout=20)
		try:
			resp.raise_for_status()
		except Exception as e:
			# include response text for better diagnostics
			body = None
			try:
				body = resp.text
			except Exception:
				body = None
			print('Gemini HTTP error', getattr(resp, 'status_code', None), body)
			raise
		j = resp.json()
		# v1beta2 returns 'candidates' which include 'output' or 'content' depending on model
		# try several possible shapes
		if isinstance(j, dict):
			# check for 'candidates' -> first -> 'content'
			cand = j.get('candidates')
			if cand and isinstance(cand, list) and len(cand) > 0:
				first = cand[0]
				# content may be under 'content' or 'output'
				if isinstance(first, dict):
					return first.get('content') or first.get('output') or None
			# some responses have 'output' -> 'content'
			out = j.get('output')
			if out:
				if isinstance(out, dict):
					# 'output' may have 'sections' or 'text'
					txt = out.get('content') or out.get('text')
					if txt:
						return txt
		return None
	except Exception as e:
		# Provide more context for debug logs if available
		msg = str(e)
		if hasattr(e, 'response') and getattr(e.response, 'text', None):
			msg = f"{msg} | response: {e.response.text}"
		print('Gemini call failed:', msg)
		return None


@app.route("/predict", methods=["POST"])
def predict():
	if model is None:
		return jsonify({"error": "Model not available on server"}), 500

	if 'image' not in request.files:
		return jsonify({"error": "No image file provided (field 'image')"}), 400

	file = request.files['image']
	try:
		img_bytes = file.read()
		img_input = read_image_from_bytes(img_bytes)
		preds = model.predict(img_input)
		pred_idx = int(np.argmax(preds, axis=1)[0])
		confidence_frac = float(np.max(preds))
		# configurable minimum confidence to consider the image a dog/breed
		min_conf = float(os.environ.get('MIN_DOG_CONFIDENCE', '0.35'))
		if confidence_frac < min_conf:
			# return a helpful message for the predict UI
			return jsonify({"error": "please upload correct breed image"}), 400
		confidence = confidence_frac * 100.0
		if 0 <= pred_idx < len(BREED_NAMES):
			breed = BREED_NAMES[pred_idx]
		else:
			breed = str(pred_idx)

		return jsonify({"breed": breed, "confidence": confidence})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
	# Simple chatbot endpoint. If OPENAI_API_KEY is provided in env, proxy the request
	# to OpenAI's chat completions. Otherwise respond with a small rule-based helper.
	data = request.get_json() or {}
	question = (data.get('question') or '').strip()
	force_openai = bool(data.get('force_openai'))
	if not question:
		return jsonify({'error': 'No question provided'}), 400

	openai_key = os.environ.get('OPENAI_API_KEY')
	system_prompt = (
		"You are PawFinder Assistant — an expert dog-breed helper. Answer user questions about "
		"dog breeds, care recommendations, diet, temperament, and general guidance. Keep answers concise and friendly."
	)

	# Prefer LLMs for freeform questions. If the request explicitly sets `force_openai`,
	# try OpenAI first (if available). Otherwise, prefer Gemini when configured, then OpenAI.
	gemini_key = os.environ.get('GEMINI_API_KEY') or GEMINI_API_KEY

	# Helper: try Gemini with a small retry/backoff
	def try_gemini(q: str) -> Optional[str]:
		if not gemini_key:
			return None
		attempts = int(os.environ.get('GEMINI_MAX_ATTEMPTS', '2'))
		backoff_base = float(os.environ.get('GEMINI_BACKOFF_BASE', '1.0'))
		gemini_err = None
		for attempt in range(1, attempts + 1):
			try:
				res_text = call_gemini(q, model=os.environ.get('GEMINI_MODEL'))
				if res_text:
					try:
						cache_set(question_key(q), res_text)
					except Exception:
						pass
					return res_text
				gemini_err = 'No content from Gemini'
			except Exception as e:
				gemini_err = str(e)
				if attempt < attempts:
					wait = backoff_base * (2 ** (attempt - 1))
					try:
						time.sleep(wait)
					except Exception:
						pass
		print('Gemini attempts failed:', gemini_err)
		return None

	# Helper: try OpenAI with existing retry/backoff logic
	def try_openai(q: str) -> Optional[str]:
		client = openai_client or None
		if client is None:
			try:
				if openai_key:
					client = OpenAI(api_key=openai_key)
			except Exception as e:
				print('Failed to construct OpenAI client:', e)

		attempts = int(os.environ.get('OPENAI_MAX_ATTEMPTS', '3'))
		backoff_base = float(os.environ.get('OPENAI_BACKOFF_BASE', '1.0'))
		openai_err = None
		for attempt in range(1, attempts + 1):
			try:
				if client is None:
					raise RuntimeError('OpenAI client not available')

				resp = client.chat.completions.create(
					model=os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
					messages=[{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': q}],
					max_tokens=int(os.environ.get('OPENAI_MAX_TOKENS', '500')),
					temperature=float(os.environ.get('OPENAI_TEMPERATURE', '0.3')),
				)

				content = None
				if resp and getattr(resp, 'choices', None):
					choice = resp.choices[0]
					if hasattr(choice, 'message') and getattr(choice.message, 'content', None):
						content = choice.message.content
					elif isinstance(choice, dict):
						content = choice.get('message', {}).get('content')

				if content:
					try:
						cache_set(question_key(q), content)
					except Exception:
						pass
					return content

				openai_err = f'OpenAI returned no content: {resp}'
			except Exception as e:
				openai_err = str(e)
				if attempt < attempts:
					wait = backoff_base * (2 ** (attempt - 1))
					try:
						time.sleep(wait)
						continue
					except Exception:
						pass

		print('OpenAI attempts failed:', openai_err)
		return None

	# Attempt order:
	# 1) If client asked to force OpenAI, try OpenAI first (if key present)
	# 2) Otherwise, try Gemini if configured
	# 3) Then try OpenAI if configured
	if force_openai and openai_key:
		content = try_openai(question)
		if content:
			return jsonify({'answer': content, 'source': 'openai'})

	if gemini_key:
		content = try_gemini(question)
		if content:
			return jsonify({'answer': content, 'source': 'gemini'})

	if openai_key:
		content = try_openai(question)
		if content:
			return jsonify({'answer': content, 'source': 'openai'})

	# Enhanced fallback responder when OpenAI key is not set or OpenAI failed.
	# Check cache before computing templates
	try:
		cached = cache_get(question_key(question))
		if cached:
				return jsonify({'answer': cached, 'cached': True, 'source': 'cache'})
	except Exception:
		pass
	# Uses simple intent detection, template replies and will respond with
	# breed-aware answers when `BREED_NAMES` contains a breed mentioned in the question.
	q = question.lower()

	# try to detect a breed mentioned in the question (best-effort)
	mentioned_breed = None
	try:
		for b in BREED_NAMES:
			if not b:
				continue
			bn = b.lower().replace('_', ' ').replace('-', ' ')
			if bn in q or b.lower() in q:
				mentioned_breed = bn
				break
	except Exception:
		mentioned_breed = None

	# intent keywords
	grooming_kw = ['groom', 'grooming', 'brush', 'bath', 'trim']
	diet_kw = ['food', 'feed', 'diet', 'eat', 'feeding']
	exercise_kw = ['exercise', 'walk', 'walks', 'run', 'activity']
	train_kw = ['train', 'training', 'obedience', 'commands', 'sit', 'stay']
	health_kw = ['vet', 'vaccine', 'health', 'sick', 'illness', 'injury']

	def pick(templates):
		return random.choice(templates)

	if any(k in q for k in grooming_kw):
		templates = [
			f"Most dogs benefit from weekly brushing. {mentioned_breed + 's' if mentioned_breed else 'Long-haired breeds'} often need daily brushing and professional trims every 6–12 weeks.",
			f"Grooming frequency depends on coat type — short-haired breeds can be brushed weekly, while show or long-coated breeds need daily care. For {mentioned_breed or 'your dog'}, start with weekly brushing and increase as needed.",
			f"A good rule: brush 1–3 times/week for short coats and daily for long or double coats. Baths only as needed to avoid stripping natural oils. For {mentioned_breed or 'specific breeds'}, consult a groomer for styling and trim schedules."
		]
		answer = pick(templates)
		try:
			cache_set(question_key(question), answer)
		except Exception:
			pass
		return jsonify({'answer': answer})

	if any(k in q for k in diet_kw):
		templates = [
			f"Feed a high-quality, age-appropriate commercial food and follow the package portion guidelines as a starting point. For {mentioned_breed or 'larger/smaller breeds'}, portions and calorie density may differ.",
			f"Consider your dog's life stage (puppy, adult, senior) and activity level. Many owners use measured meals twice daily; treat portions should be small. Ask your vet for a tailored plan for {mentioned_breed or 'your dog'}.",
			f"Protein-first diets are common for active breeds. If you have weight concerns or allergies, work with a vet to pick the right formula for {mentioned_breed or 'your dog'}."
		]
		answer = pick(templates)
		try:
			cache_set(question_key(question), answer)
		except Exception:
			pass
		return jsonify({'answer': answer})

	if any(k in q for k in exercise_kw):
		templates = [
			f"Exercise needs vary: many companion breeds do well with 30–45 minutes/day, while working or herding breeds (e.g., Border Collie) often need 1–2 hours plus mental stimulation.",
			f"For {mentioned_breed if mentioned_breed else 'active breeds'}, include walks, play sessions, and puzzle toys to keep them happy. Short bursts of running or fetch are excellent for high-energy dogs.",
			f"Mix physical and mental exercise: training games, scent work, and interactive toys give great returns especially for intelligent breeds. Aim for at least 30–120 minutes depending on breed and age."
		]
		answer = pick(templates)
		try:
			cache_set(question_key(question), answer)
		except Exception:
			pass
		return jsonify({'answer': answer})

	if any(k in q for k in train_kw):
		templates = [
			f"Start training early with short, consistent sessions using positive reinforcement — treats, praise, and play. Consistency is more important than length for {mentioned_breed or 'most dogs'}.",
			f"Use reward-based training, keep sessions 5–15 minutes multiple times a day, and focus on one command at a time. Socialization is vital between 3–14 weeks.",
			f"If you struggle with reactivity or stubborn behaviors, consider a few sessions with a positive reinforcement trainer. For {mentioned_breed or 'some breeds'}, crate and name training work well."
		]
		answer = pick(templates)
		try:
			cache_set(question_key(question), answer)
		except Exception:
			pass
		return jsonify({'answer': answer})

	if any(k in q for k in health_kw):
		templates = [
			f"Health questions are best answered by a vet. For basic care, keep vaccinations, parasite preventatives, and regular checkups up to date — especially for {mentioned_breed or 'your breed'}.",
			f"If your dog shows signs of illness (loss of appetite, vomiting, lethargy), contact your veterinarian. For breed-specific health screens, ask your vet about recommended tests for {mentioned_breed or 'your dog'}."
		]
		answer = pick(templates)
		try:
			cache_set(question_key(question), answer)
		except Exception:
			pass
		return jsonify({'answer': answer})

	# Friendly fallback: produce a best-effort general answer rather than asking for more detail.
	def generate_general_answer(q: str, breed: Optional[str] = None) -> str:
		bpart = f" For {breed}, consider breed-specific needs." if breed else ""
		# If the user asked a short or generic question, provide a concise multi-part guidance
		guidance = []
		# Basic grooming guidance
		guidance.append("Grooming: frequency depends on coat type — short coats weekly, long or double coats daily brushing; bathe as needed.")
		# Diet guidance
		guidance.append("Diet: feed age-appropriate, high-quality food; monitor weight and consult a vet for special needs.")
		# Exercise guidance
		guidance.append("Exercise: most companion breeds need 30–60 minutes/day; working breeds need more activity and mental stimulation.")
		# Training/behavior
		guidance.append("Training: use short, consistent, reward-based sessions; socialize puppies early and be consistent with rules.")

		# If question contains some keywords, try to prioritize a matching section
		ql = q.lower()
		if any(kw in ql for kw in grooming_kw):
			return f"Grooming tips: {' ' + guidance[0] + bpart}"
		if any(kw in ql for kw in diet_kw):
			return f"Feeding guidance: {' ' + guidance[1] + bpart}"
		if any(kw in ql for kw in exercise_kw):
			return f"Exercise guidance: {' ' + guidance[2] + bpart}"
		if any(kw in ql for kw in train_kw):
			return f"Training basics: {' ' + guidance[3] + bpart}"

		# Otherwise provide a compact multi-part general answer
		return (
			f"Here’s a general overview you can start with:{bpart} "
			+ " ".join(guidance)
			+ " If you want more detail on any point, tell me which area (grooming, diet, exercise, training, or health)."
		)

	try:
		answer = generate_general_answer(question, mentioned_breed)
		cache_set(question_key(question), answer)
	except Exception:
		answer = "I can help with grooming, feeding, exercise, training, and basic health — tell me which area you'd like to start with."

	return jsonify({'answer': answer, 'source': 'fallback'})


@app.route('/verify-openai', methods=['GET'])
def verify_openai():
	"""Lightweight endpoint to verify OpenAI API key and return the raw response for diagnostics."""
	openai_key = os.environ.get('OPENAI_API_KEY')
	if not openai_key:
		return jsonify({'ok': False, 'error': 'OPENAI_API_KEY not set in server environment'}), 400

	try:
		url = 'https://api.openai.com/v1/chat/completions'
		headers = {
			'Authorization': f'Bearer {openai_key}',
			'Content-Type': 'application/json'
		}
		payload = {
			'model': os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
			'messages': [
				{'role': 'system', 'content': 'You are a diagnostic assistant. Reply with a short acknowledgement.'},
				{'role': 'user', 'content': 'Verify API access and return a short acknowledgement.'}
			],
			'max_tokens': 30,
			'temperature': 0.0,
		}
		resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=20)
		resp.raise_for_status()
		return jsonify({'ok': True, 'openai_raw': resp.json()})
	except Exception as e:
		return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/verify-gemini', methods=['GET'])
def verify_gemini():
	"""Lightweight endpoint to verify Gemini key (Generative Language API) using the provided API key.
	Returns the raw response or an error message.
	"""
	key = os.environ.get('GEMINI_API_KEY') or GEMINI_API_KEY
	if not key:
		return jsonify({'ok': False, 'error': 'GEMINI_API_KEY not set in server environment'}), 400

	model = os.environ.get('GEMINI_MODEL', 'text-bison-001')
	url = f'https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={key}'
	payload = {
		'prompt': {'text': 'Verify Gemini API access and reply with a short acknowledgement.'},
		'maxOutputTokens': 40,
		'temperature': 0.0
	}
	try:
		resp = requests.post(url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload), timeout=20)
		resp.raise_for_status()
		return jsonify({'ok': True, 'gemini_raw': resp.json()})
	except Exception as e:
		return jsonify({'ok': False, 'error': str(e)}), 500


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
		# best-effort: print error but don't crash
		print('Failed to write orders file:', e)


@app.route('/order', methods=['POST'])
def create_order():
	"""Create a new order.

	Expected JSON shape:
	{
	  "user": {"name": "Alice", "email": "a@b.com", "phone": "123", "address": "..."},
	  "items": [{"id":"x","name":"Dog Food","qty":1,"price":299}],
	  "payment_method": "cod" | "online",
	  "notes": "optional"
	}
	"""
	data = request.get_json() or {}
	user = data.get('user') or {}
	items = data.get('items') or data.get('cart') or []
	payment = (data.get('payment_method') or data.get('payment') or 'cod').lower()
	notes = data.get('notes')

	# basic validation
	if not user.get('name') or not user.get('address'):
		return jsonify({'error': 'user.name and user.address are required'}), 400
	if payment not in ('cod', 'online'):
		return jsonify({'error': 'payment_method must be "cod" or "online"'}), 400

	# compute a simple total if price provided
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

	# For COD we accept immediately; for 'online' we mark as awaiting_payment
	if payment == 'online':
		order['status'] = 'awaiting_payment'

	return jsonify({'ok': True, 'order_id': order_id, 'order': order}), 200


@app.route('/orders', methods=['GET'])
def list_orders():
	# simple dev-only listing; no auth
	orders = _read_orders()
	return jsonify({'count': len(orders), 'orders': orders})


if __name__ == "__main__":
	# default host/port for local dev
	# run without the debugger/reloader for more stable single-process behavior
	app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

