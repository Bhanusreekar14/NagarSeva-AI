from fastapi import FastAPI
from app.routers.road_damage import router as road_router
from app.routers.garbage import router as garbage_router
from app.routers.image_router import router as image_router
from app.routers.complaint import router as complaint_router
from app.routers.assistant import router as assistant_router
from app.routers.agent import router as agent_router

app = FastAPI(
    title="NagarSeva AI",
    version="1.0",
    description="Intelligent Civic Issue Management & Multi-Agent Routing Engine"
)

app.include_router(agent_router)
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
