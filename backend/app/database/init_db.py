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
    print("✅ NagarSeva AI database tables created successfully!")


if __name__ == "__main__":
    init_database()
