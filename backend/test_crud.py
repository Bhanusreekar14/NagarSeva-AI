from app.database.connection import SessionLocal
from app.database.crud import (
    create_complaint,
    get_complaint,
    update_complaint_status,
)


db = SessionLocal()

try:
    print("Creating test complaint...")

    complaint = create_complaint(
        db=db,
        complaint_number="NGS-TEST-000001",
        category="ROAD_INFRASTRUCTURE",
        sub_category="Pothole",
        description="Test pothole complaint",
        severity="High",
        priority="High",
        department="Roads Department",
    )

    print("Created:", complaint.complaint_number)

    found = get_complaint(
        db,
        "NGS-TEST-000001"
    )

    print("Retrieved:", found.complaint_number)

    updated = update_complaint_status(
        db,
        found,
        "In Progress",
        remarks="Test status update",
    )

    print("Updated status:", updated.status)

finally:
    db.close()
