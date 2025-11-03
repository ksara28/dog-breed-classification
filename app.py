
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import io

app = Flask(__name__)
CORS(app)

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
		confidence = float(np.max(preds)) * 100.0
		if 0 <= pred_idx < len(BREED_NAMES):
			breed = BREED_NAMES[pred_idx]
		else:
			breed = str(pred_idx)

		return jsonify({"breed": breed, "confidence": confidence})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
	# default host/port for local dev
	app.run(host="0.0.0.0", port=5000, debug=True)

