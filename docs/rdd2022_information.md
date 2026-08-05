# 🛣️ RDD2022 Road Damage Dataset Documentation

Welcome to the technical dataset specification for **RDD2022** (Road Damage Detection 2022 Benchmark Dataset) integrated into **NagarSeva-AI**.

---

## 📊 Dataset Overview & Statistics

| Metric | Value |
| :--- | :--- |
| **Total Images** | 43,801 images |
| **Total Bounding Boxes** | 66,921 annotations |
| **Participating Countries** | 6 countries (India, Japan, Norway, Czech Republic, United States, China) + Augmented |
| **Annotation Format** | YOLO normalized format (`class_id x_center y_center width height`) |
| **Target Task** | Computer Vision / Object Detection for Urban Infrastructure |

---

## 🌍 Country Breakdown across Splits

| Country | Train Split | Validation Split | Test Split | Total Images |
| :--- | :--- | :--- | :--- | :--- |
| **Augmented** | 11,143 | 976 | 974 | **13,093** |
| **Japan** | 7,173 | 606 | 627 | **8,406** |
| **Norway** | 5,538 | 540 | 465 | **6,543** |
| **India** | 5,252 | 446 | 490 | **6,188** |
| **United States** | 3,256 | 302 | 265 | **3,823** |
| **China** | 2,940 | 249 | 274 | **3,463** |
| **Czech Republic** | 1,928 | 167 | 190 | **2,285** |
| **TOTAL** | **37,230** | **3,286** | **3,285** | **43,801** |

---

## 🏷️ Class Taxonomy Mapping

RDD2022 uses technical damage codes (`D00`, `D10`, `D20`, `D40`). For NagarSeva-AI, these are mapped to intuitive visual damage classes and unified under the project's master NLP taxonomy category (**`ROAD_INFRASTRUCTURE`**).

| YOLO Class ID | RDD Code | Original Description | Visual Class Name | Master Taxonomy Category | Total Bounding Boxes |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **0** | `D00` | Longitudinal Crack | `ROAD_CRACK` | `ROAD_INFRASTRUCTURE` | 20,695 (30.9%) |
| **1** | `D10` | Transverse Crack | `ROAD_CRACK` | `ROAD_INFRASTRUCTURE` | 18,858 (28.2%) |
| **2** | `D20` | Alligator Crack | `ROAD_DAMAGE` | `ROAD_INFRASTRUCTURE` | 16,866 (25.2%) |
| **3** | `D40` | Pothole | `POTHOLE` | `ROAD_INFRASTRUCTURE` | 10,502 (15.7%) |

---

## 📐 Annotation Format

Labels are stored in standard YOLO normalized format inside `.txt` files:

```text
<class_id> <x_center> <y_center> <width> <height>
```
*Where coordinates `(x_center, y_center, width, height)` are normalized between `[0, 1]` relative to image dimensions.*

### Coordinate Conversion Formula:
```python
xmin = int((x_center - width / 2) * img_width)
ymin = int((y_center - height / 2) * img_height)
xmax = int((x_center + width / 2) * img_width)
ymax = int((y_center + height / 2) * img_height)
```

---

## 🚀 Live AI Pipeline Flow in NagarSeva-AI

```
Citizen Uploads Road Photo
           │
           ▼
YOLO Object Detection Model (Trained on RDD2022)
           │
           ├── Detects: Pothole / Alligator Crack / Longitudinal Crack
           └── Confidence Score: 98%
           │
           ▼
Mapped to Unified Category: ROAD_INFRASTRUCTURE
           │
           ▼
FastAPI Backend Endpoint (/api/v1/complaints/auto-create)
           │
           ▼
Complaint Created Automatically in NagarSeva-AI System!
```
