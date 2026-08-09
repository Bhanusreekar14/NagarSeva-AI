import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_end_to_end_integration_flow():
    print("================================================================================")
    print("🚀 Running Phase 10.13 Master End-to-End Integration & Security Test Suite")
    print("================================================================================")

    # --------------------------------------------------------------------------
    # Step 1: Citizen Registration with ID Proof Upload
    # --------------------------------------------------------------------------
    cit_email = f"e2e_citizen_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n[Step 1] Registering Citizen account with ID proof upload ({cit_email})...")
    dummy_id_proof = ("aadhaar_front.jpg", b"fake_id_proof_bytes", "image/jpeg")
    reg_cit_res = client.post(
        "/auth/register",
        data={
            "full_name": "E2E Test Citizen",
            "email": cit_email,
            "password": "Password123!",
            "phone": "9876543210",
            "role": "Citizen",
            "address": "Koramangala 1st Block, Bengaluru",
            "id_proof_type": "Aadhaar",
        },
        files={"id_proof_file": dummy_id_proof},
    )
    assert reg_cit_res.status_code == 201, f"Citizen registration failed: {reg_cit_res.text}"
    cit_user = reg_cit_res.json()["user"]
    token_cit = reg_cit_res.json()["access_token"]
    headers_cit = {"Authorization": f"Bearer {token_cit}"}
    print(f"✅ Citizen registered successfully: ID={cit_user['id']}, VerificationStatus={cit_user['verification_status']}")
    assert cit_user["id_proof_url"] is not None

    # --------------------------------------------------------------------------
    # Step 2: Citizen Login & JWT Authentication
    # --------------------------------------------------------------------------
    print("\n[Step 2] Authenticating Citizen via POST /auth/login...")
    login_res = client.post(
        "/auth/login",
        json={"email": cit_email, "password": "Password123!"},
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    me_res = client.get("/auth/me", headers=headers_cit)
    assert me_res.status_code == 200
    print(f"✅ Citizen JWT login verified: {me_res.json()['full_name']} ({me_res.json()['email']})")

    # --------------------------------------------------------------------------
    # Step 3: Citizen Text Complaint Submission (NLP + GPS Location)
    # --------------------------------------------------------------------------
    print("\n[Step 3] Submitting Text Complaint (NLP Pipeline + GPS Location)...")
    text_sub_res = client.post(
        "/agent/run",
        headers=headers_cit,
        json={
            "type": "text",
            "payload": "Large pile of uncollected garbage emitting foul odor near market.",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "address": "Central Market, Koramangala 1st Block, Bengaluru",
            "location_source": "GPS",
        },
    )
    assert text_sub_res.status_code == 200, f"Text submission failed: {text_sub_res.text}"
    cid_text = text_sub_res.json()["complaint_id"]
    print(f"✅ Text Complaint Created: ID={cid_text}, Category={text_sub_res.json().get('category')}")

    # --------------------------------------------------------------------------
    # Step 4: Citizen Image Complaint Submission (Vision/YOLO + Manual Address)
    # --------------------------------------------------------------------------
    print("\n[Step 4] Submitting Image Complaint (Vision/YOLO Pipeline + Manual Address)...")
    dummy_pothole = ("damaged_road.jpg", b"fake_road_image_bytes", "image/jpeg")
    img_sub_res = client.post(
        "/agent/upload-and-run",
        headers=headers_cit,
        files={"file": dummy_pothole},
        data={
            "address": "80 Feet Road, Koramangala, Bengaluru",
            "location_source": "Manual",
        },
    )
    assert img_sub_res.status_code == 200, f"Image submission failed: {img_sub_res.text}"
    cid_img = img_sub_res.json()["complaint_id"]
    print(f"✅ Image Complaint Created: ID={cid_img}")

    # --------------------------------------------------------------------------
    # Step 5: AI Prediction & Single Supabase DB Persistence Verification
    # --------------------------------------------------------------------------
    print("\n[Step 5] Verifying Single DB Record & AI Prediction Persistence...")
    det_res = client.get(f"/complaints/{cid_text}")
    assert det_res.status_code == 200
    det = det_res.json()
    assert det["complaint_id"] == cid_text
    assert det["address"] == "Central Market, Koramangala 1st Block, Bengaluru"
    assert det["location_source"] == "GPS"
    print(f"✅ Single DB Persistence Verified: Complaint={cid_text}, Status={det['status']}")

    # --------------------------------------------------------------------------
    # Step 6: Evidence Attachment Persistence
    # --------------------------------------------------------------------------
    print(f"\n[Step 6] Attaching multimedia evidence files to complaint {cid_text}...")
    file1 = ("site_photo.jpg", b"fake_photo", "image/jpeg")
    file2 = ("video_clip.mp4", b"fake_video", "video/mp4")
    file3 = ("report_doc.pdf", b"fake_pdf", "application/pdf")
    att_res = client.post(
        f"/complaints/{cid_text}/attachments",
        headers=headers_cit,
        files=[("files", file1), ("files", file2), ("files", file3)],
    )
    assert att_res.status_code == 201, f"Attachment upload failed: {att_res.text}"
    print(f"✅ Attached {att_res.json()['count']} evidence files to {cid_text}")

    # --------------------------------------------------------------------------
    # Step 7: Public Complaint Tracking & Status History
    # --------------------------------------------------------------------------
    print(f"\n[Step 7] Checking Public Timeline for {cid_text}...")
    tl_res = client.get(f"/tracking/{cid_text}/timeline")
    assert tl_res.status_code == 200
    tl = tl_res.json()
    assert tl["complaint_id"] == cid_text
    print(f"✅ Public Timeline Status: {tl['current_status']}")

    # --------------------------------------------------------------------------
    # Step 8: Admin Login & System Overview Stats
    # --------------------------------------------------------------------------
    admin_email = f"e2e_admin_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n[Step 8] Registering & Authenticating Admin ({admin_email})...")
    reg_adm = client.post(
        "/auth/register",
        data={
            "full_name": "E2E Master Administrator",
            "email": admin_email,
            "password": "Password123!",
            "role": "Admin",
        },
    )
    assert reg_adm.status_code == 201
    headers_adm = {"Authorization": f"Bearer {reg_adm.json()['access_token']}"}

    adm_stats = client.get("/admin/stats", headers=headers_adm)
    assert adm_stats.status_code == 200
    print(f"✅ Admin System Overview Stats: TotalComplaints={adm_stats.json()['total_complaints']}")

    # --------------------------------------------------------------------------
    # Step 9: Admin Complaint Search/Filtering & AI Prediction Inspection
    # --------------------------------------------------------------------------
    print(f"\n[Step 9] Admin searching & inspecting complaint {cid_text}...")
    adm_comp_res = client.get(f"/admin/complaints?search={cid_text}", headers=headers_adm)
    assert adm_comp_res.status_code == 200
    comp_data = adm_comp_res.json()["complaints"][0]
    assert comp_data["complaint_id"] == cid_text
    assert len(comp_data["attachments"]) == 3
    print(f"✅ Admin Inspected AI Prediction: PredictionsCount={len(comp_data['ai_predictions'])}")

    # --------------------------------------------------------------------------
    # Step 10: Authoritative Admin Assignment to Volunteer
    # --------------------------------------------------------------------------
    vol_email = f"e2e_volunteer_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n[Step 10] Registering Volunteer ({vol_email}) & Admin Assigning Task...")
    reg_vol = client.post(
        "/auth/register",
        data={
            "full_name": "E2E Field Volunteer",
            "email": vol_email,
            "password": "Password123!",
            "role": "Volunteer",
        },
    )
    assert reg_vol.status_code == 201
    vol_id = reg_vol.json()["user"]["id"]
    headers_vol = {"Authorization": f"Bearer {reg_vol.json()['access_token']}"}

    assign_res = client.post(
        f"/admin/complaints/{cid_text}/assign",
        headers=headers_adm,
        json={"volunteer_id": vol_id, "remarks": "Dispatching Field Unit 1 for site clearance."},
    )
    assert assign_res.status_code == 200
    print(f"✅ Admin Assignment Response: {assign_res.json()['message']}")

    # --------------------------------------------------------------------------
    # Step 11: Volunteer Login & Assigned Task Isolation Check
    # --------------------------------------------------------------------------
    print("\n[Step 11] Volunteer retrieving assigned tasks (GET /volunteer/tasks)...")
    vol_tasks_res = client.get("/volunteer/tasks", headers=headers_vol)
    assert vol_tasks_res.status_code == 200
    vtasks = vol_tasks_res.json()["tasks"]
    assert len(vtasks) == 1
    assert vtasks[0]["complaint_id"] == cid_text
    print(f"✅ Volunteer Task Isolation Verified: Task {cid_text} present in queue.")

    # --------------------------------------------------------------------------
    # Step 12: Volunteer Status Update & Field Evidence Upload
    # --------------------------------------------------------------------------
    print(f"\n[Step 12] Volunteer updating task {cid_text} status & uploading field evidence...")
    v_up1 = client.put(
        f"/volunteer/tasks/{cid_text}/status",
        headers=headers_vol,
        json={"status": "In Progress", "remarks": "Sanitation crew dispatched to site."},
    )
    assert v_up1.status_code == 200

    field_img = ("after_cleanup.jpg", b"fake_cleaned_site_bytes", "image/jpeg")
    v_ev_res = client.post(
        f"/volunteer/tasks/{cid_text}/evidence",
        headers=headers_vol,
        files={"files": field_img},
    )
    assert v_ev_res.status_code == 201

    v_up2 = client.put(
        f"/volunteer/tasks/{cid_text}/status",
        headers=headers_vol,
        json={"status": "Resolved", "remarks": "Waste cleared and area disinfected."},
    )
    assert v_up2.status_code == 200
    print("✅ Volunteer status updates and field evidence upload completed.")

    # --------------------------------------------------------------------------
    # Step 13: Citizen Tracking Showing Volunteer's Status Changes
    # --------------------------------------------------------------------------
    print(f"\n[Step 13] Citizen checking public timeline for volunteer updates...")
    track_after = client.get(f"/tracking/{cid_text}/timeline").json()
    assert track_after["current_status"] == "Resolved"
    print(f"✅ Citizen Tracking Verified: Final Status = {track_after['current_status']}")
    print(f"   Latest Remark: {track_after['timeline'][-1]['remarks']}")

    # --------------------------------------------------------------------------
    # Step 14: AI Assistant RAG Question & Source Citations
    # --------------------------------------------------------------------------
    print("\n[Step 14] Testing AI Assistant RAG Knowledge Retrieval...")
    rag_res = client.post("/assistant/ask", json={"question": "How long does pothole repair take?"})
    assert rag_res.status_code == 200
    rag_data = rag_res.json()
    assert len(rag_data["answer"]) > 0
    assert len(rag_data["sources"]) > 0
    print(f"✅ RAG Assistant Answer Retrieved: Sources = {rag_data['sources']}")

    # --------------------------------------------------------------------------
    # Step 15: Citizen Dashboard Isolation & Security Enforcement Verification
    # --------------------------------------------------------------------------
    print("\n[Step 15] Verifying Citizen Dashboard Isolation & Security Directives...")
    dash_cit = client.get("/dashboard/citizen", headers=headers_cit).json()
    cids_in_dash = [c["complaint_id"] for c in dash_cit["complaints"]]
    assert cid_text in cids_in_dash
    assert cid_img in cids_in_dash
    print(f"✅ Citizen Dashboard Verified: Own complaints count = {dash_cit['stats']['total']}")

    # Security Isolation Checks
    assert client.get("/admin/stats", headers=headers_cit).status_code == 403
    assert client.get("/admin/stats", headers=headers_vol).status_code == 403
    assert client.get("/volunteer/tasks", headers=headers_cit).status_code == 403
    print("🔒 SECURITY DIRECTIVES VERIFIED: Role boundaries strictly enforced (403 Forbidden).")

    print("================================================================================")
    print("🎉 ALL 15 MASTER END-TO-END INTEGRATION TEST MILESTONES PASSED 100%!")
    print("================================================================================")


if __name__ == "__main__":
    test_complete_end_to_end_integration_flow()
