import uuid

from app.database.crud import create_complaint, save_ai_prediction


def generate_complaint_number() -> str:
    short_id = str(uuid.uuid4()).split("-")[0].upper()
    return f"NGS-{short_id}"


def persist_ai_complaint(
    db,
    result: dict,
    description: str | None = None,
    user_id=None,
    latitude=None,
    longitude=None,
    address=None,
    image_url=None,
):
    complaint_number = generate_complaint_number()

    complaint = create_complaint(
        db=db,
        complaint_number=complaint_number,
        category=result.get("category", "OTHER_CIVIC"),
        sub_category=result.get("sub_category"),
        description=description,
        severity=result.get("severity", "Medium"),
        priority=result.get("priority", "Medium"),
        department=result.get(
            "department",
            "Municipal Services Department"
        ),
        user_id=user_id,
        latitude=latitude,
        longitude=longitude,
        address=address,
        image_url=image_url,
    )

    if result.get("confidence") is not None:
        save_ai_prediction(
            db=db,
            complaint_id=complaint.id,
            model_name=result.get(
                "model",
                "NagarSeva AI"
            ),
            confidence=float(result["confidence"]),
            processing_time=result.get("processing_time"),
            prediction_json=result,
        )

    return complaint
