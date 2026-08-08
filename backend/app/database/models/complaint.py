import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    complaint_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    category: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)

    severity: Mapped[str] = mapped_column(
        String(20),
        default="Medium",
        nullable=False
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="Medium",
        nullable=False
    )

    department: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="Pending",
        nullable=False,
        index=True
    )

    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    address: Mapped[str | None] = mapped_column(String(500))

    image_url: Mapped[str | None] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = relationship("User", back_populates="complaints")

    attachments = relationship(
        "Attachment",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )

    ai_predictions = relationship(
        "AIPrediction",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )

    history = relationship(
        "ComplaintHistory",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_complaints_department_status", "department", "status"),
        Index("idx_complaints_category_created", "category", "created_at"),
    )
