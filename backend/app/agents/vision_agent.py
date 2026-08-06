from app.agents.state import AgentState
from app.services.image_router_service import image_router_service

def vision_agent_node(state: AgentState) -> AgentState:
    """
    👁️ Vision Agent Node:
    Processes uploaded images via YOLOv11 Computer Vision models.
    """
    image_path = state.get("image_path")
    module_hint = state.get("module_hint")
    
    if not image_path:
        state["status"] = "Error: No image_path provided"
        return state

    ai_res = image_router_service.analyze_image(image_path, module_hint=module_hint)
    
    state["detected"] = ai_res.detected
    state["module"] = ai_res.module
    state["category"] = ai_res.category
    state["sub_category"] = ai_res.sub_category
    state["confidence"] = ai_res.confidence
    state["severity"] = ai_res.severity
    state["department"] = ai_res.department
    state["status"] = "Vision Analysis Complete"
    
    return state
