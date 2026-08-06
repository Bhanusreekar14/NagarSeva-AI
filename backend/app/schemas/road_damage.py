from pydantic import BaseModel

class RoadDamageResponse(BaseModel):
    success: bool = True
    detected: bool
    category: str
    sub_category: str
    confidence: float
    severity: str
    department: str = "Roads Department"
