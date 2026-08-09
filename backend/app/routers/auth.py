import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models.user import User
from app.schemas.auth import UserLogin, UserResponse, TokenResponse
from app.utils.security import (
    create_access_token,
    hash_password,
    require_current_user,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../uploads/id_proofs")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    role: str = Form("Citizen"),
    id_proof_type: Optional[str] = Form(None),
    id_proof_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Normalize role
    normalized_role = role.strip().capitalize()
    if normalized_role not in ["Citizen", "Volunteer", "Admin"]:
        normalized_role = "Citizen"

    # Check if email exists
    existing_user = db.query(User).filter(User.email == email.strip().lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered.",
        )

    # Handle ID proof upload if provided
    id_proof_url = None
    if id_proof_file and id_proof_file.filename:
        ext = os.path.splitext(id_proof_file.filename)[1].lower()
        allowed_extensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf"]
        if ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported document format. Allowed formats: {', '.join(allowed_extensions)}",
            )
        filename = f"{uuid.uuid4().hex[:10]}_{id_proof_file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        content = await id_proof_file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        id_proof_url = f"/uploads/id_proofs/{filename}"

    # Hash password and create user
    hashed_pwd = hash_password(password)
    user = User(
        full_name=full_name.strip(),
        email=email.strip().lower(),
        phone=phone.strip() if phone else None,
        address=address.strip() if address else None,
        password_hash=hashed_pwd,
        role=normalized_role,
        id_proof_type=id_proof_type.strip() if id_proof_type else None,
        id_proof_url=id_proof_url,
        verification_status="Pending",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(require_current_user)):
    return UserResponse.model_validate(current_user)
