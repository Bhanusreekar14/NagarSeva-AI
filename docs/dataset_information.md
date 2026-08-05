# 📦 NagarSeva-AI — Dataset Information & Catalog

Welcome to the central dataset catalog for **NagarSeva-AI**, an AI-powered urban governance and civic issue management system. This document provides a comprehensive overview of the multimodal datasets organized within the project repository.

---

## 📁 Repository Dataset Architecture

All datasets are structured under the `datasets/` root directory to separate raw inputs, processed features, and model metadata:

```
datasets/
├── complaints/           # Tabular 311 civic service request logs
├── road_damage/          # Multi-class road damage detection benchmark (RDD2022)
├── potholes/             # Binary classification dataset for pothole identification
├── garbage/              # Waste classification dataset across 10 category classes
├── flood/                # Computer vision dataset for urban flood monitoring
├── processed/            # Preprocessed feature tables, embeddings, and tensor arrays
└── metadata/             # Dataset manifests, class index mappings, and data splits
```

---

## 📊 Summary of Datasets

| Dataset | Type / Modality | Scale / Size | Classes / Features | Primary AI Task |
| :--- | :--- | :--- | :--- | :--- |
| **311 Service Requests** | Tabular (CSV) | 287,993 records | 37 columns | SLA prediction, priority routing, spatial clustering |
| **RDD2022** | Computer Vision (Bounding Boxes) | 43,801 images / 87,604 files | Multi-class damage (D00, D10, D20, D40) | Object detection for road surface damage |
| **Pothole Detection** | Computer Vision (Classification) | 681 images | 2 classes (`potholes`, `normal`) | Binary pothole detection & severity filtering |
| **Garbage Classification** | Computer Vision (Multi-resolution) | 12,259 images × 3 formats | 10 classes (`paper`, `plastic`, `metal`, etc.) | Waste type classification & dump overflow audit |
| **Flood Detection** | Computer Vision (Detection / Labels) | 441 images + labels | Flood scene bounding annotations | Waterlogging & urban flood detection |

---

## 🔍 Detailed Dataset Specifications

### 1. 📋 311 Service Requests (`datasets/complaints/`)
- **File Name:** `311_Service_Requests.csv`
- **Record Count:** 287,993 rows
- **Feature Count:** 37 attributes
- **Key Columns:**
  - **Identifiers:** `SERVICEREQUESTID`, `OBJECTID`, `GLOBALID`
  - **Categorical:** `SERVICECODEDESCRIPTION`, `SERVICETYPECODEDESCRIPTION`, `ORGANIZATIONACRONYM`, `PRIORITY`, `SERVICEORDERSTATUS`
  - **Temporal:** `ADDDATE`, `RESOLUTIONDATE`, `SERVICEDUEDATE`, `SERVICEORDERDATE`
  - **Geographic:** `LATITUDE`, `LONGITUDE`, `WARD`, `STREETADDRESS`, `ZIPCODE`, `XCOORD`, `YCOORD`
- **Use Cases:** 
  - Exploratory Data Analysis (EDA) of municipal workloads.
  - Predicting SLA compliance breaches (`RESOLUTIONDATE > SERVICEDUEDATE`).
  - Spatial hotspot clustering across city Wards.

---

### 2. 🛣️ Road Damage Detection 2022 (`datasets/road_damage/RDD2022/`)
- **Directory:** `datasets/road_damage/RDD2022/`
- **Total Images:** 43,801 images
- **Splits:**
  - **Train:** 37,230 images + 37,230 annotation files
  - **Validation:** 3,286 images + 3,286 annotation files
  - **Test:** 3,285 images + 3,285 annotation files
- **Target Classes:** Longitudinal Crack (`D00`), Transverse Crack (`D10`), Alligator Crack (`D20`), Pothole (`D40`).
- **Use Cases:** Training YOLOv8 / Faster R-CNN models for automated road inspection via mobile or dashcam cameras.

---

### 3. 🕳️ Pothole Detection (`datasets/potholes/Pothole_Detection/`)
- **Directory:** `datasets/potholes/Pothole_Detection/`
- **Total Images:** 681 images
- **Class Breakdown:**
  - `potholes/`: 329 images of damaged road surfaces with visible potholes
  - `normal/`: 352 images of clear, undamaged road surfaces
- **Use Cases:** Lightweight edge classification (MobileNet / EfficientNet) for quick binary verification before triggering full object detection pipelines.

---

### 4. 🗑️ Garbage Classification (`datasets/garbage/`)
- **Directory:** `datasets/garbage/`
- **Total Images:** 12,259 unique images available in 3 standardized resolution tiers:
  - `original/`: Original source image resolutions
  - `standardized_256/`: Resized to 256x256 pixels for rapid training
  - `standardized_384/`: Resized to 384x384 pixels for high-resolution vision transformers
- **10 Target Classes:**
  - `clothes` (1,892)
  - `glass` (1,736)
  - `plastic` (1,597)
  - `shoes` (1,449)
  - `cardboard` (1,411)
  - `paper` (1,336)
  - `metal` (930)
  - `battery` (756)
  - `biological` (699)
  - `trash` (453)
- **Use Cases:** Waste management auditing, automatic trash sorting, and detection of illegal dumping / bin overflows.

---

### 5. 🌊 Flood Monitoring (`datasets/flood/`)
- **Directory:** `datasets/flood/`
- **Total Images:** 441 scene images
- **Structure:**
  - `images/`: 441 JPG images capturing urban waterlogging, flooded roads, and submerged areas.
  - `labels/`: 441 bounding box / segment label files corresponding to flooded regions.
- **Use Cases:** Real-time urban flood risk assessment, storm water logging detection, and emergency dispatch alerts.

---

### 6. ⚙️ Processed & Metadata Directories
- **`datasets/processed/`**: Designated storage for cached DataFrame splits (train/val/test parquet files), pre-computed image feature embeddings, and standardized feature vectors.
- **`datasets/metadata/`**: Designated storage for dataset schema JSON files, class label mappings (`labels.json`), cross-validation splits, and pipeline run logs.

---

## 🛠️ Usage Guidelines & Best Practices

1. **Paths in Code:** Always reference datasets using relative paths from the root directory or relative to project scripts (e.g., `datasets/complaints/311_Service_Requests.csv`).
2. **Virtual Environment:** Ensure `.venv` is activated when loading datasets via Python scripts or Jupyter notebooks.
3. **Data Immutability:** Keep raw datasets in `datasets/<name>` immutable. Write feature-engineered tables or resized image caches to `datasets/processed/`.
