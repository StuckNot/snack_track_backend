from fastapi import FastAPI
from app.api.v1.scan import router as scan_router
from app.api.v1.profile import router as profile_router
from app.core.config import settings
from app.utils.logger import setup_logging
from app.middleware.request_logger import RequestLoggingMiddleware

# Initialize logging configuration
setup_logging()


app = FastAPI(title=settings.APP_NAME, version=settings.version)

app.add_middleware(RequestLoggingMiddleware)


app.include_router(scan_router, prefix="/api/v1")

app.include_router(profile_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Food Health Impact API running"}

print(f"API is running at {settings.API_URL}")

