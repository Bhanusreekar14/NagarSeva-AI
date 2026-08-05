import os
# pyrefly: ignore [missing-import]
from ultralytics import YOLO

def evaluate():
    weights = "runs/road_damage/weights/best.pt"
    if not os.path.exists(weights):
        weights = "models/road_damage/best.pt"
    if not os.path.exists(weights):
        weights = "yolov8n.pt"

    model = YOLO(weights)
    metrics = model.val()
    print(metrics)

if __name__ == "__main__":
    evaluate()
