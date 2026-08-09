import sys
import uuid
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_flow():
    print("🚀 Running Authentication Test Suite...")

    # Unique test user email
    test_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "SecurePassword123!"

    # 1. Test Citizen Registration with ID Document Upload
    print("\n1. Testing Citizen Registration (with document upload)...")
    dummy_file = ("test_id.png", b"fake_image_content_bytes", "image/png")
    
    register_response = client.post(
        "/auth/register",
        data={
            "full_name": "Ramesh Kumar",
            "email": test_email,
            "password": test_password,
            "phone": "+91 9876543210",
            "address": "123 MG Road, Bengaluru",
            "role": "Citizen",
            "id_proof_type": "Aadhaar",
        },
        files={"id_proof_file": dummy_file},
    )

    print(f"Register status: {register_response.status_code}")
    assert register_response.status_code == 201, f"Failed: {register_response.text}"
    reg_data = register_response.json()
    token = reg_data["access_token"]
    user_info = reg_data["user"]

    print("✅ User created successfully:")
    print(f"   Name: {user_info['full_name']}")
    print(f"   Role: {user_info['role']}")
    print(f"   ID Type: {user_info['id_proof_type']}")
    print(f"   ID URL: {user_info['id_proof_url']}")
    print(f"   Verification Status: {user_info['verification_status']}")
    assert user_info["role"] == "Citizen"
    assert user_info["verification_status"] == "Pending"
    assert user_info["id_proof_url"] is not None

    # 2. Test Login
    print("\n2. Testing Login...")
    login_response = client.post(
        "/auth/login",
        json={"email": test_email, "password": test_password},
    )
    print(f"Login status: {login_response.status_code}")
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    login_data = login_response.json()
    login_token = login_data["access_token"]
    print("✅ Login successful, access token retrieved.")

    # 3. Test /auth/me
    print("\n3. Testing GET /auth/me with Bearer token...")
    me_response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {login_token}"},
    )
    print(f"GET /auth/me status: {me_response.status_code}")
    assert me_response.status_code == 200, f"GET /auth/me failed: {me_response.text}"
    me_user = me_response.json()
    print(f"✅ Authenticated user profile: {me_user['full_name']} ({me_user['email']})")

    # 4. Test Volunteer Registration
    print("\n4. Testing Volunteer Registration...")
    volunteer_email = f"volunteer_{uuid.uuid4().hex[:8]}@example.com"
    vol_response = client.post(
        "/auth/register",
        data={
            "full_name": "Priya Sharma",
            "email": volunteer_email,
            "password": test_password,
            "phone": "+91 9123456789",
            "address": "45 Civil Lines, Mysuru",
            "role": "Volunteer",
            "id_proof_type": "Voter ID",
        },
    )
    assert vol_response.status_code == 201, f"Volunteer registration failed: {vol_response.text}"
    vol_user = vol_response.json()["user"]
    print(f"✅ Volunteer created: {vol_user['full_name']} | Role: {vol_user['role']}")
    assert vol_user["role"] == "Volunteer"

    print("\n🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_auth_flow()
