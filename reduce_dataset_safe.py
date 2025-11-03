import os
import cv2
import shutil
from tqdm import tqdm

# ✅ Correct dataset path
DATASET_DIR = r"C:\Users\saraswathi\Downloads\archive\images\Images"
REMOVED_DIR = r"C:\Users\saraswathi\Downloads\archive\removed_images"

os.makedirs(REMOVED_DIR, exist_ok=True)

def image_quality_score(img_path):
    try:
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return 0
        return cv2.Laplacian(img, cv2.CV_64F).var()
    except:
        return 0

breed_folders = [f for f in os.listdir(DATASET_DIR) if os.path.isdir(os.path.join(DATASET_DIR, f))]
if not breed_folders:
    print("⚠️ No breed folders found! Check DATASET_DIR path.")
    exit()

for breed_folder in tqdm(breed_folders, desc="Processing breeds"):
    breed_path = os.path.join(DATASET_DIR, breed_folder)
    image_files = [os.path.join(breed_path, f)
                   for f in os.listdir(breed_path)
                   if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    if len(image_files) <= 50:
        print(f"✅ {breed_folder}: only {len(image_files)} images, skipped.")
        continue

    # Rank images by sharpness × file size (for quality)
    scored_images = []
    for img_path in image_files:
        sharpness = image_quality_score(img_path)
        size = os.path.getsize(img_path)
        score = sharpness * (size / 1024)
        scored_images.append((img_path, score))

    scored_images.sort(key=lambda x: x[1], reverse=True)
    best_images = scored_images[:50]
    best_paths = set([img[0] for img in best_images])

    # Move extras
    removed_breed_dir = os.path.join(REMOVED_DIR, breed_folder)
    os.makedirs(removed_breed_dir, exist_ok=True)

    for img_path, _ in scored_images[50:]:
        shutil.move(img_path, os.path.join(removed_breed_dir, os.path.basename(img_path)))

    print(f"✅ {breed_folder}: kept 50 / moved {len(scored_images) - 50}")

print("\n🎯 Finished: 50 best-quality images per breed kept.")
