from typing import TypedDict, Optional, List, Dict, Any

class AgentState(TypedDict, total=False):
    """
    Shared Agentic State passed across LangGraph nodes:
    Supervisor -> Vision / NLP / Knowledge -> Routing -> Notification
    """
    request_type: str            # "image", "text", or "question"
    image_path: Optional[str]
    complaint_text: Optional[str]
    question: Optional[str]
    module_hint: Optional[str]
    
    detected: Optional[bool]
    module: Optional[str]
    category: Optional[str]
    sub_category: Optional[str]
    confidence: Optional[float]
    severity: Optional[str]
    department: Optional[str]
    
    complaint_id: Optional[str]
    answer: Optional[str]
    sources: Optional[List[str]]
    response_message: Optional[str]
    estimated_resolution_time: Optional[str]
    status: str
