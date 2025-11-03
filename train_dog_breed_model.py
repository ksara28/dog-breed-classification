import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

# ✅ Paths
DATA_DIR = r"C:\Users\saraswathi\Downloads\archive\images\Images"
MODEL_PATH = "dog_breed_model.h5"

# ✅ Hyperparameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS_STAGE1 = 5     # Initial training with frozen base
EPOCHS_STAGE2 = 10    # Fine-tuning with unfreezed layers
LR_STAGE1 = 1e-4
LR_STAGE2 = 1e-5

# ✅ Data Augmentation
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True
)

train_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    subset='training'
)

val_gen = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    subset='validation'
)

# ✅ Base model (Transfer Learning)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224,224,3))
base_model.trainable = False  # freeze base initially

x = GlobalAveragePooling2D()(base_model.output)
x = Dropout(0.3)(x)
x = Dense(128, activation='relu')(x)
output = Dense(train_gen.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)

# ✅ Compile (Stage 1)
model.compile(optimizer=Adam(learning_rate=LR_STAGE1),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

print("\n🚀 Stage 1: Training top layers...")
history1 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_STAGE1
)

# ✅ Fine-tuning (Stage 2)
print("\n🎯 Stage 2: Fine-tuning deeper layers...")
base_model.trainable = True
for layer in base_model.layers[:-20]:  # freeze all except last 20 layers
    layer.trainable = False

# Recompile with smaller learning rate
model.compile(optimizer=Adam(learning_rate=LR_STAGE2),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

history2 = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS_STAGE2
)

# ✅ Save model
model.save(MODEL_PATH)
print(f"\n✅ Model saved as {MODEL_PATH}")

# ✅ Evaluate
val_loss, val_acc = model.evaluate(val_gen)
print(f"🎯 Final Validation Accuracy: {val_acc*100:.2f}%")

# ✅ Plot Accuracy Curves
plt.figure(figsize=(8,4))
plt.plot(history1.history['accuracy'] + history2.history['accuracy'], label='train acc')
plt.plot(history1.history['val_accuracy'] + history2.history['val_accuracy'], label='val acc')
plt.legend()
plt.title("Training Accuracy")
plt.xlabel("Epochs")
plt.ylabel("Accuracy")
plt.show()
