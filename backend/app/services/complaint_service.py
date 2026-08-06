from datetime import datetime
from typing import Dict, List, Optional
from app.schemas.complaint import Complaint
from app.schemas.image_response import ImageResponse
from app.services.severity_service import severity_service
from app.utils.department_mapping import get_department_for_category

class ComplaintService:
    """
    Complaint Intelligence Engine.
    Converts raw AI detections into standardized municipal complaints
    with unique tracking IDs, automated department routing, and lifecycle management.
    """
    def __init__(self):
        self._counter = 1
        self._db: Dict[str, Complaint] = {}

    def _generate_complaint_id(self) -> str:
        year = datetime.now().year
        cid = f"NGS-{year}-{self._counter:06d}"
        self._counter += 1
        return cid

    def create_complaint_from_ai(self, ai_response: ImageResponse) -> Complaint:
        complaint_id = self._generate_complaint_id()
        
        # Calculate dynamic severity
        calculated_severity = severity_service.calculate_severity(
            confidence=ai_response.confidence,
            class_severity=ai_response.severity
        ) if ai_response.detected else "Low"

        # Determine department routing
        department = get_department_for_category(
            category=ai_response.category,
            default_department=ai_response.department
        )

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        complaint = Complaint(
            complaint_id=complaint_id,
            category=ai_response.category,
            sub_category=ai_response.sub_category,
            severity=calculated_severity,
            department=department,
            status="Pending",
            confidence=ai_response.confidence,
            created_at=timestamp
        )

        self._db[complaint_id] = complaint
        return complaint

    def get_complaint(self, complaint_id: str) -> Optional[Complaint]:
        return self._db.get(complaint_id)

    def list_complaints(self) -> List[Complaint]:
        return list(self._db.values())

    def update_status(self, complaint_id: str, new_status: str) -> Optional[Complaint]:
        if complaint_id in self._db:
            self._db[complaint_id].status = new_status
            return self._db[complaint_id]
        return None

complaint_service = ComplaintService()
