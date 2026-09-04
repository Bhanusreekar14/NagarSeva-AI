from ultralytics import YOLO
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent # backend root directory
ROOT_DIR = BASE_DIR.parent # repository root directory

MODEL_PATH = ROOT_DIR / "runs/garbage_v1/weights/best.pt"

model = None

def get_model_path() -> Path:
    alt_paths = [
        ROOT_DIR / "runs/garbage_v1/weights/best.pt",
        ROOT_DIR / "models/garbage/best.pt",
        BASE_DIR / "app/ml/garbage/best.pt",
        BASE_DIR / "models/garbage/best.pt",
        ROOT_DIR / "yolo11n.pt",
        ROOT_DIR / "yolov8n.pt",
        BASE_DIR / "yolo11n.pt",
        BASE_DIR / "yolov8n.pt"
    ]
    for p in alt_paths:
        if p.exists():
            return p
    return MODEL_PATH

def load_model():
    global model
    if model is None:
        target_path = get_model_path()
        model = YOLO(target_path)
    return model

def predict(image_path: str):
    try:
        model_instance = load_model()
        results = model_instance.predict(
            source=image_path,
            conf=0.5,
            verbose=False
        )
        return results
    except Exception as e:
        print(f"[Garbage AI] Prediction failed for {image_path}: {e}")
        return []

