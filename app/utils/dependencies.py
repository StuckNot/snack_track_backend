from fastapi import Depends
from app.core.config import settings

def get_settings():
    return settings