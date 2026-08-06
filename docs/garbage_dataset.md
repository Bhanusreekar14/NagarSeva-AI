# Garbage Detection Dataset Documentation

## Overview
Dataset specification for the NagarSeva AI Garbage Classification & Detection module.

## Dataset Summary
- **Source**: Roboflow Universe (`garbage-classification-3`)
- **Annotation Format**: YOLO Standard Format (Bounding Boxes)
- **Total Images**: 10,464
- **Splits**:
  - **Train**: 7,324 images (70%)
  - **Validation**: 2,098 images (20%)
  - **Test**: 1,042 images (10%)
- **Number of Classes**: 6
- **Output Class Names**:
  - `BIODEGRADABLE`
  - `CARDBOARD`
  - `GLASS`
  - `METAL`
  - `PAPER`
  - `PLASTIC`

## Directory Structure
```
datasets/garbage/
├── train/
│   ├── images/
│   └── labels/
├── valid/
│   ├── images/
│   └── labels/
├── test/
│   ├── images/
│   └── labels/
└── data.yaml
```
