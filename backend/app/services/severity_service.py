class SeverityService:
    """
    Severity Prediction Engine.
    Rules-based severity evaluator for civic issue detections.
    """
    def calculate_severity(self, confidence: float, class_severity: str = "Medium") -> str:
        if class_severity in ["High", "HIGH"]:
            return "High" if confidence > 0.60 else "Medium"
        elif confidence > 0.90:
            return "High"
        elif confidence > 0.70:
            return "Medium"
        else:
            return "Low"

severity_service = SeverityService()
