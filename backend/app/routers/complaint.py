from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import uuid
from pathlib import Path
from typing import Optional, List
from app.schemas.complaint import Complaint
from app.schemas.complaint_text import ComplaintRequest, TextAnalysisResponse
from app.services.image_router_service import image_router_service
from app.services.complaint_service import complaint_service
from app.services.complaint_router import complaint_router_service

router = APIRouter(prefix="/complaints", tags=["Complaint Intelligence"])

UPLOAD_DIR = Path("uploads")
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/analyze", response_model=TextAnalysisResponse)
def analyze_text(request: ComplaintRequest):
    if not request.complaint_text.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty.")
    return complaint_router_service.analyze_text(request.complaint_text)

@router.post("/create", response_model=Complaint)
async def create_complaint(
    file: UploadFile = File(...),
    module: Optional[str] = Form(None)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_extension = Path(file.filename).suffix or ".jpg"
    unique_filename = f"complaint_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        ai_response = image_router_service.analyze_image(str(file_path), module_hint=module)
        complaint = complaint_service.create_complaint_from_ai(ai_response)
        return complaint
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate complaint: {str(e)}")

@router.get("/", response_model=List[Complaint])
def get_all_complaints():
    return complaint_service.list_complaints()

@router.get("/{complaint_id}", response_model=Complaint)
def get_complaint_by_id(complaint_id: str):
    complaint = complaint_service.get_complaint(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found.")
    return complaint
