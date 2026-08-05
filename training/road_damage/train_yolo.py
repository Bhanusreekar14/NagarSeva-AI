import os
import shutil
# pyrefly: ignore [missing-import]
import torch
import ultralytics
from ultralytics import YOLO

def main():
    print("=== NagarSeva-AI — YOLO Road Damage Training Pipeline ===")
    print(f"PyTorch Version: {torch.__version__}")
    print(f"Ultralytics Version: {ultralytics.__version__}")
    
    device = 'mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Hardware Accelerator: {device.upper()}")
    
    config_path = 'configs/dataset.yaml'
    if not os.path.exists(config_path):
        config_path = '../../configs/dataset.yaml'
        
    print(f"Loading dataset configuration from: {config_path}")
    
    # Initialize YOLO model
    model = YOLO('yolov8n.pt')
    
    print("Starting YOLO Model Training on RDD2022...")
    results = model.train(
        data=config_path,
        epochs=50,
        imgsz=640,
        batch=16,
        device=device,
        project='runs/road_damage',
        name='rdd2022_yolo'
    )
    
    print("\nModel Training Complete!")
    
    # Save best weights to models/road_damage/best.pt
    save_dir = getattr(model.trainer, 'save_dir', 'runs/road_damage/rdd2022_yolo')
    best_weights_src = os.path.join(save_dir, 'weights', 'best.pt')
    dest_weights = 'models/road_damage/best.pt'
    
    os.makedirs('models/road_damage', exist_ok=True)
    if os.path.exists(best_weights_src):
        shutil.copy(best_weights_src, dest_weights)
        print(f"✅ Production Model Weights saved to: {dest_weights}")
    else:
        print(f"⚠️ Warning: Could not locate weights at {best_weights_src}")

if __name__ == '__main__':
    main()
