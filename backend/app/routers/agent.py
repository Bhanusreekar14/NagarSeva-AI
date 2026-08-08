# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import uuid
from pathlib import Path
from typing import Optional, List
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from app.agents.workflow import agent_app

router = APIRouter(prefix="/agent", tags=["Multi-Agent Orchestrator"])

UPLOAD_DIR = Path("uploads")
if not UPLOAD_DIR.is_absolute():
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class AgentRunRequest(BaseModel):
    type: str                     # "image", "text", or "question"
    payload: str                  # text complaint or question
    module_hint: Optional[str] = None

class AgentRunResponse(BaseModel):
    status: str
    complaint_id: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    confidence: Optional[float] = None
    severity: Optional[str] = None
    department: Optional[str] = None
    answer: Optional[str] = None
    sources: Optional[List[str]] = None
    estimated_resolution_time: Optional[str] = None
    response_message: Optional[str] = None

@router.post("/run", response_model=AgentRunResponse)
def run_agent_workflow(request: AgentRunRequest):
    req_type = request.type.lower()
    initial_state = {
        "request_type": req_type,
        "module_hint": request.module_hint,
        "status": "Initialized"
    }

    if req_type == "text":
        initial_state["complaint_text"] = request.payload
    elif req_type == "question":
        initial_state["question"] = request.payload
    elif req_type == "image":
        initial_state["image_path"] = request.payload
    else:
        raise HTTPException(status_code=400, detail="Invalid request type. Must be 'image', 'text', or 'question'.")

    final_state = agent_app.invoke(initial_state)

    return AgentRunResponse(
        status=final_state.get("status", "Completed"),
        complaint_id=final_state.get("complaint_id"),
        category=final_state.get("category"),
        sub_category=final_state.get("sub_category"),
        confidence=final_state.get("confidence"),
        severity=final_state.get("severity"),
        department=final_state.get("department"),
        answer=final_state.get("answer"),
        sources=final_state.get("sources"),
        estimated_resolution_time=final_state.get("estimated_resolution_time"),
        response_message=final_state.get("response_message")
    )

@router.post("/upload-and-run", response_model=AgentRunResponse)
async def upload_image_and_run(
    file: UploadFile = File(...),
    module_hint: Optional[str] = Form(None)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_ext = Path(file.filename).suffix or ".jpg"
    unique_fn = f"agent_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = UPLOAD_DIR / unique_fn

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    initial_state = {
        "request_type": "image",
        "image_path": str(file_path),
        "module_hint": module_hint,
        "status": "Initialized"
    }

    final_state = agent_app.invoke(initial_state)

    return AgentRunResponse(
        status=final_state.get("status", "Completed"),
        complaint_id=final_state.get("complaint_id"),
        category=final_state.get("category"),
        sub_category=final_state.get("sub_category"),
        confidence=final_state.get("confidence"),
        severity=final_state.get("severity"),
        department=final_state.get("department"),
        answer=final_state.get("answer"),
        sources=final_state.get("sources"),
        estimated_resolution_time=final_state.get("estimated_resolution_time"),
        response_message=final_state.get("response_message")
    )
