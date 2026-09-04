import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_assistant_rag_flow():
    print("🚀 Running Phase 10.9 AI Assistant RAG Integration Test Suite...")

    # 1. Test empty question 400 Bad Request
    print("\n1. Testing empty question validation...")
    empty_res = client.post("/assistant/ask", json={"question": "   "})
    print(f"Empty question status: {empty_res.status_code}")
    assert empty_res.status_code == 400
    print("✅ Handled empty question correctly with 400 Bad Request.")

    # 2. Test sample questions
    test_questions = [
        "How do I report illegal dumping?",
        "How long does pothole repair take?",
        "Which department handles streetlights?",
        "How can I track my complaint?",
    ]

    for q in test_questions:
        print(f"\n2. Testing question: '{q}'...")
        res = client.post("/assistant/ask", json={"question": q})
        print(f"Status: {res.status_code}")
        assert res.status_code == 200, f"Failed for question '{q}': {res.text}"
        data = res.json()
        print(f"✅ Grounded Answer: {data['answer'][:100]}...")
        print(f"   Sources: {data['sources']}")
        assert "answer" in data and len(data["answer"]) > 0
        assert "sources" in data and isinstance(data["sources"], list)

    print("\n🎉 ALL PHASE 10.9 AI ASSISTANT TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_assistant_rag_flow()
