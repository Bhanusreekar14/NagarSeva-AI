# NagarSeva AI – API Documentation

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs` when running the backend server.

---

## General Endpoints

### Health Check
- **GET** `/`
- **Response**:
```json
{
  "message": "Welcome to NagarSeva AI",
  "status": "Running"
}
```

---

## LangGraph Multi-Agent Orchestrator Endpoints

### 1. Run Multi-Agent Workflow (Text & Question)
- **POST** `/agent/run`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "type": "text",
  "payload": "Garbage overflow near school entrance"
}
```
- **Response Schema**:
```json
{
  "status": "Complaint Registered & Citizen Notified",
  "complaint_id": "NGS-2026-000001",
  "category": "GARBAGE_WASTE",
  "sub_category": "Text Complaint",
  "confidence": 0.80,
  "severity": "Medium",
  "department": "Sanitation Department",
  "estimated_resolution_time": "3 - 5 Business Days",
  "response_message": "Complaint Registered Successfully.\nID: NGS-2026-000001\nCategory: GARBAGE_WASTE\nDepartment: Sanitation Department\nPriority: Medium\nExpected Resolution: 3 - 5 Business Days"
}
```

### 2. Run Multi-Agent Workflow (Image Upload)
- **POST** `/agent/upload-and-run`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (image file), `module_hint` (optional string)

---

## RAG Knowledge Assistant Endpoints


### 1. Ask Municipal Knowledge Assistant
- **POST** `/assistant/ask`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "question": "How do I report illegal dumping?"
}
```
- **Response Schema**:
```json
{
  "answer": "Submit a photo or text complaint via NagarSeva AI. The system routes it directly to the Sanitation Department.",
  "sources": [
    "faq.md",
    "sanitation_department.md"
  ]
}
```

---

## Complaint Intelligence & NLP Endpoints


### 1. Analyze Text Complaint
- **POST** `/complaints/analyze`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "complaint_text": "There is a huge pothole near the bus stop."
}
```
- **Response Schema**:
```json
{
  "success": true,
  "category": "ROAD_INFRASTRUCTURE",
  "sub_category": "Text Complaint",
  "confidence": 0.80,
  "priority": "High",
  "department": "Roads Department"
}
```

### 2. Create Civic Complaint (Image)
- **POST** `/complaints/create`

- **Content-Type**: `multipart/form-data`
- **Body**: `file` (image file), `module` (optional string hint)
- **Response Schema**:
```json
{
  "complaint_id": "NGS-2026-000001",
  "category": "ROAD_INFRASTRUCTURE",
  "sub_category": "Pothole",
  "severity": "High",
  "department": "Roads Department",
  "status": "Pending",
  "confidence": 0.97,
  "created_at": "2026-08-06 23:26:59"
}
```

### 2. List Complaints
- **GET** `/complaints/`
- **Response**: Array of `Complaint` objects.

### 3. Get Complaint Status
- **GET** `/complaints/{complaint_id}`
- **Response**: `Complaint` object.

---

## AI Image Orchestrator & Router


### Unified Image Analysis
- **POST** `/image/analyze`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (image file), `module` (optional string hint)
- **Response Schema**:
```json
{
  "success": true,
  "detected": true,
  "module": "Garbage Detection AI",
  "category": "GARBAGE_WASTE",
  "sub_category": "Plastic",
  "confidence": 0.98,
  "severity": "High",
  "department": "Sanitation Department"
}
```

---

## Road Damage AI Endpoints


### 1. Road Damage Module Health
- **GET** `/road-damage/health`
- **Response**:
```json
{
  "module": "Road Damage AI",
  "status": "Ready"
}
```

### 2. Detect Road Damage
- **POST** `/road-damage/detect`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (image file)
- **Response Schema**:
```json
{
  "success": true,
  "detected": true,
  "category": "ROAD_INFRASTRUCTURE",
  "sub_category": "Pothole",
  "confidence": 0.97,
  "severity": "High",
  "department": "Roads Department"
}
```

---

## Planned Future Endpoints
- **POST** `/garbage/detect` (Phase 4)
- **POST** `/flood/detect` (Phase 5)
- **POST** `/complaint/classify` (Phase 6)
- **POST** `/severity/predict` (Phase 7)
- **POST** `/route/department` (Phase 8)
