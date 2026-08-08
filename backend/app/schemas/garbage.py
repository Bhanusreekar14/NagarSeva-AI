# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class GarbageResponse(BaseModel):
    success: bool = True
    detected: bool
    category: str
    sub_category: str
    confidence: float
    severity: str
    department: str = "Sanitation Department"
