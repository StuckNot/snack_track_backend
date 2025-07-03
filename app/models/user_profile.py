from pydantic import BaseModel
from typing import List, Optional
from app.enums.user_enums import Gender, HealthCondition, DietPreference, Language

class UserProfile(BaseModel):
    name: str
    age: int
    gender: Gender
    height_cm: Optional[float]
    weight_kg: Optional[float]
    health_conditions: List[HealthCondition]
    language: Language
    diet_preference: DietPreference
    nationality: str
