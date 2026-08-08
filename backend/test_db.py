import sys
from pathlib import Path

# Add backend dir to sys.path
sys.path.append(str(Path(__file__).resolve().parent / "app"))

from app.database.connection import test_connection

if __name__ == "__main__":
    success = test_connection()
    if success:
        print("✅ Successfully connected to Supabase PostgreSQL")
    else:
        print("❌ Failed to connect to Supabase PostgreSQL")
