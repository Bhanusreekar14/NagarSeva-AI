from ultralytics import YOLO

model = YOLO("yolo11n.pt")

model.train(
    data="datasets/garbage/data.yaml",
    epochs=50,
    imgsz=640,
    batch=8,
    device="mps",
    workers=2,
    project="runs",
    name="garbage_v1"
)
