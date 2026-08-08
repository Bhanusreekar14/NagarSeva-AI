from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.crud import get_complaint
from app.services.complaint_persistence import persist_ai_complaint

router = APIRouter(
    prefix="/complaints",
    tags=["Complaint Management"]
)


@router.post("/create-from-ai")
def create_from_ai(
    result: dict,
    db: Session = Depends(get_db)
):
    complaint = persist_ai_complaint(
        db=db,
        result=result,
        description=result.get("description")
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "status": complaint.status,
        "category": complaint.category,
        "department": complaint.department
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

    return {
        "complaint_id": complaint.complaint_number,
        "category": complaint.category,
        "sub_category": complaint.sub_category,
        "severity": complaint.severity,
        "priority": complaint.priority,
        "department": complaint.department,
        "status": complaint.status,
        "created_at": complaint.created_at
    }
