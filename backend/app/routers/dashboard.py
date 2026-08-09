from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.models.complaint import Complaint
from app.database.models.user import User
from app.utils.security import require_current_user
from app.database.crud import get_user_complaints

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/citizen")
def citizen_dashboard(
    current_user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    # Strictly filter metrics by authenticated user_id
    total = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id).scalar() or 0
    pending = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "Pending").scalar() or 0
    assigned = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "Assigned").scalar() or 0
    inspection = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "Inspection").scalar() or 0
    in_progress = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "In Progress").scalar() or 0
    resolved = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "Resolved").scalar() or 0
    closed = db.query(func.count(Complaint.id)).filter(Complaint.user_id == user_id, Complaint.status == "Closed").scalar() or 0

    user_complaints = get_user_complaints(db, user_id=user_id, limit=100)

    complaints_list = [
        {
            "complaint_id": c.complaint_number,
            "category": c.category,
            "sub_category": c.sub_category,
            "severity": c.severity,
            "priority": c.priority,
            "department": c.department,
            "status": c.status,
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "location_source": c.location_source,
            "image_url": c.image_url,
            "created_at": c.created_at,
            "attachments_count": len(c.attachments),
        }
        for c in user_complaints
    ]

    return {
        "user": {
            "id": str(current_user.id),
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "address": current_user.address,
            "role": current_user.role,
            "verification_status": current_user.verification_status,
            "id_proof_type": current_user.id_proof_type,
            "id_proof_url": current_user.id_proof_url,
        },
        "stats": {
            "total": total,
            "pending": pending,
            "assigned_inspection": assigned + inspection,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed,
        },
        "complaints": complaints_list,
    }


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):
    total = db.query(func.count(Complaint.id)).scalar() or 0

    pending = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "Pending")
        .scalar()
        or 0
    )

    assigned = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "Assigned")
        .scalar()
        or 0
    )

    inspection = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "Inspection")
        .scalar()
        or 0
    )

    in_progress = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "In Progress")
        .scalar()
        or 0
    )

    resolved = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "Resolved")
        .scalar()
        or 0
    )

    closed = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "Closed")
        .scalar()
        or 0
    )

    category_rows = (
        db.query(
            Complaint.category,
            func.count(Complaint.id)
        )
        .group_by(Complaint.category)
        .all()
    )

    department_rows = (
        db.query(
            Complaint.department,
            func.count(Complaint.id)
        )
        .group_by(Complaint.department)
        .all()
    )

    return {
        "success": True,

        "total_complaints": total,

        "status": {
            "pending": pending,
            "assigned": assigned,
            "inspection": inspection,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed
        },

        "categories": {
            category: count
            for category, count in category_rows
        },

        "departments": {
            department: count
            for department, count in department_rows
        }
    }
