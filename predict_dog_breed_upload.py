import tensorflow as tf
import numpy as np
import cv2
import os
import matplotlib.pyplot as plt
from tkinter import Tk, filedialog

# ✅ Hide the root tkinter window
Tk().withdraw()

# ✅ Ask user to upload image
print("📁 Please select a dog image to predict:")
IMAGE_PATH = filedialog.askopenfilename(
    title="Select Dog Image",
    filetypes=[("Image files", "*.jpg *.jpeg *.png")]
)

if not IMAGE_PATH:
    print("⚠️ No image selected. Exiting...")
    exit()

# ✅ Paths
MODEL_PATH = "dog_breed_model.h5"   # trained model path
DATA_DIR = r"C:\Users\saraswathi\Downloads\archive\images\Images"  # dataset folder for breed names

# ✅ Load model
print("\n🔄 Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully!")

# ✅ Get breed names
breed_names = sorted(os.listdir(DATA_DIR))
print(f"📂 Found {len(breed_names)} breeds")

# ✅ Load and preprocess image
print(f"\n🖼️ Processing: {os.path.basename(IMAGE_PATH)}")
img = cv2.imread(IMAGE_PATH)
if img is None:
    raise FileNotFoundError(f"Image not found at {IMAGE_PATH}")

img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img_resized = cv2.resize(img_rgb, (224, 224))
img_array = np.expand_dims(img_resized / 255.0, axis=0)

# ✅ Predict
print("🔍 Predicting breed...")
predictions = model.predict(img_array)
pred_idx = np.argmax(predictions)
confidence = np.max(predictions) * 100
pred_breed = breed_names[pred_idx]

# ✅ Print results
print("\n============================")
print(f"🐾 Predicted Breed: {pred_breed}")
print(f"🎯 Confidence: {confidence:.2f}%")
print("============================")

# ✅ Display the image with prediction
plt.imshow(img_rgb)
plt.title(f"{pred_breed}\nConfidence: {confidence:.2f}%")
plt.axis("off")
plt.show()
