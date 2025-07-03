import logging
from logging.config import dictConfig
from app.core.config import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s", "logger": "%(name)s"}'
        }
    },
    "handlers": {
        "default": {
            "level": settings.log_level,
            "formatter": "json",
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "uvicorn": {
            "handlers": ["default"],
            "level": settings.log_level,
            "propagate": False
        },
        "app": {
            "handlers": ["default"],
            "level": settings.log_level,
            "propagate": False
        },
    }
}

# Configure logging once at app startup
def setup_logging():
    dictConfig(LOGGING_CONFIG)

# This is the logger you import elsewhere
logger = logging.getLogger("app")

# Example usage in other modules
# from app.core.logger import logger

# Business logic insights
# - logger.info("Ingredient scan started for user_id=%s", user_profile.id)
# Warnings or edge cases
# - logger.warning("User tried to scan without ingredients list")
# Errors inside services or handlers
# - logger.error("LLM service failed: %s", str(e))
# Debugging internal flow (optional)
# - logger.debug("Parsed ingredients: %s", ingredients)

# Note: The logger is configured to output JSON format logs, which is suitable for structured logging.