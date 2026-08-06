import re
from typing import Dict, Any
from app.utils.category_keywords import CATEGORY_KEYWORDS

class ComplaintClassifierService:
    """
    NLP Text Complaint Classifier Service.
    Parses unstructured text complaints to extract category & confidence score.
    """
    def __init__(self):
        self.keywords = CATEGORY_KEYWORDS

    def classify(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        word_list = re.findall(r'\b\w+\b', text_lower)
        
        category_scores: Dict[str, int] = {cat: 0 for cat in self.keywords}

        for cat, kw_list in self.keywords.items():
            for kw in kw_list:
                if kw in text_lower:
                    category_scores[cat] += 1

        best_category = "CIVIC_ISSUE"
        max_hits = 0

        for cat, hits in category_scores.items():
            if hits > max_hits:
                max_hits = hits
                best_category = cat

        if max_hits > 0:
            confidence = min(0.70 + (max_hits * 0.10), 0.98)
        else:
            confidence = 0.50

        return {
            "category": best_category,
            "confidence": round(confidence, 2)
        }

complaint_classifier_service = ComplaintClassifierService()
