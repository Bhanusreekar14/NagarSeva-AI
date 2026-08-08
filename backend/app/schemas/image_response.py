# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class ImageResponse(BaseModel):
    success: bool = True
    detected: bool
    module: str
    category: str
    sub_category: str
    confidence: float
    severity: str
    department: str
