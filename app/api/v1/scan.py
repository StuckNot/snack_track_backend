from fastapi import APIRouter, HTTPException, Depends
from app.models.user_profile import UserProfile
from app.services.ingredient_matcher import analyze_ingredients
from pydantic import BaseModel
from typing import List
from app.utils.dependencies import get_settings 
import app.utils.logger as logger

router = APIRouter()

class ScanRequest(BaseModel):
    user_profile: UserProfile
    ingredients: List[str]

@router.post("/scan")
async def scan_ingredients(request: ScanRequest, settings = Depends(get_settings)):
    logger.info(f"Scanning with settings: {settings.app_name}")
    try:
        result = await analyze_ingredients(request.user_profile, request.ingredients)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))