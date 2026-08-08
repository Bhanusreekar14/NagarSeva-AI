from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.models.complaint import Complaint


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


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
