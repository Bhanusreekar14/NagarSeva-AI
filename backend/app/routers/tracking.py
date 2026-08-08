from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.crud import get_complaint, update_complaint_status


router = APIRouter(
    prefix="/tracking",
    tags=["Complaint Tracking"]
)


COMPLAINT_STATUSES = [
    "Pending",
    "Assigned",
    "Inspection",
    "In Progress",
    "Resolved",
    "Closed"
]


class StatusUpdateRequest(BaseModel):
    status: str
    remarks: str | None = None


@router.put("/{complaint_number}/status")
def update_status(
    complaint_number: str,
    request: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    if request.status not in COMPLAINT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {COMPLAINT_STATUSES}"
        )

    complaint = get_complaint(
        db,
        complaint_number
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    complaint = update_complaint_status(
        db=db,
        complaint=complaint,
        new_status=request.status,
        remarks=request.remarks
    )

    return {
        "success": True,
        "complaint_id": complaint.complaint_number,
        "status": complaint.status,
        "message": "Complaint status updated successfully"
    }


@router.get("/{complaint_number}/timeline")
def get_timeline(
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

    history = sorted(
        complaint.history,
        key=lambda item: item.created_at
    )

    return {
        "complaint_id": complaint.complaint_number,
        "current_status": complaint.status,
        "timeline": [
            {
                "old_status": item.old_status,
                "new_status": item.new_status,
                "remarks": item.remarks,
                "created_at": item.created_at
            }
            for item in history
        ]
    }
