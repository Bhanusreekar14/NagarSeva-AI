import os
import shutil
# pyrefly: ignore [missing-import]
import torch
from ultralytics import YOLO

def train():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    yaml_path = os.path.abspath(os.path.join(script_dir, "../../datasets/road_damage/data.yaml"))
    
    if not os.path.exists(yaml_path):
        yaml_path = os.path.abspath(os.path.join(script_dir, "../../configs/data.yaml"))
        
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"=== Starting YOLO Road Damage Training ===")
    print(f"Dataset YAML: {yaml_path}")
    print(f"Hardware Acceleration Device: {device.upper()}")
    
    model = YOLO("yolo11n.pt")
    
    model.train(
        data=yaml_path,
        epochs=50,
        imgsz=640,
        batch=16,
        device=device,
        project="runs",
        name="road_damage"
    )
    
    # Save model to models/road_damage/best.pt
    best_src = os.path.abspath("runs/road_damage/weights/best.pt")
    if not os.path.exists(best_src):
        best_src = os.path.abspath("runs/detect/train/weights/best.pt")
        
    dest_dir = os.path.abspath(os.path.join(script_dir, "../../models/road_damage"))
    os.makedirs(dest_dir, exist_ok=True)
    best_dest = os.path.join(dest_dir, "best.pt")
    
    if os.path.exists(best_src):
        shutil.copy(best_src, best_dest)
        print(f"✅ Production Model saved to: {best_dest}")
    else:
        print(f"⚠️ Warning: Could not locate best weights at {best_src}")

if __name__ == "__main__":
    train()
