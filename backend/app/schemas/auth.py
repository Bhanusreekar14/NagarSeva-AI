from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserRegisterForm(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None, max_length=500)
    role: str = Field("Citizen", description="Citizen or Volunteer")
    id_proof_type: str | None = Field(None, description="Aadhaar / PAN / Voter ID / Driving License / Passport")
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str | None = None
    role: str
    address: str | None = None
    id_proof_type: str | None = None
    id_proof_url: str | None = None
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
