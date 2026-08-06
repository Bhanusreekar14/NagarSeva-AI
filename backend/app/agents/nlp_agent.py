from app.agents.state import AgentState
from app.services.complaint_classifier import complaint_classifier_service

def nlp_agent_node(state: AgentState) -> AgentState:
    """
    📝 NLP Agent Node:
    Analyzes unstructured text complaints to extract category & confidence.
    """
    text = state.get("complaint_text") or ""
    
    if not text.strip():
        state["status"] = "Error: No complaint_text provided"
        return state

    res = complaint_classifier_service.classify(text)
    
    state["category"] = res["category"]
    state["confidence"] = res["confidence"]
    state["sub_category"] = "Text Complaint"
    state["detected"] = True
    state["status"] = "NLP Analysis Complete"
    
    return state
