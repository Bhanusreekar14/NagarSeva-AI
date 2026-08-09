import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_volunteer_portal_workflow():
    print("🚀 Running Phase 10.11 Volunteer Portal Integration & Authorization Test Suite...")

    # 1. Register Citizen and verify 403 on /volunteer/tasks
    cit_email = f"citizen_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n1. Registering Citizen ({cit_email})...")
    reg_cit = client.post(
        "/auth/register",
        data={
            "full_name": "Standard Citizen",
            "email": cit_email,
            "password": "Password123!",
            "role": "Citizen",
        },
    )
    assert reg_cit.status_code == 201
    token_cit = reg_cit.json()["access_token"]
    headers_cit = {"Authorization": f"Bearer {token_cit}"}

    print("   Testing Citizen access to /volunteer/tasks (expect 403)...")
    forbidden_res = client.get("/volunteer/tasks", headers=headers_cit)
    print(f"   Citizen access status: {forbidden_res.status_code}")
    assert forbidden_res.status_code == 403
    print("✅ Authorization Enforcement Passed: Citizens cannot access volunteer endpoints.")

    # 2. Register Volunteer A & Volunteer B
    vol_a_email = f"vol_a_{uuid.uuid4().hex[:6]}@example.com"
    vol_b_email = f"vol_b_{uuid.uuid4().hex[:6]}@example.com"

    print(f"\n2. Registering Volunteer A ({vol_a_email}) and Volunteer B ({vol_b_email})...")
    reg_vol_a = client.post(
        "/auth/register",
        data={
            "full_name": "Volunteer Alpha",
            "email": vol_a_email,
            "password": "Password123!",
            "role": "Volunteer",
        },
    )
    assert reg_vol_a.status_code == 201
    headers_vol_a = {"Authorization": f"Bearer {reg_vol_a.json()['access_token']}"}

    reg_vol_b = client.post(
        "/auth/register",
        data={
            "full_name": "Volunteer Beta",
            "email": vol_b_email,
            "password": "Password123!",
            "role": "Volunteer",
        },
    )
    assert reg_vol_b.status_code == 201
    headers_vol_b = {"Authorization": f"Bearer {reg_vol_b.json()['access_token']}"}

    # 3. Create a complaint to be assigned
    print("\n3. Creating test complaint...")
    comp_res = client.post(
        "/agent/run",
        headers=headers_cit,
        json={
            "type": "text",
            "payload": "Water pipeline leakage flooding street corner.",
            "address": "MG Road, Zone 2, Bengaluru",
        },
    )
    assert comp_res.status_code == 200
    cid = comp_res.json()["complaint_id"]
    print(f"✅ Created complaint ID: {cid}")

    # 4. Assign complaint to Volunteer A
    print(f"\n4. Assigning complaint {cid} to Volunteer A...")
    assign_res = client.post(f"/volunteer/tasks/{cid}/assign", headers=headers_vol_a)
    assert assign_res.status_code == 200
    print(f"✅ Assignment response: {assign_res.json()['message']}")

    # 5. Volunteer A lists tasks
    print("\n5. Volunteer A checking task queue...")
    tasks_a = client.get("/volunteer/tasks", headers=headers_vol_a).json()
    assert tasks_a["count"] == 1
    assert tasks_a["tasks"][0]["complaint_id"] == cid
    print("✅ Task present in Volunteer A queue.")

    # 6. Volunteer B tries to update Volunteer A's complaint -> 403 Forbidden
    print("\n6. Testing cross-volunteer isolation (Volunteer B updating Volunteer A's task)...")
    vol_b_update = client.put(
        f"/volunteer/tasks/{cid}/status",
        headers=headers_vol_b,
        json={"status": "In Progress", "remarks": "Malicious attempt"},
    )
    print(f"   Volunteer B update status: {vol_b_update.status_code}")
    assert vol_b_update.status_code == 403
    print("🔒 Task Isolation Enforcement Passed: Volunteers cannot update tasks assigned to others.")

    # 7. Volunteer A updates status to 'Inspection' & 'In Progress'
    print("\n7. Volunteer A updating task status to 'Inspection' and 'In Progress'...")
    up1 = client.put(
        f"/volunteer/tasks/{cid}/status",
        headers=headers_vol_a,
        json={"status": "Inspection", "remarks": "Verified pipeline leak on site."},
    )
    assert up1.status_code == 200

    up2 = client.put(
        f"/volunteer/tasks/{cid}/status",
        headers=headers_vol_a,
        json={"status": "In Progress", "remarks": "Repair team replaced damaged pipe segment."},
    )
    assert up2.status_code == 200
    print("✅ Status updates completed successfully by Volunteer A.")

    # 8. Volunteer A uploads field evidence photo
    print("\n8. Volunteer A uploading field evidence file...")
    dummy_ev = ("repaired_pipe.jpg", b"fake_field_image_bytes", "image/jpeg")
    ev_res = client.post(
        f"/volunteer/tasks/{cid}/evidence",
        headers=headers_vol_a,
        files={"files": dummy_ev},
    )
    assert ev_res.status_code == 201
    print(f"✅ Evidence uploaded. Count: {ev_res.json()['count']}")

    # 9. Volunteer A updates status to 'Resolved'
    print("\n9. Volunteer A marking task as 'Resolved'...")
    up3 = client.put(
        f"/volunteer/tasks/{cid}/status",
        headers=headers_vol_a,
        json={"status": "Resolved", "remarks": "Site restored and pressure tested OK."},
    )
    assert up3.status_code == 200

    # 10. Verify Public Timeline Synchronization
    print("\n10. Verifying Public Timeline (/tracking/{id}/timeline)...")
    tl_res = client.get(f"/tracking/{cid}/timeline")
    assert tl_res.status_code == 200
    tl_data = tl_res.json()
    print(f"✅ Final Public Status: {tl_data['current_status']}")
    print(f"   Audit Trail Entries Count: {len(tl_data['timeline'])}")
    for item in tl_data["timeline"]:
        print(f"   - {item['old_status']} ➔ {item['new_status']} | Remarks: {item['remarks']}")

    assert tl_data["current_status"] == "Resolved"
    assert len(tl_data["timeline"]) >= 3

    print("\n🎉 ALL PHASE 10.11 VOLUNTEER PORTAL TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_volunteer_portal_workflow()
