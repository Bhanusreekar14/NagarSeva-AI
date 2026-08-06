from typing import Optional, Dict, Any
from app.schemas.complaint_text import TextAnalysisResponse
from app.services.complaint_classifier import complaint_classifier_service
from app.services.priority_service import priority_service
from app.utils.department_mapping import get_department_for_category

class ComplaintRouterService:
    """
    Unified Orchestration Controller.
    Serves as the central AI router bridging Multimodal Vision, Text NLP,
    Priority Scoring, and Department Routing.
    """
    def analyze_text(self, text: str) -> TextAnalysisResponse:
        # Classify category & confidence
        classification = complaint_classifier_service.classify(text)
        category = classification["category"]
        confidence = classification["confidence"]

        # Assign priority & department
        priority = priority_service.get_priority(category)
        department = get_department_for_category(category)

        return TextAnalysisResponse(
            success=True,
            category=category,
            sub_category="Text Complaint",
            confidence=confidence,
            priority=priority,
            department=department
        )

complaint_router_service = ComplaintRouterService()
