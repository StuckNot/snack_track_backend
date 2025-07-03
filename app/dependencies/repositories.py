from app.db.repositories.user_profile import UserProfileRepository

def get_user_profile_repository() -> UserProfileRepository:
    return UserProfileRepository()