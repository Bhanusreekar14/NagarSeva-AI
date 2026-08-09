import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_tracking_integration():
    print("🚀 Running Phase 10.8 Complaint Tracking Integration Test Suite...")

    # 1. Create a fresh test complaint via AI endpoint
    print("\n1. Creating test complaint...")
    dummy_img = ("pothole.jpg", b"fake_pothole_bytes", "image/jpeg")
    create_res = client.post(
        "/agent/upload-and-run",
        files={"file": dummy_img},
        data={
            "address": "100 Feet Road, Indiranagar, Bengaluru",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "location_source": "GPS",
        },
    )
    assert create_res.status_code == 200, f"Create failed: {create_res.text}"
    cid = create_res.json()["complaint_id"]
    print(f"✅ Created complaint with ID: {cid}")

    # 2. Get Complaint Details
    print("\n2. Fetching GET /complaints/{id}...")
    details_res = client.get(f"/complaints/{cid}")
    assert details_res.status_code == 200, f"Get details failed: {details_res.text}"
    details = details_res.json()
    print(f"✅ Details retrieved:")
    print(f"   Category: {details['category']}")
    print(f"   Department: {details['department']}")
    print(f"   Initial Status: {details['status']}")
    print(f"   Address: {details['address']}")
    assert details["complaint_id"] == cid
    assert details["status"] == "Pending"

    # 3. Get Initial Timeline
    print("\n3. Fetching GET /tracking/{id}/timeline...")
    tl_res = client.get(f"/tracking/{cid}/timeline")
    assert tl_res.status_code == 200, f"Get timeline failed: {tl_res.text}"
    tl_data = tl_res.json()
    print(f"✅ Initial timeline current status: {tl_data['current_status']}")
    assert tl_data["complaint_id"] == cid

    # 4. Update Status to 'Assigned' and 'In Progress'
    print("\n4. Updating status to 'Assigned' & 'In Progress'...")
    up1 = client.put(
        f"/tracking/{cid}/status",
        json={"status": "Assigned", "remarks": "Assigned to Roads Field Unit 4"},
    )
    assert up1.status_code == 200, f"Update status failed: {up1.text}"

    up2 = client.put(
        f"/tracking/{cid}/status",
        json={"status": "In Progress", "remarks": "Pothole repair material dispatched"},
    )
    assert up2.status_code == 200, f"Update status failed: {up2.text}"

    # 5. Re-fetch Timeline to verify history records
    print("\n5. Verifying timeline audit history...")
    tl_res2 = client.get(f"/tracking/{cid}/timeline")
    assert tl_res2.status_code == 200
    tl_data2 = tl_res2.json()
    print(f"✅ Current status: {tl_data2['current_status']}")
    print(f"   History entries count: {len(tl_data2['timeline'])}")
    for item in tl_data2["timeline"]:
        print(f"   - {item['old_status']} ➔ {item['new_status']} | Remarks: {item['remarks']}")

    assert tl_data2["current_status"] == "In Progress"
    assert len(tl_data2["timeline"]) == 2

    # 6. Test Invalid/Non-Existent Complaint ID 404
    print("\n6. Testing 404 for non-existent complaint ID...")
    fake_res = client.get("/complaints/NGS-NONEXISTENT-999")
    assert fake_res.status_code == 404
    print("✅ Handled non-existent complaint ID correctly with 404.")

    print("\n🎉 ALL PHASE 10.8 COMPLAINT TRACKING TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_tracking_integration()
