from app.agents.state import AgentState

def supervisor_agent_node(state: AgentState) -> str:
    """
    🎯 Supervisor Agent Node:
    Inspects incoming request_type ('image', 'text', 'question')
    and routes execution to the target specialized agent.
    """
    req_type = (state.get("request_type") or "").lower()

    if req_type == "image":
        return "vision_agent"
    elif req_type == "text":
        return "nlp_agent"
    elif req_type == "question":
        return "knowledge_agent"
    else:
        # Auto-detect fallback
        if state.get("image_path"):
            return "vision_agent"
        elif state.get("question"):
            return "knowledge_agent"
        else:
            return "nlp_agent"
