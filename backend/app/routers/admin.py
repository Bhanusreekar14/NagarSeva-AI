import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.crud import get_complaint, update_complaint_status
from app.database.models.complaint import Complaint
from app.database.models.user import User
from app.utils.security import require_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


class AdminAssignRequest(BaseModel):
    volunteer_id: str
    remarks: Optional[str] = None


class AdminStatusUpdateRequest(BaseModel):
    status: str
    remarks: Optional[str] = None


@router.get("/stats")
def get_admin_system_stats(
    current_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Complaint.id)).scalar() or 0
    pending = db.query(func.count(Complaint.id)).filter(Complaint.status == "Pending").scalar() or 0
    assigned = db.query(func.count(Complaint.id)).filter(Complaint.status == "Assigned").scalar() or 0
    inspection = db.query(func.count(Complaint.id)).filter(Complaint.status == "Inspection").scalar() or 0
    in_progress = db.query(func.count(Complaint.id)).filter(Complaint.status == "In Progress").scalar() or 0
    resolved = db.query(func.count(Complaint.id)).filter(Complaint.status == "Resolved").scalar() or 0
    closed = db.query(func.count(Complaint.id)).filter(Complaint.status == "Closed").scalar() or 0

    category_rows = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
    department_rows = db.query(Complaint.department, func.count(Complaint.id)).group_by(Complaint.department).all()
    severity_rows = db.query(Complaint.severity, func.count(Complaint.id)).group_by(Complaint.severity).all()
    priority_rows = db.query(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority).all()

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_citizens = db.query(func.count(User.id)).filter(User.role == "Citizen").scalar() or 0
    total_volunteers = db.query(func.count(User.id)).filter(User.role == "Volunteer").scalar() or 0
    total_admins = db.query(func.count(User.id)).filter(User.role == "Admin").scalar() or 0

    return {
        "success": True,
        "total_complaints": total,
        "status": {
            "pending": pending,
            "assigned": assigned,
            "inspection": inspection,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed,
        },
        "categories": {cat: count for cat, count in category_rows},
        "departments": {dept: count for dept, count in department_rows},
        "severities": {sev: count for sev, count in severity_rows},
        "priorities": {prio: count for prio, count in priority_rows},
        "users": {
            "total": total_users,
            "citizens": total_citizens,
            "volunteers": total_volunteers,
            "admins": total_admins,
        },
    }


@router.get("/complaints")
def get_admin_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    department_filter: Optional[str] = Query(None, alias="department"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)

    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category_filter:
        query = query.filter(Complaint.category == category_filter)
    if department_filter:
        query = query.filter(Complaint.department == department_filter)
    if priority_filter:
        query = query.filter(Complaint.priority == priority_filter)
    if severity_filter:
        query = query.filter(Complaint.severity == severity_filter)
    if search:
        s_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_number.ilike(s_pattern),
                Complaint.description.ilike(s_pattern),
                Complaint.address.ilike(s_pattern),
                Complaint.category.ilike(s_pattern),
                Complaint.department.ilike(s_pattern),
            )
        )

    total_filtered = query.count()
    complaints = query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for c in complaints:
        reporter_data = (
            {
                "id": str(c.user.id),
                "full_name": c.user.full_name,
                "email": c.user.email,
                "phone": c.user.phone,
            }
            if c.user
            else None
        )

        assigned_vol = (
            {
                "id": str(c.assigned_volunteer.id),
                "full_name": c.assigned_volunteer.full_name,
                "email": c.assigned_volunteer.email,
                "phone": c.assigned_volunteer.phone,
                "verification_status": c.assigned_volunteer.verification_status,
            }
            if c.assigned_volunteer
            else None
        )

        predictions_data = [
            {
                "model_name": pred.model_name,
                "confidence": pred.confidence,
                "processing_time": pred.processing_time,
                "prediction_json": pred.prediction_json,
            }
            for pred in c.ai_predictions
        ]

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

        history_data = [
            {
                "old_status": item.old_status,
                "new_status": item.new_status,
                "remarks": item.remarks,
                "created_at": item.created_at,
                "changed_by": str(item.changed_by) if item.changed_by else None,
            }
            for item in sorted(c.history, key=lambda x: x.created_at)
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
                "reporter": reporter_data,
                "assigned_volunteer": assigned_vol,
                "ai_predictions": predictions_data,
                "attachments": attachments_data,
                "history": history_data,
            }
        )

    return {
        "success": True,
        "total": total_filtered,
        "count": len(result),
        "complaints": result,
    }


@router.get("/volunteers")
def get_admin_volunteers(
    current_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    volunteers = db.query(User).filter(User.role == "Volunteer").order_by(User.full_name).all()

    result = []
    for v in volunteers:
        assigned_count = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.assigned_volunteer_id == v.id)
            .scalar()
            or 0
        )
        completed_count = (
            db.query(func.count(Complaint.id))
            .filter(Complaint.assigned_volunteer_id == v.id, Complaint.status.in_(["Resolved", "Closed"]))
            .scalar()
            or 0
        )

        result.append(
            {
                "id": str(v.id),
                "full_name": v.full_name,
                "email": v.email,
                "phone": v.phone,
                "verification_status": v.verification_status,
                "assigned_tasks_count": assigned_count,
                "completed_tasks_count": completed_count,
            }
        )

    return {
        "success": True,
        "count": len(result),
        "volunteers": result,
    }


@router.post("/complaints/{complaint_number}/assign")
def admin_assign_volunteer(
    complaint_number: str,
    payload: AdminAssignRequest,
    current_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    try:
        vol_uuid = uuid.UUID(payload.volunteer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid volunteer ID format.")

    volunteer = db.query(User).filter(User.id == vol_uuid, User.role == "Volunteer").first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found or user is not a registered volunteer.")

    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.assigned_volunteer_id = volunteer.id
    new_status = "Assigned" if complaint.status == "Pending" else complaint.status

    remarks_text = (
        payload.remarks
        if payload.remarks
        else f"Assigned to volunteer {volunteer.full_name} by Admin {current_user.full_name}"
    )

    complaint = update_complaint_status(
        db=db,
        complaint=complaint,
        new_status=new_status,
        changed_by=current_user.id,
        remarks=remarks_text,
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "assigned_volunteer": {
            "id": str(volunteer.id),
            "full_name": volunteer.full_name,
            "email": volunteer.email,
        },
        "status": complaint.status,
        "message": f"Complaint {complaint_number} successfully assigned to volunteer {volunteer.full_name}.",
    }


@router.put("/complaints/{complaint_number}/status")
def admin_update_status(
    complaint_number: str,
    payload: AdminStatusUpdateRequest,
    current_user: User = Depends(require_admin_user),
    db: Session = Depends(get_db),
):
    allowed_statuses = ["Pending", "Assigned", "Inspection", "In Progress", "Resolved", "Closed"]
    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed statuses: {allowed_statuses}",
        )

    complaint = get_complaint(db, complaint_number)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = update_complaint_status(
        db=db,
        complaint=complaint,
        new_status=payload.status,
        changed_by=current_user.id,
        remarks=payload.remarks or f"Status updated to '{payload.status}' by Admin {current_user.full_name}",
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "status": complaint.status,
        "message": f"Complaint status updated to '{complaint.status}' by Admin.",
    }
