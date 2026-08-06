from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import uuid
from pathlib import Path
from app.schemas.road_damage import RoadDamageResponse
from app.services.image_router import image_router_service

router = APIRouter(prefix="/road-damage", tags=["Road Damage"])

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/health")
def health():
    return {
        "module": "Road Damage AI",
        "status": "Ready"
    }

@router.post("/detect", response_model=RoadDamageResponse)
async def detect(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_extension = Path(file.filename).suffix or ".jpg"
    unique_filename = f"road_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        response = image_router_service.process_image(str(file_path), domain="road_damage")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
