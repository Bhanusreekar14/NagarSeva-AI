import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from app.database.connection import SessionLocal
from app.database.models.user import User
from app.utils.security import hash_password

def seed_admin_user():
    db = SessionLocal()
    try:
        admin_email = "admin@nagarseva.gov.in"
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            existing.role = "Admin"
            existing.password_hash = hash_password("Admin123!")
            existing.verification_status = "Approved"
            db.commit()
            print(f"✅ Default Admin user updated: {admin_email} (Password: Admin123!)")
        else:
            admin_user = User(
                full_name="Chief Municipal Administrator",
                email=admin_email,
                password_hash=hash_password("Admin123!"),
                phone="9999999999",
                address="City Municipal Corporation HQ, Bengaluru",
                role="Admin",
                verification_status="Approved"
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Default Admin user created: {admin_email} (Password: Admin123!)")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_user()
