import sys
import uuid
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_citizen_dashboard_security_and_stats():
    print("🚀 Running Phase 10.10 Citizen Dashboard Integration & Security Test Suite...")

    # 1. Unauthenticated GET /dashboard/citizen -> 401 Unauthorized
    print("\n1. Testing unauthenticated access protection...")
    unauth_res = client.get("/dashboard/citizen")
    print(f"Unauthenticated status: {unauth_res.status_code}")
    assert unauth_res.status_code == 401
    print("✅ Successfully blocked unauthenticated access with 401 Unauthorized.")

    # 2. Register Citizen A & submit 2 complaints
    cit_a_email = f"cit_a_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n2. Registering Citizen A ({cit_a_email})...")
    reg_a = client.post(
        "/auth/register",
        data={
            "full_name": "Citizen Alice",
            "email": cit_a_email,
            "password": "Password123!",
            "phone": "9876543210",
            "role": "Citizen",
            "address": "Indiranagar 100ft Road, Bengaluru",
        },
    )
    assert reg_a.status_code == 201, f"Registration failed: {reg_a.text}"
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    print("   Submitting 2 complaints for Citizen A...")
    comp_a1 = client.post(
        "/agent/run",
        headers=headers_a,
        json={
            "type": "text",
            "payload": "Overflowing garbage bin near Indiranagar metro station.",
            "address": "Indiranagar Metro, Bengaluru",
        },
    )
    assert comp_a1.status_code == 200
    cid_a1 = comp_a1.json()["complaint_id"]

    comp_a2 = client.post(
        "/agent/run",
        headers=headers_a,
        json={
            "type": "text",
            "payload": "Broken streetlight causing darkness at night.",
            "address": "12th Main Road, Indiranagar, Bengaluru",
        },
    )
    assert comp_a2.status_code == 200
    cid_a2 = comp_a2.json()["complaint_id"]
    print(f"✅ Citizen A submitted complaints: {cid_a1}, {cid_a2}")

    # 3. Register Citizen B & submit 1 complaint
    cit_b_email = f"cit_b_{uuid.uuid4().hex[:6]}@example.com"
    print(f"\n3. Registering Citizen B ({cit_b_email})...")
    reg_b = client.post(
        "/auth/register",
        data={
            "full_name": "Citizen Bob",
            "email": cit_b_email,
            "password": "Password123!",
            "phone": "9123456789",
            "role": "Citizen",
            "address": "Koramangala 4th Block, Bengaluru",
        },
    )
    assert reg_b.status_code == 201, f"Registration failed: {reg_b.text}"
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    print("   Submitting 1 complaint for Citizen B...")
    comp_b1 = client.post(
        "/agent/run",
        headers=headers_b,
        json={
            "type": "text",
            "payload": "Large pothole on 80 Feet Road Koramangala.",
            "address": "80 Feet Road, Koramangala, Bengaluru",
        },
    )
    assert comp_b1.status_code == 200
    cid_b1 = comp_b1.json()["complaint_id"]
    print(f"✅ Citizen B submitted complaint: {cid_b1}")

    # 4. Authenticate as Citizen A & call GET /dashboard/citizen
    print("\n4. Verifying Citizen A Dashboard Isolation...")
    dash_a = client.get("/dashboard/citizen", headers=headers_a)
    assert dash_a.status_code == 200
    data_a = dash_a.json()
    print(f"✅ Citizen A User Name: {data_a['user']['full_name']}")
    print(f"   Total Complaints Count: {data_a['stats']['total']}")
    print(f"   Fetched Complaints List Count: {len(data_a['complaints'])}")

    cids_a_fetched = [c["complaint_id"] for c in data_a["complaints"]]
    assert data_a["stats"]["total"] >= 2
    assert cid_a1 in cids_a_fetched
    assert cid_a2 in cids_a_fetched
    assert cid_b1 not in cids_a_fetched, "SECURITY FAILURE: Citizen A can see Citizen B's complaint!"
    print("🔒 SECURITY VERIFIED: Citizen A cannot see Citizen B's complaints.")

    # 5. Authenticate as Citizen B & call GET /dashboard/citizen
    print("\n5. Verifying Citizen B Dashboard Isolation...")
    dash_b = client.get("/dashboard/citizen", headers=headers_b)
    assert dash_b.status_code == 200
    data_b = dash_b.json()
    print(f"✅ Citizen B User Name: {data_b['user']['full_name']}")
    print(f"   Total Complaints Count: {data_b['stats']['total']}")

    cids_b_fetched = [c["complaint_id"] for c in data_b["complaints"]]
    assert cid_b1 in cids_b_fetched
    assert cid_a1 not in cids_b_fetched, "SECURITY FAILURE: Citizen B can see Citizen A's complaint!"
    assert cid_a2 not in cids_b_fetched, "SECURITY FAILURE: Citizen B can see Citizen A's complaint!"
    print("🔒 SECURITY VERIFIED: Citizen B cannot see Citizen A's complaints.")

    print("\n🎉 ALL PHASE 10.10 CITIZEN DASHBOARD TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_citizen_dashboard_security_and_stats()
