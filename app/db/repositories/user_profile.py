# from sqlalchemy.orm import Session
# from app.models.user_profile import UserProfile
# from app.db.schemas.user_profile import UserProfileCreate, UserProfileUpdate
# """
# Repository class for managing UserProfile database operations.
# Classes:
#     UserProfileRepository:
#         Handles CRUD operations for UserProfile objects using SQLAlchemy ORM.
#         Methods:
#             __init__(db: Session):
#                 Initializes the repository with a database session.
#             get_by_id(user_profile_id: int) -> UserProfile | None:
#                 Retrieves a UserProfile by its unique ID.
#                 Returns the UserProfile instance if found, otherwise None.
#             get_by_user_id(user_id: int) -> UserProfile | None:
#                 Retrieves a UserProfile by the associated user ID.
#                 Returns the UserProfile instance if found, otherwise None.
#             create(user_profile_in: UserProfileCreate) -> UserProfile:
#                 Creates a new UserProfile from the provided schema.
#                 Commits the new instance to the database and returns it.
#             update(user_profile: UserProfile, user_profile_in: UserProfileUpdate) -> UserProfile:
#                 Updates an existing UserProfile with fields from the provided update schema.
#                 Only updates fields that are set in the schema.
#                 Commits the changes and returns the updated instance.
#             delete(user_profile: UserProfile) -> None:
#                 Deletes the specified UserProfile from the database and commits the transaction.
# """

# class UserProfileRepository:
#     def __init__(self, db: Session):
#         self.db = db

#     def get_by_id(self, user_profile_id: int) -> UserProfile | None:
#         return self.db.query(UserProfile).filter(UserProfile.id == user_profile_id).first()

#     def get_by_user_id(self, user_id: int) -> UserProfile | None:
#         return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

#     def create(self, user_profile_in: UserProfileCreate) -> UserProfile:
#         db_user_profile = UserProfile(**user_profile_in.dict())
#         self.db.add(db_user_profile)
#         self.db.commit()
#         self.db.refresh(db_user_profile)
#         return db_user_profile

#     def update(self, user_profile: UserProfile, user_profile_in: UserProfileUpdate) -> UserProfile:
#         for field, value in user_profile_in.dict(exclude_unset=True).items():
#             setattr(user_profile, field, value)
#         self.db.commit()
#         self.db.refresh(user_profile)
#         return user_profile

#     def delete(self, user_profile: UserProfile) -> None:
#         self.db.delete(user_profile)
#         self.db.commit()


# # from typing import Dict, Optional
# # from app.models.user_profile import UserProfile

# # class UserProfileRepository:
# #     """
# #     A simple in-memory repository for managing user profiles.
# #     In production, this would interface with a database.
# #     """

# #     def __init__(self):
# #         self._profiles: Dict[str, UserProfile] = {}

# #     def get_profile(self, user_id: str) -> Optional[UserProfile]:
# #         """
# #         Retrieve a user profile by user ID.
# #         """
# #         return self._profiles.get(user_id)

# #     def save_profile(self, user_id: str, profile: UserProfile) -> None:
# #         """
# #         Save or update a user profile.
# #         """
# #         self._profiles[user_id] = profile

# #     def delete_profile(self, user_id: str) -> None:
# #         """
# #         Delete a user profile by user ID.
# #         """
# #         if user_id in self._profiles:
# #             del self._profiles[user_id]