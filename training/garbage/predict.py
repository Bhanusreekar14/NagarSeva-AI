from ultralytics import YOLO

model = YOLO("runs/garbage_v1/weights/best.pt")

results = model.predict(
    source="sample.jpg",
    conf=0.5,
    save=True
)

for result in results:
    print(result.boxes)
