import requests
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

def test_full_auth_and_complaint_flow():
    # 1. Login or Register Test User
    print("--- 1. Testing Login / Auth ---")
    login_data = {"email": "testuser_prod_check@example.com", "password": "TestPassword123!"}
    res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if res.status_code == 401:
        print("User not found, registering new test user...")
        reg_res = requests.post(
            f"{BASE_URL}/auth/register",
            data={
                "full_name": "Prod Test User",
                "email": "testuser_prod_check@example.com",
                "password": "TestPassword123!",
                "role": "Citizen"
            }
        )
        assert reg_res.status_code in [200, 201], f"Register failed: {reg_res.text}"
        auth_data = reg_res.json()
    else:
        assert res.status_code == 200, f"Login failed: {res.text}"
        auth_data = res.json()

    token = auth_data["access_token"]
    user = auth_data["user"]
    print(f"Login success! User ID: {user['id']}, Email: {user['email']}, Token length: {len(token)}")

    # 2. Testing /auth/me
    print("\n--- 2. Testing /auth/me ---")
    headers = {"Authorization": f"Bearer {token}"}
    me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert me_res.status_code == 200, f"/auth/me failed: {me_res.text}"
    me_data = me_res.json()
    print(f"/auth/me success! Logged-in User: {me_data['full_name']} ({me_data['email']})")

    # 3. Testing /agent/upload-and-run
    print("\n--- 3. Testing /agent/upload-and-run ---")
    sample_img = Path(__file__).resolve().parent.parent / "datasets/potholes/Pothole_Detection/potholes/63.jpg"
    assert sample_img.exists(), f"Sample image missing at {sample_img}"

    t0 = time.time()
    with open(sample_img, "rb") as f:
        files = {"file": ("test_pothole.jpg", f, "image/jpeg")}
        form_data = {
            "address": "452 MG Road, Bengaluru, Karnataka",
            "latitude": "12.9716",
            "longitude": "77.5946",
            "location_source": "GPS"
        }
        upload_res = requests.post(
            f"{BASE_URL}/agent/upload-and-run",
            headers=headers,
            data=form_data,
            files=files
        )
    t1 = time.time()

    duration = t1 - t0
    assert upload_res.status_code == 200, f"Upload and run failed ({upload_res.status_code}): {upload_res.text}"
    comp_data = upload_res.json()
    print(f"/agent/upload-and-run success in {duration:.3f} seconds!")
    print(f"Complaint ID: {comp_data.get('complaint_id')}")
    print(f"Status: {comp_data.get('status')}")
    print(f"Category: {comp_data.get('category')}")
    print(f"Severity: {comp_data.get('severity')}")
    print(f"Department: {comp_data.get('department')}")

if __name__ == "__main__":
    test_full_auth_and_complaint_flow()
