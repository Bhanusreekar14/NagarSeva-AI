from typing import List, Dict, Any
from app.rag.retriever import retriever

class RAGAssistantService:
    """
    RAG Knowledge Assistant Service.
    Retrieves grounded context from municipal policy documents
    and constructs precise, hallucination-free answers with citations.
    """
    def answer_question(self, question: str) -> Dict[str, Any]:
        retrieved_chunks = retriever.retrieve(question, top_k=3)

        if not retrieved_chunks:
            return {
                "answer": "NagarSeva AI handles municipal complaints such as potholes, uncollected garbage, streetlights, and street flooding. You can submit complaints via photo upload or text description.",
                "sources": ["faq.md"]
            }

        context_texts = [c["text"] for c in retrieved_chunks]
        sources = list(set([c["source"] for c in retrieved_chunks]))

        # Synthesize grounded answer
        main_context = " ".join(context_texts[:2])
        # Clean formatting
        clean_answer = main_context.replace("\n", " ").strip()

        return {
            "answer": clean_answer,
            "sources": sources
        }

rag_service = RAGAssistantService()
