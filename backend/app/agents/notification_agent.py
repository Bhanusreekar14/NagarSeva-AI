from app.agents.state import AgentState
from app.schemas.image_response import ImageResponse
from app.services.complaint_service import complaint_service

def notification_agent_node(state: AgentState) -> AgentState:
    """
    🔔 Notification Agent Node:
    Generates official tracking ID, resolution SLA timeframe,
    and formats citizen response message.
    """
    # Create ImageResponse wrapper for complaint generator
    fake_ai_res = ImageResponse(
        success=True,
        detected=state.get("detected", True),
        module=state.get("module", "Multi-Agent AI"),
        category=state.get("category", "CIVIC_ISSUE"),
        sub_category=state.get("sub_category", "General Issue"),
        confidence=state.get("confidence", 0.85),
        severity=state.get("severity", "Medium"),
        department=state.get("department", "General Municipal Department")
    )
    
    complaint = complaint_service.create_complaint_from_ai(fake_ai_res)
    
    # Calculate SLA timeframe
    severity = state.get("severity", "Medium")
    if severity == "Critical":
        sla = "4 Hours (Emergency Support)"
    elif severity == "High":
        sla = "24 - 48 Hours"
    elif severity == "Medium":
        sla = "3 - 5 Business Days"
    else:
        sla = "7 Business Days"

    msg = (
        f"Complaint Registered Successfully.\n"
        f"ID: {complaint.complaint_id}\n"
        f"Category: {complaint.category}\n"
        f"Department: {complaint.department}\n"
        f"Priority: {complaint.severity}\n"
        f"Expected Resolution: {sla}"
    )

    state["complaint_id"] = complaint.complaint_id
    state["estimated_resolution_time"] = sla
    state["response_message"] = msg
    state["status"] = "Complaint Registered & Citizen Notified"
    
    return state
