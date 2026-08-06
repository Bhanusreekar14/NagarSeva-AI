from typing import Optional, Dict, Any
from app.services.image_router_service import image_router_service
from app.services.complaint_classifier import complaint_classifier_service
from app.services.complaint_service import complaint_service
from app.rag.rag_service import rag_service

class AIOrchestrator:
    """
    Central AI Orchestrator Layer.
    Unifies Vision AI, Text NLP AI, RAG Knowledge Assistant, and Complaint Routing
    into a single agentic controller ready for LangGraph multi-agent workflows.
    """
    def process_vision(self, image_path: str, module_hint: Optional[str] = None):
        return image_router_service.analyze_image(image_path, module_hint=module_hint)

    def process_text_complaint(self, text: str):
        return complaint_classifier_service.classify(text)

    def process_knowledge_query(self, question: str):
        return rag_service.answer_question(question)

    def generate_complaint(self, ai_response):
        return complaint_service.create_complaint_from_ai(ai_response)

ai_orchestrator = AIOrchestrator()
