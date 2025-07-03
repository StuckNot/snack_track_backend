from fastapi import APIRouter, HTTPException
from app.models.user_profile import UserProfile

router = APIRouter()

# Temporary in-memory storage (replace with DB in real projects)
profile_db: UserProfile | None = None

@router.post("/profile", response_model=UserProfile, tags=["profile"])
async def set_profile(profile: UserProfile):
    global profile_db
    profile_db = profile
    return profile

@router.get("/profile", response_model=UserProfile, tags=["profile"])
async def get_profile():
    if profile_db is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile_db
