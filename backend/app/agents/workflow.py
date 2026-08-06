from langgraph.graph import StateGraph, END, START
from app.agents.state import AgentState
from app.agents.supervisor import supervisor_agent_node
from app.agents.vision_agent import vision_agent_node
from app.agents.nlp_agent import nlp_agent_node
from app.agents.knowledge_agent import knowledge_agent_node
from app.agents.routing_agent import routing_agent_node
from app.agents.notification_agent import notification_agent_node

def create_agent_workflow():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("vision_agent", vision_agent_node)
    workflow.add_node("nlp_agent", nlp_agent_node)
    workflow.add_node("knowledge_agent", knowledge_agent_node)
    workflow.add_node("routing_agent", routing_agent_node)
    workflow.add_node("notification_agent", notification_agent_node)

    # Add Supervisor Conditional Edges from START
    workflow.add_conditional_edges(
        START,
        supervisor_agent_node,
        {
            "vision_agent": "vision_agent",
            "nlp_agent": "nlp_agent",
            "knowledge_agent": "knowledge_agent"
        }
    )

    # Complaint Processing Pipeline: Vision/NLP -> Routing -> Notification -> END
    workflow.add_edge("vision_agent", "routing_agent")
    workflow.add_edge("nlp_agent", "routing_agent")
    workflow.add_edge("routing_agent", "notification_agent")
    workflow.add_edge("notification_agent", END)

    # Q&A Knowledge Pipeline: Knowledge Agent -> END
    workflow.add_edge("knowledge_agent", END)

    return workflow.compile()

agent_app = create_agent_workflow()
