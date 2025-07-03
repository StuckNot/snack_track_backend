from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SnackTrack"
    debug: bool = True
    version: str = "1.0.0"
    log_level: str = "DEBUG"
    LLM_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
