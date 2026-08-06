import os

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "NagarSeva AI")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")

settings = Settings()
