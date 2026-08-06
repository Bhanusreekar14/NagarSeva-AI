from app.agents.state import AgentState
from app.rag.rag_service import rag_service

def knowledge_agent_node(state: AgentState) -> AgentState:
    """
    📚 Knowledge Agent Node:
    Queries municipal RAG knowledge base for grounded Q&A and citations.
    """
    question = state.get("question") or ""
    
    if not question.strip():
        state["status"] = "Error: No question provided"
        return state

    res = rag_service.answer_question(question)
    
    state["answer"] = res["answer"]
    state["sources"] = res["sources"]
    state["response_message"] = res["answer"]
    state["status"] = "Knowledge Answered"
    
    return state
