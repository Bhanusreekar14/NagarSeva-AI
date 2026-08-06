# Garbage Detection AI Model Documentation

## Model
YOLOv11n (`yolo11n.pt`)

## Dataset
Roboflow Material Identification (`garbage-classification-3`)

## Training Configuration

Epochs: 50

Image Size: 640

Batch Size: 8

Device: Apple M2 (MPS)

Workers: 2

Project: `runs`

Name: `garbage_v1`

## Metrics

Precision: *(To be populated post-training)*

Recall: *(To be populated post-training)*

mAP50: *(To be populated post-training)*

mAP50-95: *(To be populated post-training)*

## Output Classes

- BIODEGRADABLE
- CARDBOARD
- GLASS
- METAL
- PAPER
- PLASTIC

## API Endpoint Integration

- **Endpoint**: `POST /garbage/detect`
- **Department**: `Sanitation Department`
- **Response Format**:
```json
{
  "success": true,
  "detected": true,
  "category": "GARBAGE_WASTE",
  "sub_category": "Plastic",
  "confidence": 0.98,
  "severity": "High",
  "department": "Sanitation Department"
}
```
