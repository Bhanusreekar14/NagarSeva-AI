import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.crud import get_complaint, create_attachment
from app.services.complaint_persistence import persist_ai_complaint

router = APIRouter(
    prefix="/complaints",
    tags=["Complaint Management"]
)

EVIDENCE_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../uploads/evidence")
os.makedirs(EVIDENCE_UPLOAD_DIR, exist_ok=True)


@router.post("/create-from-ai")
def create_from_ai(
    result: dict,
    db: Session = Depends(get_db)
):
    complaint = persist_ai_complaint(
        db=db,
        result=result,
        description=result.get("description"),
        latitude=result.get("latitude"),
        longitude=result.get("longitude"),
        address=result.get("address"),
        location_source=result.get("location_source"),
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "status": complaint.status,
        "category": complaint.category,
        "department": complaint.department,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "address": complaint.address,
        "location_source": complaint.location_source,
    }


@router.post("/{complaint_number}/attachments", status_code=status.HTTP_201_CREATED)
async def upload_complaint_attachments(
    complaint_number: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    saved_attachments = []
    comp_dir = os.path.join(EVIDENCE_UPLOAD_DIR, complaint_number)
    os.makedirs(comp_dir, exist_ok=True)

    allowed_exts = [
        ".png", ".jpg", ".jpeg", ".webp",
        ".mp4", ".mov", ".avi", ".webm",
        ".pdf", ".doc", ".docx", ".txt"
    ]

    for file in files:
        if not file.filename:
            continue
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}' for file {file.filename}."
            )

        unique_fn = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = os.path.join(comp_dir, unique_fn)
        content = await file.read()
        
        # Determine broad file_type category
        if ext in [".png", ".jpg", ".jpeg", ".webp"]:
            file_cat = "image"
        elif ext in [".mp4", ".mov", ".avi", ".webm"]:
            file_cat = "video"
        else:
            file_cat = "document"

        with open(file_path, "wb") as f:
            f.write(content)

        file_url = f"/uploads/evidence/{complaint_number}/{unique_fn}"
        attachment = create_attachment(
            db=db,
            complaint_id=complaint.id,
            file_name=file.filename,
            file_url=file_url,
            file_type=file_cat,
        )
        saved_attachments.append({
            "id": str(attachment.id),
            "file_name": attachment.file_name,
            "file_url": attachment.file_url,
            "file_type": attachment.file_type,
            "uploaded_at": attachment.uploaded_at,
        })

    return {
        "success": True,
        "complaint_id": complaint_number,
        "count": len(saved_attachments),
        "attachments": saved_attachments,
    }


@router.get("/{complaint_number}")
def get_complaint_by_number(
    complaint_number: str,
    db: Session = Depends(get_db)
):
    complaint = get_complaint(
        db,
        complaint_number
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    attachments_data = [
        {
            "id": str(att.id),
            "file_name": att.file_name,
            "file_url": att.file_url,
            "file_type": att.file_type,
            "uploaded_at": att.uploaded_at,
        }
        for att in complaint.attachments
    ]

    return {
        "complaint_id": complaint.complaint_number,
        "category": complaint.category,
        "sub_category": complaint.sub_category,
        "severity": complaint.severity,
        "priority": complaint.priority,
        "department": complaint.department,
        "status": complaint.status,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "address": complaint.address,
        "location_source": complaint.location_source,
        "image_url": complaint.image_url,
        "created_at": complaint.created_at,
        "attachments": attachments_data,
    }
