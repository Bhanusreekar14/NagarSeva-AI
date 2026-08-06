from ultralytics import YOLO
from pathlib import Path
import os

# Primary model paths in order of preference
MODEL_PATH = Path("backend/app/ml/road_damage/best.pt")

model = None

def get_model_path() -> Path:
    alt_paths = [
        Path("backend/app/ml/road_damage/best.pt"),
        Path("app/ml/road_damage/best.pt"),
        Path("models/road_damage/best.pt"),
        Path("../models/road_damage/best.pt"),
        Path("runs/road_damage/weights/best.pt"),
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


def predict(image_path):
    model_instance = load_model()

    results = model_instance.predict(
        source=image_path,
        conf=0.5,
        verbose=False
    )

    return results
