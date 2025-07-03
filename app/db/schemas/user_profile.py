# from pydantic import BaseModel, Field
# from typing import Optional

# class UserProfileCreate(BaseModel):
#     user_id: int = Field(..., description="The ID of the associated user")
#     first_name: str = Field(..., max_length=50, description="First name of the user")
#     last_name: str = Field(..., max_length=50, description="Last name of the user")
#     age: Optional[int] = Field(None, ge=0, description="Age of the user")
#     bio: Optional[str] = Field(None, max_length=255, description="Short biography of the user")

#     class Config:
#         orm_mode = True
#         schema_extra = {
#             "example": {
#                 "user_id": 1,
#                 "first_name": "John",
#                 "last_name": "Doe",
#                 "age": 30,
#                 "bio": "A short bio about John."
#             }
#         }

# class UserProfileUpdate(BaseModel):
#     first_name: Optional[str] = Field(None, max_length=50, description="First name of the user")
#     last_name: Optional[str] = Field(None, max_length=50, description="Last name of the user")
#     age: Optional[int] = Field(None, ge=0, description="Age of the user")
#     bio: Optional[str] = Field(None, max_length=255, description="Short biography of the user")

#     class Config:
#         orm_mode = True
#         schema_extra = {
#             "example": {
#                 "first_name": "Jane",
#                 "last_name": "Smith",
#                 "age": 28,
#                 "bio": "Updated bio for Jane."
#             }
#         }
