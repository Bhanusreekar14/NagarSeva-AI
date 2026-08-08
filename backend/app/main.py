# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.road_damage import router as road_router
from app.routers.garbage import router as garbage_router
from app.routers.image_router import router as image_router
from app.routers.complaint import router as complaint_router
from app.routers.assistant import router as assistant_router
from app.routers.agent import router as agent_router
from app.routers.complaints_db import router as complaint_db_router
from app.routers.tracking import router as tracking_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI(
    title="NagarSeva AI",
    version="1.0",
    description="Intelligent Civic Issue Management & Multi-Agent Routing Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router)
app.include_router(complaint_db_router)
app.include_router(tracking_router)
app.include_router(dashboard_router)
app.include_router(image_router)
app.include_router(complaint_router)
app.include_router(assistant_router)
app.include_router(road_router)
app.include_router(garbage_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to NagarSeva AI",
        "status": "Running"
    }
