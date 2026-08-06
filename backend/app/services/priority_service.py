PRIORITY_MATRIX = {
    "ROAD_INFRASTRUCTURE": "High",
    "GARBAGE_WASTE": "Medium",
    "FLOODING": "Critical",
    "STREETLIGHT_POWER": "Medium",
    "PARKING": "Low"
}

class PriorityService:
    """
    Priority Score Engine.
    Assigns urgency and response priority to municipal complaints.
    """
    def get_priority(self, category: str, default: str = "Medium") -> str:
        return PRIORITY_MATRIX.get(category.upper(), default)

priority_service = PriorityService()
