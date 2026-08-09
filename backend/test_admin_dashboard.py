import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_admin_dashboard_security_and_operations():
    print("🚀 Running Phase 10.12 Admin Dashboard Integration & Security Test Suite...")

    # 1. Unauthenticated Access Protection (Expect 401)
    print("\n1. Testing unauthenticated access to /admin/stats (expect 401)...")
    unauth_res = client.get("/admin/stats")
    print(f"   Unauthenticated status: {unauth_res.status_code}")
    assert unauth_res.status_code == 401
    print("✅ Passed: Blocked unauthenticated access.")

    # 2. Register Citizen and test admin endpoints (Expect 403)
    cit_email = f"cit_admin_test_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n2. Registering Citizen ({cit_email}) and testing admin access (expect 403)...")
    reg_cit = client.post(
        "/auth/register",
        data={
            "full_name": "Citizen Restricted",
            "email": cit_email,
            "password": "Password123!",
            "role": "Citizen",
        },
    )
    assert reg_cit.status_code == 201
    headers_cit = {"Authorization": f"Bearer {reg_cit.json()['access_token']}"}

    res_cit = client.get("/admin/stats", headers=headers_cit)
    print(f"   Citizen admin access status: {res_cit.status_code}")
    assert res_cit.status_code == 403
    print("🔒 Security Verified: Citizen users blocked with 403 Forbidden.")

    # 3. Register Volunteer and test admin endpoints (Expect 403)
    vol_email = f"vol_admin_test_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n3. Registering Volunteer ({vol_email}) and testing admin access (expect 403)...")
    reg_vol = client.post(
        "/auth/register",
        data={
            "full_name": "Volunteer Restricted",
            "email": vol_email,
            "password": "Password123!",
            "role": "Volunteer",
        },
    )
    assert reg_vol.status_code == 201
    vol_id = reg_vol.json()["user"]["id"]
    headers_vol = {"Authorization": f"Bearer {reg_vol.json()['access_token']}"}

    res_vol = client.get("/admin/stats", headers=headers_vol)
    print(f"   Volunteer admin access status: {res_vol.status_code}")
    assert res_vol.status_code == 403
    print("🔒 Security Verified: Volunteer users blocked with 403 Forbidden.")

    # 4. Register Admin and test access (Expect 200)
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n4. Registering Admin user ({admin_email})...")
    reg_admin = client.post(
        "/auth/register",
        data={
            "full_name": "Chief Administrator",
            "email": admin_email,
            "password": "Password123!",
            "role": "Admin",
        },
    )
    assert reg_admin.status_code == 201
    headers_admin = {"Authorization": f"Bearer {reg_admin.json()['access_token']}"}

    stats_res = client.get("/admin/stats", headers=headers_admin)
    print(f"   Admin stats status: {stats_res.status_code}")
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    print(f"✅ Admin Stats Retrieved:")
    print(f"   Total Complaints: {stats_data['total_complaints']}")
    print(f"   Pending: {stats_data['status']['pending']}")
    print(f"   Volunteers Count: {stats_data['users']['volunteers']}")

    # 5. Admin Volunteers Roster List
    print("\n5. Testing GET /admin/volunteers...")
    vol_list_res = client.get("/admin/volunteers", headers=headers_admin)
    assert vol_list_res.status_code == 200
    vols = vol_list_res.json()["volunteers"]
    print(f"✅ Retrieved {len(vols)} registered volunteers.")
    target_vol = next((v for v in vols if v["id"] == vol_id), None)
    assert target_vol is not None
    assert "password_hash" not in target_vol, "SECURITY ALERT: Password hash exposed in admin response!"
    print("🔒 Security Verified: Sensitive credentials excluded from volunteer roster response.")

    # 6. Citizen submits a new complaint
    print("\n6. Submitting a test complaint from Citizen...")
    comp_res = client.post(
        "/agent/run",
        headers=headers_cit,
        json={
            "type": "text",
            "payload": "High voltage street light flickering dangerously on 5th avenue.",
            "address": "5th Avenue, Ward 4, Bengaluru",
        },
    )
    assert comp_res.status_code == 200, f"Submission failed: {comp_res.text}"
    cid = comp_res.json()["complaint_id"]
    print(f"✅ Created complaint ID: {cid}")

    # 7. Admin Complaint Search & Multi-Faceted Filtering
    print(f"\n7. Admin filtering complaints for search '{cid[:6]}':...")
    filter_res = client.get(
        f"/admin/complaints?search={cid}",
        headers=headers_admin,
    )
    assert filter_res.status_code == 200
    filtered_list = filter_res.json()["complaints"]
    assert len(filtered_list) >= 1
    found_comp = next((c for c in filtered_list if c["complaint_id"] == cid), None)
    assert found_comp is not None
    print(f"✅ Found complaint details:")
    print(f"   Category: {found_comp['category']}")
    print(f"   Department: {found_comp['department']}")
    print(f"   Reporter Email: {found_comp['reporter']['email']}")

    # 8. Authoritative Admin Volunteer Assignment
    print(f"\n8. Admin assigning complaint {cid} to Volunteer ({vol_email})...")
    assign_res = client.post(
        f"/admin/complaints/{cid}/assign",
        headers=headers_admin,
        json={
            "volunteer_id": vol_id,
            "remarks": "Priority dispatch to Field Unit Electrical Ward 4",
        },
    )
    assert assign_res.status_code == 200
    print(f"✅ Admin assignment response: {assign_res.json()['message']}")

    # 9. Verify task appears in assigned Volunteer's queue
    print("\n9. Verifying assigned task appears in Volunteer's queue (GET /volunteer/tasks)...")
    vol_tasks_res = client.get("/volunteer/tasks", headers=headers_vol)
    assert vol_tasks_res.status_code == 200
    vol_tasks = vol_tasks_res.json()["tasks"]
    task_found = next((t for t in vol_tasks if t["complaint_id"] == cid), None)
    assert task_found is not None
    assert task_found["status"] == "Assigned"
    print("✅ Confirmed task present in volunteer queue with status 'Assigned'.")

    # 10. Verify Public Timeline Synchronization
    print("\n10. Verifying Public Timeline (/tracking/{id}/timeline)...")
    tl_res = client.get(f"/tracking/{cid}/timeline")
    assert tl_res.status_code == 200
    tl_data = tl_res.json()
    print(f"✅ Timeline Status: {tl_data['current_status']}")
    print(f"   Remarks: {tl_data['timeline'][-1]['remarks']}")
    assert tl_data["current_status"] == "Assigned"

    print("\n🎉 ALL PHASE 10.12 ADMIN DASHBOARD TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_admin_dashboard_security_and_operations()
