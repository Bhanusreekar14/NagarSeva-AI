import sys
import json
import os
from ultralytics import YOLO

BUSINESS_CATEGORY_MAP = {
    "pothole": "ROAD_INFRASTRUCTURE",
    "longitudinal_crack": "ROAD_INFRASTRUCTURE",
    "transverse_crack": "ROAD_INFRASTRUCTURE",
    "alligator_crack": "ROAD_INFRASTRUCTURE"
}

def predict(source="test.jpg", conf=0.5):
    weights = "runs/road_damage/weights/best.pt"
    if not os.path.exists(weights):
        weights = "models/road_damage/best.pt"
    if not os.path.exists(weights):
        weights = "yolov8n.pt"

    model = YOLO(weights)
    results = model.predict(
        source=source,
        save=True,
        conf=conf
    )

    outputs = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            obj_name = model.names[cls_id]
            confidence = round(float(box.conf[0]), 2)
            
            outputs.append({
                "detected": True,
                "object": obj_name,
                "confidence": confidence,
                "business_category": BUSINESS_CATEGORY_MAP.get(obj_name, "ROAD_INFRASTRUCTURE")
            })

    if not outputs:
        outputs.append({
            "detected": False,
            "object": None,
            "confidence": 0.0,
            "business_category": "ROAD_INFRASTRUCTURE"
        })

    return outputs

if __name__ == "__main__":
    img_path = sys.argv[1] if len(sys.argv) > 1 else "test.jpg"
    predictions = predict(img_path)
    print(json.dumps(predictions, indent=2))
