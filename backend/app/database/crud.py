from sqlalchemy.orm import Session

from app.database.models.user import User
from app.database.models.complaint import Complaint
from app.database.models.ai_prediction import AIPrediction
from app.database.models.complaint_history import ComplaintHistory


def create_complaint(
    db: Session,
    complaint_number: str,
    category: str,
    sub_category: str,
    description: str,
    severity: str,
    priority: str,
    department: str,
    user_id=None,
    latitude=None,
    longitude=None,
    address=None,
    image_url=None,
):
    complaint = Complaint(
        complaint_number=complaint_number,
        user_id=user_id,
        category=category,
        sub_category=sub_category,
        description=description,
        severity=severity,
        priority=priority,
        department=department,
        latitude=latitude,
        longitude=longitude,
        address=address,
        image_url=image_url,
        status="Pending",
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return complaint


def get_complaint(db: Session, complaint_number: str):
    return (
        db.query(Complaint)
        .filter(Complaint.complaint_number == complaint_number)
        .first()
    )


def get_complaints(
    db: Session,
    skip: int = 0,
    limit: int = 50,
):
    return (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_complaint_status(
    db: Session,
    complaint: Complaint,
    new_status: str,
    changed_by=None,
    remarks=None,
):
    old_status = complaint.status

    complaint.status = new_status

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        remarks=remarks,
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return complaint


def save_ai_prediction(
    db: Session,
    complaint_id,
    model_name: str,
    confidence: float | None,
    processing_time: float | None,
    prediction_json: dict | None,
):
    prediction = AIPrediction(
        complaint_id=complaint_id,
        model_name=model_name,
        confidence=confidence,
        processing_time=processing_time,
        prediction_json=prediction_json,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction
