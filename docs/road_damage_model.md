# Road Damage AI Model Documentation

## Overview
Model card for the NagarSeva AI Road Damage Detection system trained on RDD2022 dataset.

## Model Configuration & Parameters
- **Dataset**: RDD2022 (Road Damage Dataset 2022)
- **Classes**: 4 (`longitudinal_crack`, `transverse_crack`, `alligator_crack`, `pothole`)
- **YOLO Architecture**: YOLOv11 Nano (`yolo11n.pt`)
- **Training Date**: 2026-08-06
- **Epochs**: 50
- **Batch Size**: 8
- **Image Size**: 640 x 640
- **Hardware Acceleration**: Apple Silicon M2 GPU (`MPS`)
- **Workers**: 2

## Model Metrics (Validation Set)
*(To be populated following completion of the training run)*

- **Precision**: Pending...
- **Recall**: Pending...
- **mAP50**: Pending...
- **mAP50-95**: Pending...

## Saved Model Weights
- **Local Path**: `runs/road_damage_v1/weights/best.pt`
- **Versioned Model Artifact**: `models/road_damage/v1_best.pt`
