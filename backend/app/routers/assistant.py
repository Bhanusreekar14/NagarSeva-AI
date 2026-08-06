from fastapi import APIRouter, HTTPException
from app.schemas.assistant import QuestionRequest, AssistantResponse
from app.rag.rag_service import rag_service

router = APIRouter(prefix="/assistant", tags=["RAG Knowledge Assistant"])

@router.post("/ask", response_model=AssistantResponse)
def ask_question(request: QuestionRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    result = rag_service.answer_question(request.question)
    return AssistantResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
