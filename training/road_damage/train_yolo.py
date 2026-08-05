import os
import shutil
import torch
import ultralytics
from ultralytics import YOLO

def main():
    print("=== NagarSeva-AI — YOLO Road Damage Training Pipeline ===")
    print(f"PyTorch Version: {torch.__version__}")
    print(f"Ultralytics Version: {ultralytics.__version__}")
    
    device = 'mps' if torch.backends.mps.is_available() else ('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Hardware Accelerator: {device.upper()}")
    
    config_path = 'datasets/road_damage/data.yaml'
    print(f"Loading dataset configuration from: {config_path}")
    
    # Initialize YOLO model
    model = YOLO('yolo11n.pt')
    
    print("Starting YOLO Model Training on RDD2022...")
    results = model.train(
        data=config_path,
        epochs=50,
        imgsz=640,
        batch=8,
        device=device,
        workers=2,
        project='runs',
        name='road_damage_v1'
    )
    
    print("\nModel Training Complete!")
    
    save_dir = getattr(model.trainer, 'save_dir', 'runs/road_damage_v1')
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
