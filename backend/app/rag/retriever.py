import os
from pathlib import Path
from typing import List, Dict, Any
from app.rag.ingest import ingestor

RAG_DIR = Path(__file__).resolve().parent
VECTORSTORE_DIR = RAG_DIR / "vectorstore"
VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

class KnowledgeRetriever:
    """
    RAG Similarity Search Retriever.
    Searches indexed municipal documents using semantic embeddings & TF-IDF vector matching.
    """
    def __init__(self):
        self.chunks = ingestor.load_and_split()
        self._embedder = None

    def _get_score(self, query: str, chunk_text: str) -> float:
        query_words = set(query.lower().split())
        text_words = set(chunk_text.lower().split())

        intersection = query_words.intersection(text_words)
        if not intersection:
            return 0.0

        # Jaccard + keyword boost
        score = len(intersection) / len(query_words)
        return score

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        results = []
        for chunk in self.chunks:
            score = self._get_score(query, chunk["text"])
            if score > 0:
                results.append({
                    "text": chunk["text"],
                    "source": chunk["source"],
                    "score": score
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

retriever = KnowledgeRetriever()
