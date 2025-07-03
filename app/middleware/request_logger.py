import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.utils.logger import logger


'''
Handles only Request route, method, time	

Does not handle the below:
 - Business logic events	
 - Error inside service logic	
 - Debug output, if needed	
 For that you can use the logger directly in your service logic or other parts of the application by using 
 `logger.info()`, `logger.error()`, etc. from `app.utils.logger`.
'''
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Let the request pass through the application
        response: Response = await call_next(request)

        process_time = (time.time() - start_time) * 1000  # in milliseconds
        log_details = {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": f"{process_time:.2f}"
        }

        logger.info(f"HTTP Request: {log_details}")
        return response
