# from typing import Generic, TypeVar, Type
# from sqlalchemy.orm import Session

# ModelType = TypeVar("ModelType")

# class BaseRepository(Generic[ModelType]):
#     """
#     BaseRepository provides generic CRUD operations for SQLAlchemy models.
#     Type Parameters:
#         ModelType: The SQLAlchemy model class.
#     Args:
#         model (Type[ModelType]): The SQLAlchemy model class to operate on.
#     Methods:
#         get(db: Session, id: int) -> ModelType | None:
#             Retrieve a single record by its primary key.
#         get_all(db: Session) -> list[ModelType]:
#             Retrieve all records of the model.
#         create(db: Session, obj_in: dict) -> ModelType:
#             Create a new record with the provided data.
#         update(db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
#             Update an existing record with the provided data.
#         delete(db: Session, id: int) -> None:
#             Delete a record by its primary key.
#     """
#     def __init__(self, model: Type[ModelType]):
#         self.model = model

#     def get(self, db: Session, id: int) -> ModelType | None:
#         return db.query(self.model).filter(self.model.id == id).first()

#     def get_all(self, db: Session) -> list[ModelType]:
#         return db.query(self.model).all()

#     def create(self, db: Session, obj_in: dict) -> ModelType:
#         db_obj = self.model(**obj_in)
#         db.add(db_obj)
#         db.commit()
#         db.refresh(db_obj)
#         return db_obj

#     def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
#         for field, value in obj_in.items():
#             setattr(db_obj, field, value)
#         db.commit()
#         db.refresh(db_obj)
#         return db_obj

#     def delete(self, db: Session, id: int) -> None:
#         obj = db.query(self.model).get(id)
#         if obj:
#             db.delete(obj)
#             db.commit()