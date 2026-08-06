from pydantic import BaseModel
from typing import Optional

class Complaint(BaseModel):
    complaint_id: str
    category: str
    sub_category: str
    severity: str
    department: str
    status: str = "Pending"
    confidence: float = 0.0
    created_at: Optional[str] = None
