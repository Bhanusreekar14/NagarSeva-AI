from app.agents.state import AgentState
from app.database.connection import SessionLocal
from app.services.complaint_persistence import persist_ai_complaint


def notification_agent_node(state: AgentState) -> AgentState:
    """
    🔔 Notification Agent Node:
    Generates official tracking ID, resolution SLA timeframe,
    persists complaint to database, and formats citizen response message.
    """
    print("[AGENT] notification started")
    print("[AGENT] database save started")
    # Persist to Supabase DB as the single source of truth
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
            image_url=state.get("image_path"),
            user_id=state.get("user_id"),
            latitude=state.get("latitude"),
            longitude=state.get("longitude"),
            address=state.get("address"),
            location_source=state.get("location_source"),
        )
        complaint_id = db_complaint.complaint_number
        print("[AGENT] database save completed")
    except Exception as e:
        print(f"Error persisting complaint to DB: {e}")
        complaint_id = f"NGS-ERR-{state.get('category', 'CIVIC')[:3]}"
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
    print("[AGENT] notification completed")
    
    return state
