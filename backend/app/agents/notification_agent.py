from app.agents.state import AgentState
from app.schemas.image_response import ImageResponse
from app.services.complaint_service import complaint_service
from app.database.connection import SessionLocal
from app.services.complaint_persistence import persist_ai_complaint


def notification_agent_node(state: AgentState) -> AgentState:
    """
    🔔 Notification Agent Node:
    Generates official tracking ID, resolution SLA timeframe,
    persists complaint to database, and formats citizen response message.
    """
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
    
    # Persist to Supabase DB
    db = SessionLocal()
    try:
        complaint_dict = {
            "category": state.get("category", "OTHER_CIVIC"),
            "sub_category": state.get("sub_category", "General Issue"),
            "severity": state.get("severity", "Medium"),
            "priority": state.get("severity", "Medium"),
            "department": state.get("department", "Municipal Services Department"),
            "confidence": state.get("confidence", 0.85),
            "model": state.get("module", "NagarSeva AI")
        }
        db_complaint = persist_ai_complaint(
            db=db,
            result=complaint_dict,
            description=state.get("complaint_text") or state.get("description"),
            image_url=state.get("image_path")
        )
        complaint_id = db_complaint.complaint_number
    except Exception as e:
        print(f"Error persisting complaint to DB: {e}")
        complaint_id = complaint.complaint_id
    finally:
        db.close()

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
        f"ID: {complaint_id}\n"
        f"Category: {state.get('category', 'OTHER_CIVIC')}\n"
        f"Department: {state.get('department', 'Municipal Services Department')}\n"
        f"Priority: {severity}\n"
        f"Expected Resolution: {sla}"
    )

    state["complaint_id"] = complaint_id
    state["estimated_resolution_time"] = sla
    state["response_message"] = msg
    state["status"] = "Complaint Registered & Citizen Notified"
    
    return state
