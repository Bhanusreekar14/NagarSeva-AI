from pathlib import Path
from typing import Optional, Dict, Any
from app.schemas.road_damage import RoadDamageResponse
from app.services.road_damage_service import predict as predict_road_damage
from app.services.garbage_service import predict as predict_garbage
from app.utils.class_mapping import CLASS_MAPPING as ROAD_CLASS_MAPPING
from app.utils.garbage_mapping import CLASS_MAPPING as GARBAGE_CLASS_MAPPING

class ImageRouterService:
    """
    Central Image Router Service.
    Dispatches citizen uploaded images to specialized AI domain services
    (Road Damage, Garbage, Flood) and returns a standardized response.
    """
    def __init__(self):
        self.domain_predictors = {
            "road_damage": predict_road_damage,
            "garbage": predict_garbage,
            # "flood": predict_flood,     (Will be registered in Phase 5)
        }

    def process_image(self, image_path: str, domain: str = "road_damage") -> RoadDamageResponse:
        predictor = self.domain_predictors.get(domain, predict_road_damage)
        results = predictor(image_path)

        detected = False
        category = "ROAD_INFRASTRUCTURE" if domain == "road_damage" else "GARBAGE_WASTE"
        sub_category = "None"
        confidence = 0.0
        severity = "None"
        department = "Roads Department" if domain == "road_damage" else "Sanitation Department"

        mapping_dict = GARBAGE_CLASS_MAPPING if domain == "garbage" else ROAD_CLASS_MAPPING

        for r in results:
            if r.boxes and len(r.boxes) > 0:
                for box in r.boxes:
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    raw_name = r.names[cls_id]

                    if conf > confidence:
                        confidence = conf
                        detected = True
                        
                        # Lookup mapping by upper, lower, or formatted key
                        mapping = mapping_dict.get(raw_name.upper()) or \
                                  mapping_dict.get(raw_name.lower()) or \
                                  mapping_dict.get(raw_name.lower().replace(" ", "_"), {
                                      "category": category,
                                      "severity": "Medium"
                                  })

                        category = mapping.get("category", category)
                        sub_category = raw_name.title()
                        severity = mapping.get("severity", "Medium")

        return RoadDamageResponse(
            success=True,
            detected=detected,
            category=category,
            sub_category=sub_category,
            confidence=round(confidence, 2),
            severity=severity,
            department=department
        )

image_router_service = ImageRouterService()
