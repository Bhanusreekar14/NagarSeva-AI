from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import uuid
from pathlib import Path
from typing import Optional
from app.schemas.image_response import ImageResponse
from app.services.image_router_service import image_router_service

router = APIRouter(prefix="/image", tags=["Image AI Router"])

UPLOAD_DIR = Path("uploads")
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/analyze", response_model=ImageResponse)
async def analyze_image(
    file: UploadFile = File(...),
    module: Optional[str] = Form(None)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_extension = Path(file.filename).suffix or ".jpg"
    unique_filename = f"analysis_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        response = image_router_service.analyze_image(str(file_path), module_hint=module)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Image analysis error: {str(e)}")
