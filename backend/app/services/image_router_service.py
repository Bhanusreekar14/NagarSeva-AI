from typing import Optional, Dict, Any
from app.schemas.image_response import ImageResponse
from app.services.road_damage_service import predict as predict_road_damage
from app.services.garbage_service import predict as predict_garbage
from app.utils.class_mapping import CLASS_MAPPING as ROAD_CLASS_MAPPING
from app.utils.garbage_mapping import CLASS_MAPPING as GARBAGE_CLASS_MAPPING

class ImageRouterService:
    """
    Intelligent AI Image Router Service.
    Orchestrates computer vision models (Road Damage, Garbage, Flood)
    to automatically identify the domain and return a unified ImageResponse.
    """
    def __init__(self):
        self.registry = {
            "road_damage": {
                "name": "Road Damage AI",
                "predict_fn": predict_road_damage,
                "mapping": ROAD_CLASS_MAPPING,
                "default_category": "ROAD_INFRASTRUCTURE",
                "default_department": "Roads Department"
            },
            "garbage": {
                "name": "Garbage Detection AI",
                "predict_fn": predict_garbage,
                "mapping": GARBAGE_CLASS_MAPPING,
                "default_category": "GARBAGE_WASTE",
                "default_department": "Sanitation Department"
            }
        }

    def analyze_image(self, image_path: str, module_hint: Optional[str] = None) -> ImageResponse:
        best_match: Optional[Dict[str, Any]] = None
        max_confidence = 0.0

        # If a specific module hint is provided and valid, prioritize it
        modules_to_query = [module_hint] if module_hint in self.registry else self.registry.keys()

        for module_key in modules_to_query:
            config = self.registry[module_key]
            results = config["predict_fn"](image_path)

            for r in results:
                if r.boxes and len(r.boxes) > 0:
                    for box in r.boxes:
                        conf = float(box.conf[0])
                        cls_id = int(box.cls[0])
                        raw_name = r.names[cls_id]

                        if conf > max_confidence:
                            max_confidence = conf
                            best_match = {
                                "module_key": module_key,
                                "module_name": config["name"],
                                "raw_name": raw_name,
                                "confidence": conf,
                                "mapping_dict": config["mapping"],
                                "default_category": config["default_category"],
                                "default_department": config["default_department"]
                            }

        if best_match:
            raw_name = best_match["raw_name"]
            mapping_dict = best_match["mapping_dict"]
            
            # Key lookup
            mapping = mapping_dict.get(raw_name.upper()) or \
                      mapping_dict.get(raw_name.lower()) or \
                      mapping_dict.get(raw_name.lower().replace(" ", "_"), {
                          "category": best_match["default_category"],
                          "severity": "Medium",
                          "department": best_match["default_department"]
                      })

            return ImageResponse(
                success=True,
                detected=True,
                module=best_match["module_name"],
                category=mapping.get("category", best_match["default_category"]),
                sub_category=raw_name.title(),
                confidence=round(best_match["confidence"], 2),
                severity=mapping.get("severity", "Medium"),
                department=mapping.get("department", best_match["default_department"])
            )
        else:
            default_mod = self.registry.get(module_hint, self.registry["road_damage"])
            return ImageResponse(
                success=True,
                detected=False,
                module=default_mod["name"],
                category="CIVIC_ISSUE",
                sub_category="None",
                confidence=0.0,
                severity="None",
                department="General Municipal Department"
            )

image_router_service = ImageRouterService()
