DEPARTMENT_MAPPING = {
    "ROAD_INFRASTRUCTURE": "Roads Department",
    "GARBAGE_WASTE": "Sanitation Department",
    "FLOODING": "Storm Water Department",
    "STREETLIGHT_POWER": "Electricity Department",
    "PARKING": "Traffic Police"
}

def get_department_for_category(category: str, default_department: str = "General Municipal Department") -> str:
    return DEPARTMENT_MAPPING.get(category.upper(), default_department)
