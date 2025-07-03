from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class HealthCondition(str, Enum):
    DIABETES = "diabetes"
    HYPERTENSION = "hypertension"
    CELIAC = "celiac"
    NONE = "none"

class DietPreference(str, Enum):
    VEGAN = "vegan"
    VEGETARIAN = "vegetarian"
    NON_VEGETARIAN = "non-vegetarian"

class Language(str, Enum):
    punjabi = "Punjabi"
    english = "English"
    hindi = "Hindi"
    tamil = "Tamil"
    telugu = "Telugu"
    marathi = "Marathi"
    bengali = "Bengali"
    kannada = "Kannada"
    gujarati = "Gujarati"
    malayalam = "Malayalam"
    urdu = "Urdu"