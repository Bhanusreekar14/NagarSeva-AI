# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional

class ComplaintRequest(BaseModel):
    complaint_text: str

class TextAnalysisResponse(BaseModel):
    success: bool = True
    category: str
    sub_category: str = "General"
    confidence: float
    priority: str
    department: str
