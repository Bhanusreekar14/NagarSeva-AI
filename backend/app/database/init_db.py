from sqlalchemy import text
from app.database.connection import engine, Base
from app.database.models import (
    User,
    Complaint,
    Attachment,
    AIPrediction,
    ComplaintHistory,
    Notification,
    KnowledgeQuery,
)


def init_database():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(500);"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_proof_type VARCHAR(50);"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_proof_url VARCHAR(500);"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Pending';"))
        conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_source VARCHAR(50);"))
        conn.execute(text("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_volunteer_id UUID REFERENCES users(id);"))
        conn.commit()
    print("✅ NagarSeva AI database tables and schemas updated successfully!")


if __name__ == "__main__":
    init_database()
