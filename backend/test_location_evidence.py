import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_location_evidence_flow():
    print("🚀 Running Phase 10.6 Location & Evidence Test Suite...")

    # 1. Test Complaint Creation with Location Parameters
    print("\n1. Testing Complaint Creation with GPS Location...")
    dummy_image = ("issue_photo.jpg", b"fake_jpg_image_content", "image/jpeg")

    response = client.post(
        "/agent/upload-and-run",
        files={"file": dummy_image},
        data={
            "latitude": "12.971600",
            "longitude": "77.594600",
            "address": "MG Road Metro Station, Bengaluru",
            "location_source": "GPS",
        },
    )

    print(f"Agent response status: {response.status_code}")
    assert response.status_code == 200, f"Failed: {response.text}"
    res_data = response.json()
    complaint_id = res_data.get("complaint_id")
    print(f"✅ Complaint created with ID: {complaint_id}")
    print(f"   Address: {res_data.get('address')}")
    print(f"   Coordinates: {res_data.get('latitude')}, {res_data.get('longitude')}")
    print(f"   Location Source: {res_data.get('location_source')}")

    assert complaint_id is not None
    assert res_data.get("location_source") == "GPS"

    # 2. Test Multi-Evidence Attachments Upload (Image, Video, Document)
    print("\n2. Testing Multi-Evidence File Uploads...")
    evidence_1 = ("evidence_photo.png", b"fake_png_bytes", "image/png")
    evidence_2 = ("field_video.mp4", b"fake_mp4_bytes", "video/mp4")
    evidence_3 = ("inspection_doc.pdf", b"fake_pdf_bytes", "application/pdf")

    att_response = client.post(
        f"/complaints/{complaint_id}/attachments",
        files=[
            ("files", evidence_1),
            ("files", evidence_2),
            ("files", evidence_3),
        ],
    )

    print(f"Attachment upload status: {att_response.status_code}")
    assert att_response.status_code == 201, f"Failed: {att_response.text}"
    att_data = att_response.json()
    print(f"✅ Uploaded {att_data['count']} evidence files:")
    for att in att_data["attachments"]:
        print(f"   - {att['file_name']} (Type: {att['file_type']}, URL: {att['file_url']})")

    assert att_data["count"] == 3

    # 3. Test Retrieval of Complaint Details with Attachments
    print("\n3. Testing GET /complaints/{complaint_id} with Location & Evidence...")
    get_res = client.get(f"/complaints/{complaint_id}")
    assert get_res.status_code == 200, f"Get failed: {get_res.text}"
    comp_details = get_res.json()

    print(f"✅ Complaint Details Retrieved:")
    print(f"   ID: {comp_details['complaint_id']}")
    print(f"   Location: {comp_details['address']} ({comp_details['latitude']}, {comp_details['longitude']})")
    print(f"   Source: {comp_details['location_source']}")
    print(f"   Attachments Count: {len(comp_details['attachments'])}")

    assert comp_details["location_source"] == "GPS"
    assert len(comp_details["attachments"]) == 3

    print("\n🎉 ALL PHASE 10.6 LOCATION & EVIDENCE TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_location_evidence_flow()
