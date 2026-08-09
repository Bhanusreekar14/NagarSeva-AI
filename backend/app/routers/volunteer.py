import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.crud import get_complaint, create_attachment, update_complaint_status
from app.database.models.complaint import Complaint
from app.database.models.user import User
from app.utils.security import require_volunteer_user

router = APIRouter(prefix="/volunteer", tags=["Volunteer Portal"])

EVIDENCE_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../uploads/evidence")
os.makedirs(EVIDENCE_UPLOAD_DIR, exist_ok=True)


class StatusUpdateRequest(BaseModel):
    status: str
    remarks: Optional[str] = None


@router.get("/tasks")
def get_assigned_tasks(
    current_user: User = Depends(require_volunteer_user),
    db: Session = Depends(get_db),
):
    tasks = (
        db.query(Complaint)
        .filter(Complaint.assigned_volunteer_id == current_user.id)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    result = []
    for c in tasks:
        attachments_data = [
            {
                "id": str(att.id),
                "file_name": att.file_name,
                "file_url": att.file_url,
                "file_type": att.file_type,
                "uploaded_at": att.uploaded_at,
            }
            for att in c.attachments
        ]
        result.append(
            {
                "complaint_id": c.complaint_number,
                "category": c.category,
                "sub_category": c.sub_category,
                "description": c.description,
                "severity": c.severity,
                "priority": c.priority,
                "department": c.department,
                "status": c.status,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "address": c.address,
                "location_source": c.location_source,
                "image_url": c.image_url,
                "created_at": c.created_at,
                "attachments": attachments_data,
            }
        )

    return {
        "success": True,
        "count": len(result),
        "tasks": result,
    }


@router.post("/tasks/{complaint_number}/assign")
def assign_task_to_volunteer(
    complaint_number: str,
    current_user: User = Depends(require_volunteer_user),
    db: Session = Depends(get_db),
):
    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.assigned_volunteer_id = current_user.id
    if complaint.status == "Pending":
        complaint = update_complaint_status(
            db=db,
            complaint=complaint,
            new_status="Assigned",
            changed_by=current_user.id,
            remarks=f"Task assigned to volunteer {current_user.full_name}",
        )
    else:
        db.commit()
        db.refresh(complaint)

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "assigned_volunteer_id": str(current_user.id),
        "status": complaint.status,
        "message": f"Complaint {complaint_number} successfully assigned to volunteer {current_user.full_name}",
    }


@router.put("/tasks/{complaint_number}/status")
def update_task_status(
    complaint_number: str,
    request: StatusUpdateRequest,
    current_user: User = Depends(require_volunteer_user),
    db: Session = Depends(get_db),
):
    allowed_statuses = ["Assigned", "Inspection", "In Progress", "Resolved", "Closed"]
    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed statuses for volunteer: {allowed_statuses}",
        )

    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if str(complaint.assigned_volunteer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complaint is not assigned to you. Volunteers can only update their own assigned tasks.",
        )

    complaint = update_complaint_status(
        db=db,
        complaint=complaint,
        new_status=request.status,
        changed_by=current_user.id,
        remarks=request.remarks or f"Status updated to {request.status} by Volunteer {current_user.full_name}",
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "status": complaint.status,
        "message": f"Task status updated to '{complaint.status}' successfully.",
    }


@router.post("/tasks/{complaint_number}/evidence", status_code=status.HTTP_201_CREATED)
async def upload_field_evidence(
    complaint_number: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_volunteer_user),
    db: Session = Depends(get_db),
):
    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if str(complaint.assigned_volunteer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Complaint is not assigned to you. Volunteers can only upload evidence for their own assigned tasks.",
        )

    comp_dir = os.path.join(EVIDENCE_UPLOAD_DIR, complaint_number)
    os.makedirs(comp_dir, exist_ok=True)

    allowed_exts = [
        ".png", ".jpg", ".jpeg", ".webp",
        ".mp4", ".mov", ".avi", ".webm",
        ".pdf", ".doc", ".docx", ".txt"
    ]

    saved_attachments = []
    for file in files:
        if not file.filename:
            continue
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}' for file {file.filename}.",
            )

        unique_fn = f"vol_{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = os.path.join(comp_dir, unique_fn)
        content = await file.read()

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
            file_name=f"Field Evidence: {file.filename}",
            file_url=file_url,
            file_type=file_cat,
        )
        saved_attachments.append(
            {
                "id": str(attachment.id),
                "file_name": attachment.file_name,
                "file_url": attachment.file_url,
                "file_type": attachment.file_type,
                "uploaded_at": attachment.uploaded_at,
            }
        )

    return {
        "success": True,
        "complaint_id": complaint_number,
        "count": len(saved_attachments),
        "attachments": saved_attachments,
    }
