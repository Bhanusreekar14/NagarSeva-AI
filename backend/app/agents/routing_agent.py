from app.agents.state import AgentState
from app.utils.department_mapping import get_department_for_category
from app.services.priority_service import priority_service

def routing_agent_node(state: AgentState) -> AgentState:
    """
    🏢 Routing Agent Node:
    Assigns target municipal department and severity / priority scoring.
    """
    category = state.get("category") or "CIVIC_ISSUE"
    curr_dept = state.get("department")
    curr_severity = state.get("severity")
    confidence = state.get("confidence") or 0.5

    assigned_dept = get_department_for_category(category, default_department=curr_dept or "General Municipal Department")
    assigned_severity = curr_severity if curr_severity and curr_severity != "None" else priority_service.get_priority(category)

    state["department"] = assigned_dept
    state["severity"] = assigned_severity
    state["status"] = "Department Routing Complete"
    
    return state
