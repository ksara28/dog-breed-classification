import os
import cv2
import shutil
import imagehash
import numpy as np
from PIL import Image, ImageDraw
from tqdm import tqdm

# ---------------- SETTINGS ---------------- #
dataset_path = r"C:\Users\saraswathi\Downloads\archive\images\images"
placeholder_path = r"C:\Users\saraswathi\Downloads\archive\placeholder.jpg"
target_size = (224, 224)
blur_threshold = 100
batch_size = 1000
hashes = {}
log_file = "cleaning_log.txt"

# ---------------- HELPER ---------------- #
def create_placeholder():
    """Creates a placeholder image if missing."""
    if not os.path.exists(placeholder_path):
        print("🖼️ Creating placeholder image...")
        img = Image.new("RGB", target_size, (180, 180, 180))
        draw = ImageDraw.Draw(img)
        draw.text((40, 100), "Placeholder", fill=(0, 0, 0))
        img.save(placeholder_path)
        print(f"✅ Created at: {placeholder_path}")

# ---------------- CLEANING FUNCTION ---------------- #
def clean_images():
    create_placeholder()

    # Collect all image file paths recursively
    all_files = []
    for root, _, files in os.walk(dataset_path):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                all_files.append(os.path.join(root, f))

    print(f"📂 Found {len(all_files)} images. Starting cleaning...")

    with open(log_file, "w", encoding="utf-8") as log:
        log.write("file_path,reason\n")

        for start in range(0, len(all_files), batch_size):
            batch = all_files[start:start + batch_size]
            print(f"\n⚡ Processing batch {start // batch_size + 1} ({len(batch)} images)...")

            for file_path in tqdm(batch, desc=f"Batch {start // batch_size + 1}", ncols=90):
                try:
                    # Step 1: Corruption check
                    img = Image.open(file_path)
                    img.verify()

                    # Reload image after verify
                    img = Image.open(file_path)
                    img = img.convert("RGB")
                    img = img.resize(target_size)
                    img.save(file_path)

                    # Step 2: Duplicate detection
                    img_hash = imagehash.average_hash(img)
                    if img_hash in hashes:
                        shutil.copy(placeholder_path, file_path)
                        log.write(f"{file_path},duplicate_replaced\n")
                        continue
                    else:
                        hashes[img_hash] = file_path

                    # Step 3: Blur detection
                    cv_img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
                    if cv_img is None:
                        shutil.copy(placeholder_path, file_path)
                        log.write(f"{file_path},corrupted_replaced\n")
                        continue

                    fm = cv2.Laplacian(cv_img, cv2.CV_64F).var()
                    if fm < blur_threshold:
                        shutil.copy(placeholder_path, file_path)
                        log.write(f"{file_path},blurry_replaced\n")
                        continue

                except Exception as e:
                    # If anything fails, safely replace with placeholder
                    try:
                        shutil.copy(placeholder_path, file_path)
                        log.write(f"{file_path},error:{str(e)}\n")
                    except Exception:
                        pass

    print("\n✅ Cleaning complete! Check 'cleaning_log.txt' for details.")

# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    clean_images()
