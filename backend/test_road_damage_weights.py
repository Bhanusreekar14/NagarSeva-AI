import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_road_damage_model_endpoint():
    print("🚀 Testing POST /road-damage/detect with trained best.pt model...")

    sample_img_path = Path("datasets/road_damage/RDD2022/test/images/India_001104.jpg")
    if not sample_img_path.exists():
        print(f"Sample image {sample_img_path} not found, skipping.")
        return

    with open(sample_img_path, "rb") as f:
        response = client.post(
            "/road-damage/detect",
            files={"file": ("road.jpg", f, "image/jpeg")}
        )

    print(f"Status: {response.status_code}")
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    print("✅ Model Detection Response:")
    print(f"   Success: {data.get('success')}")
    print(f"   Detected: {data.get('detected')}")
    print(f"   Category: {data.get('category')}")
    print(f"   Sub-Category: {data.get('sub_category')}")
    print(f"   Confidence: {data.get('confidence')}")
    print(f"   Severity: {data.get('severity')}")
    print(f"   Department: {data.get('department')}")

    assert data.get("success") is True
    print("\n🎉 ROAD DAMAGE BEST.PT MODEL INTEGRATION TEST PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_road_damage_model_endpoint()
