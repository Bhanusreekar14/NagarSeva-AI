import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.database.models.complaint import Complaint
from app.database.models.ai_prediction import AIPrediction
from app.database.models.attachment import Attachment

client = TestClient(app)


def test_real_ai_submission_flow():
    print("🚀 Running Phase 10.7 Real AI Complaint Submission Test Suite...")

    # 1. Register and Login a Test User
    print("\n1. Registering & Authenticating Test Citizen...")
    user_email = f"citizen_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "Password123!"

    reg_res = client.post(
        "/auth/register",
        data={
            "full_name": "Anil Kumar",
            "email": user_email,
            "password": pwd,
            "phone": "+91 9988776655",
            "role": "Citizen",
        },
    )
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Registered Citizen User ID: {user_id}")

    # 2. Test Text Complaint Submission (NLP Pipeline)
    print("\n2. Submitting Text Complaint (NLP Pipeline)...")
    text_payload = "A large garbage dump has overflowed near the market square, creating unhygienic conditions."

    text_res = client.post(
        "/agent/run",
        json={
            "type": "text",
            "payload": text_payload,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "Market Square, Sector 2, Bengaluru",
            "location_source": "GPS",
        },
        headers=headers,
    )

    print(f"Text submission status: {text_res.status_code}")
    assert text_res.status_code == 200, f"Text submission failed: {text_res.text}"
    text_data = text_res.json()
    text_cid = text_data["complaint_id"]
    print(f"✅ Text Complaint Created:")
    print(f"   ID: {text_cid}")
    print(f"   Category: {text_data['category']}")
    print(f"   Department: {text_data['department']}")
    print(f"   SLA: {text_data['estimated_resolution_time']}")
    assert text_cid.startswith("NGS-")

    # 3. Test Image Complaint Submission (Vision/YOLO Pipeline)
    print("\n3. Submitting Image Complaint (Vision/YOLO Pipeline)...")
    dummy_image = ("pothole.jpg", b"fake_pothole_image_bytes", "image/jpeg")

    img_res = client.post(
        "/agent/upload-and-run",
        files={"file": dummy_image},
        data={
            "latitude": 12.9250,
            "longitude": 77.5890,
            "address": "Jayanagar 4th Block, Bengaluru",
            "location_source": "GPS",
        },
        headers=headers,
    )

    print(f"Image submission status: {img_res.status_code}")
    assert img_res.status_code == 200, f"Image submission failed: {img_res.text}"
    img_data = img_res.json()
    img_cid = img_data["complaint_id"]
    print(f"✅ Image Complaint Created:")
    print(f"   ID: {img_cid}")
    print(f"   Category: {img_data['category']}")
    print(f"   Department: {img_data['department']}")
    print(f"   Confidence: {img_data['confidence']}")
    assert img_cid.startswith("NGS-")

    # 4. Attach Multi-Evidence Files to Image Complaint
    print("\n4. Attaching Evidence Files (Images, Video, Document)...")
    ev1 = ("scene_photo.png", b"fake_scene_png", "image/png")
    ev2 = ("road_video.mp4", b"fake_mp4", "video/mp4")
    ev3 = ("report_doc.pdf", b"fake_pdf", "application/pdf")

    att_res = client.post(
        f"/complaints/{img_cid}/attachments",
        files=[("files", ev1), ("files", ev2), ("files", ev3)],
        headers=headers,
    )
    assert att_res.status_code == 201, f"Attachment upload failed: {att_res.text}"
    att_data = att_res.json()
    print(f"✅ Attached {att_data['count']} evidence files to {img_cid}.")

    # 5. Database Inspection (Verify Single Complaint Record, User Attribution, AI Prediction, Evidence Attachments)
    print("\n5. Inspecting Supabase PostgreSQL Database Records...")
    db = SessionLocal()
    try:
        # Check text complaint DB record
        text_db_complaint = db.query(Complaint).filter(Complaint.complaint_number == text_cid).all()
        assert len(text_db_complaint) == 1, f"Expected 1 record for {text_cid}, found {len(text_db_complaint)}"
        c1 = text_db_complaint[0]
        print(f"✅ Complaint {c1.complaint_number}:")
        print(f"   Linked User ID: {c1.user_id}")
        print(f"   Address: {c1.address}")
        print(f"   Source: {c1.location_source}")
        assert str(c1.user_id) == user_id
        assert c1.location_source == "GPS"

        # Check AI Prediction for text complaint
        c1_preds = db.query(AIPrediction).filter(AIPrediction.complaint_id == c1.id).all()
        assert len(c1_preds) == 1, f"Expected 1 AI prediction for {text_cid}, found {len(c1_preds)}"
        print(f"   AI Model: {c1_preds[0].model_name} (Confidence: {c1_preds[0].confidence})")

        # Check image complaint DB record
        img_db_complaint = db.query(Complaint).filter(Complaint.complaint_number == img_cid).all()
        assert len(img_db_complaint) == 1, f"Expected 1 record for {img_cid}, found {len(img_db_complaint)}"
        c2 = img_db_complaint[0]
        print(f"\n✅ Complaint {c2.complaint_number}:")
        print(f"   Linked User ID: {c2.user_id}")
        print(f"   Image URL: {c2.image_url}")
        assert str(c2.user_id) == user_id

        # Check AI Prediction for image complaint
        c2_preds = db.query(AIPrediction).filter(AIPrediction.complaint_id == c2.id).all()
        assert len(c2_preds) == 1, f"Expected 1 AI prediction for {img_cid}, found {len(c2_preds)}"

        # Check Attachments for image complaint
        c2_atts = db.query(Attachment).filter(Attachment.complaint_id == c2.id).all()
        assert len(c2_atts) == 3, f"Expected 3 attachments for {img_cid}, found {len(c2_atts)}"
        print(f"   Evidence Attachments Count: {len(c2_atts)}")
        for att in c2_atts:
            print(f"   - Attachment: {att.file_name} ({att.file_type})")

    finally:
        db.close()

    print("\n🎉 ALL PHASE 10.7 REAL AI SUBMISSION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_real_ai_submission_flow()
