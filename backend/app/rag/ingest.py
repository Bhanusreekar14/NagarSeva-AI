import os
import glob
from pathlib import Path
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

RAG_DIR = Path(__file__).resolve().parent
DOCS_DIR = RAG_DIR / "documents"
VECTORSTORE_DIR = RAG_DIR / "vectorstore"

class KnowledgeIngestor:
    """
    RAG Document Ingestion Engine.
    Reads municipal knowledge markdown files, splits into chunks,
    and indexes them for vector search.
    """
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=400,
            chunk_overlap=50,
            separators=["\n\n", "\n", " ", ""]
        )

    def load_and_split(self) -> List[Dict[str, Any]]:

        chunks = []
        md_files = glob.glob(str(DOCS_DIR / "*.md"))

        for file_path in md_files:
            filename = Path(file_path).name
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            split_texts = self.text_splitter.split_text(content)
            for idx, text in enumerate(split_texts):
                chunks.append({
                    "id": f"{filename}_{idx}",
                    "text": text,
                    "source": filename
                })

        return chunks

ingestor = KnowledgeIngestor()

if __name__ == "__main__":
    data = ingestor.load_and_split()
    print(f"✅ Processed {len(data)} document chunks from {DOCS_DIR}")
