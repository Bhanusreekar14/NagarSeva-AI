# NagarSeva AI – System Architecture

## System Overview
NagarSeva AI is an intelligent civic issue management and automated routing system. It leverages computer vision models and multi-agent AI workflows to detect, classify, prioritize, and route municipal complaints uploaded by citizens.

```
                  ┌─────────────────────────────────────────┐
                  │            Citizen Input                │
                  │        (Text / Image Upload)            │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             FastAPI Backend             │
                  │              (Port 8000)                │
                  └────────────────────┬────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │ Road Damage AI   │    │ Garbage AI (P4)  │    │ Flood AI (P5)    │
    │ (YOLOv11n)       │    │ (YOLOv11n)       │    │ (YOLOv11n)       │
    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────────┐
                  │        Standardized 311 Taxonomy        │
                  │               Mapping                   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Structured Output            │
                  │   Category | Department | Severity      │
                  └─────────────────────────────────────────┘
```

## Core Modules & Design Patterns

### 1. Computer Vision Layer
- Model Framework: Ultralytics YOLOv11
- Image Router Layer: `backend/app/services/image_router.py` centralizes image domain dispatching.
- Model Placement: `backend/app/ml/<module>/best.pt`
- Image Pipeline: Input image -> Temp `backend/uploads/` storage -> Image Router -> Domain Model (Road Damage / Garbage / Flood) -> 311 Business Mapping -> Standardized JSON Response.


### 2. Standardized 311 Taxonomy
Mappings harmonize raw object detection labels into actionable municipal categories, default departments, and severity levels.
- **Pothole / Cracks** -> Category: `ROAD_INFRASTRUCTURE`, Department: `Roads Department`

### 3. Modular Backend Architecture
- `routers/`: Endpoint handlers and request validation
- `services/`: Inference & business logic orchestration
- `schemas/`: Pydantic input/output contracts
- `utils/`: Mappings and helper functions
- `ml/`: Model weights & isolated ML artifacts
