import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_real_road_damage_vision_e2e_flow():
    print("================================================================================")
    print("🚀 Running End-to-End Real Image YOLO AI Complaint & Orchestration Test")
    print("================================================================================")

    # 1. Citizen Registration & Auth
    cit_email = f"road_citizen_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n1. Registering Citizen ({cit_email})...")
    reg_cit = client.post(
        "/auth/register",
        data={
            "full_name": "Ramesh Road Test User",
            "email": cit_email,
            "password": "Password123!",
            "role": "Citizen",
        },
    )
    assert reg_cit.status_code == 201
    headers_cit = {"Authorization": f"Bearer {reg_cit.json()['access_token']}"}

    # 2. Upload Real Road Image to Vision Agent Pipeline
    ROOT_DIR = Path(__file__).resolve().parent.parent
    real_img_path = ROOT_DIR / "datasets/road_damage/RDD2022/test/images/India_001104.jpg"
    print(f"\n2. Uploading real road damage image ({real_img_path}) via POST /agent/upload-and-run...")
    assert real_img_path.exists(), f"Image path {real_img_path} does not exist!"

    with open(real_img_path, "rb") as img_file:
        res = client.post(
            "/agent/upload-and-run",
            headers=headers_cit,
            files={"file": ("India_001104.jpg", img_file, "image/jpeg")},
            data={
                "module_hint": "road_damage",
                "address": "100 Feet Road, Indiranagar, Bengaluru",
                "location_source": "GPS",
                "latitude": 12.9784,
                "longitude": 77.6408,
            },
        )

    assert res.status_code == 200, f"Upload and run failed: {res.text}"
    data = res.json()
    cid = data["complaint_id"]
    print(f"✅ Real YOLO Vision Agent Result:")
    print(f"   Complaint ID: {cid}")
    print(f"   Category: {data.get('category')}")
    print(f"   Sub-Category: {data.get('sub_category')}")
    print(f"   Confidence: {data.get('confidence')}")
    print(f"   Severity: {data.get('severity')}")
    print(f"   Department: {data.get('department')}")

    assert cid is not None and cid.startswith("NGS-")
    assert data.get("category") == "ROAD_INFRASTRUCTURE"
    assert data.get("sub_category") == "Alligator_Crack"
    assert data.get("confidence") >= 0.25
    assert data.get("department") == "Roads Department"

    # 3. Admin Inspection & Volunteer Assignment
    admin_email = f"road_admin_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n3. Admin ({admin_email}) inspecting complaint {cid} and assigning volunteer...")
    reg_adm = client.post(
        "/auth/register",
        data={
            "full_name": "Road Infra Admin",
            "email": admin_email,
            "password": "Password123!",
            "role": "Admin",
        },
    )
    headers_adm = {"Authorization": f"Bearer {reg_adm.json()['access_token']}"}

    vol_email = f"road_vol_{uuid.uuid4().hex[:6]}@example.com"
    reg_vol = client.post(
        "/auth/register",
        data={
            "full_name": "Indiranagar Pothole Repair Unit",
            "email": vol_email,
            "password": "Password123!",
            "role": "Volunteer",
        },
    )
    vol_id = reg_vol.json()["user"]["id"]
    headers_vol = {"Authorization": f"Bearer {reg_vol.json()['access_token']}"}

    # Admin assigns task
    assign_res = client.post(
        f"/admin/complaints/{cid}/assign",
        headers=headers_adm,
        json={"volunteer_id": vol_id, "remarks": "Dispatching Road Maintenance Crew to 100 Feet Road."},
    )
    assert assign_res.status_code == 200

    # 4. Volunteer Execution & Field Evidence
    print(f"\n4. Volunteer executing field repairs and uploading evidence...")
    vol_up = client.put(
        f"/volunteer/tasks/{cid}/status",
        headers=headers_vol,
        json={"status": "Resolved", "remarks": "Asphalt patch applied and road surface leveled."},
    )
    assert vol_up.status_code == 200

    # 5. Public Timeline Verification
    print(f"\n5. Verifying Public Tracking Timeline for {cid}...")
    track_res = client.get(f"/tracking/{cid}/timeline")
    assert track_res.status_code == 200
    timeline_data = track_res.json()
    print(f"✅ Final Public Status: {timeline_data['current_status']}")
    print(f"   Latest Audit Remark: {timeline_data['timeline'][-1]['remarks']}")
    assert timeline_data["current_status"] == "Resolved"

    print("================================================================================")
    print("🎉 REAL YOLO VISION AGENT END-TO-END WORKFLOW TEST PASSED 100%!")
    print("================================================================================")


if __name__ == "__main__":
    test_real_road_damage_vision_e2e_flow()
