from ultralytics import YOLO
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent # backend root directory
ROOT_DIR = BASE_DIR.parent # repository root directory

MODEL_PATH = BASE_DIR / "app/ml/road_damage/best.pt"

model = None

def get_model_path() -> Path:
    alt_paths = [
        BASE_DIR / "app/ml/road_damage/best.pt",
        ROOT_DIR / "models/road_damage/best.pt",
        BASE_DIR / "models/road_damage/best.pt",
        ROOT_DIR / "runs/road_damage/weights/best.pt",
        ROOT_DIR / "yolo11n.pt",
        ROOT_DIR / "yolov8n.pt",
        BASE_DIR / "yolo11n.pt",
        BASE_DIR / "yolov8n.pt"
    ]
    for p in alt_paths:
        if p.exists():
            return p
    return ROOT_DIR / "yolov8n.pt"

def load_model():
    global model
    if model is None:
        target_path = get_model_path()
        if not target_path or not target_path.exists():
            return None
        model = YOLO(target_path)
    return model


def predict(image_path: str):
    try:
        model_instance = load_model()
        if model_instance is None:
            return []
        results = model_instance.predict(
            source=image_path,
            conf=0.25,
            device="cpu",
            verbose=False
        )
        return results
    except Exception as e:
        print(f"[Road Damage AI] Prediction failed for {image_path}: {e}")
        return []

