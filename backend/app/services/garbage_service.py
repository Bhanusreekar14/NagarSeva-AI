from ultralytics import YOLO
from pathlib import Path
import os

MODEL_PATH = Path("runs/garbage_v1/weights/best.pt")

model = None

def get_model_path() -> Path:
    alt_paths = [
        Path("runs/garbage_v1/weights/best.pt"),
        Path("models/garbage/best.pt"),
        Path("../models/garbage/best.pt"),
        Path("backend/app/ml/garbage/best.pt"),
        Path("app/ml/garbage/best.pt"),
        Path("yolo11n.pt"),
        Path("yolov8n.pt")
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
    model_instance = load_model()

    results = model_instance.predict(
        source=image_path,
        conf=0.5,
        verbose=False
    )

    return results
