from ultralytics import YOLO

model = YOLO("runs/garbage_v1/weights/best.pt")

metrics = model.val()

print(metrics)
