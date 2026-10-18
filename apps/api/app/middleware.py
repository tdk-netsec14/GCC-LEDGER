import json
import logging
import time
import uuid
from collections import defaultdict
from collections.abc import Callable

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings

logger = logging.getLogger("gcc_ledger.api")
settings = get_settings()


# --- In-Memory Rate Limiter ---

class RateLimiter:
    def __init__(self) -> None:
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_rate_limited(self, key: str, max_calls: int, window_sec: int) -> bool:
        now = time.time()
        window_start = now - window_sec
        # Filter out timestamps older than window
        self.requests[key] = [t for t in self.requests[key] if t > window_start]
        if len(self.requests[key]) >= max_calls:
            return True
        self.requests[key].append(now)
        return False


rate_limiter = RateLimiter()


class RequestControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        start_time = time.time()
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # 1. Check Request Size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.request_max_bytes:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "error": {
                        "code": "REQUEST_TOO_LARGE",
                        "message": f"Request body exceeds maximum allowed size of {settings.request_max_bytes} bytes.",
                        "details": None,
                    }
                },
                headers={"X-Request-ID": request_id},
            )

        # 2. Rate Limiting based on client IP & path
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Stricter rate limits on /ask and /directory/leads
        if path.startswith("/ask"):
            if rate_limiter.is_rate_limited(f"ask:{client_ip}", max_calls=20, window_sec=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "Too many requests to Ask the Ledger. Please wait a moment before trying again.",
                            "details": None,
                        }
                    },
                    headers={"X-Request-ID": request_id},
                )
        elif path.startswith("/directory/leads"):
            if rate_limiter.is_rate_limited(f"leads:{client_ip}", max_calls=10, window_sec=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "Too many lead submissions. Please wait before submitting more leads.",
                            "details": None,
                        }
                    },
                    headers={"X-Request-ID": request_id},
                )
        else:
            if rate_limiter.is_rate_limited(f"general:{client_ip}", max_calls=200, window_sec=60):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "Too many requests. Please throttle your client.",
                            "details": None,
                        }
                    },
                    headers={"X-Request-ID": request_id},
                )

        # 3. Process Request
        response = await call_next(request)

        # 4. Structured JSON Logging (no personal data)
        duration_ms = int((time.time() - start_time) * 1000)
        response.headers["X-Request-ID"] = request_id

        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        }
        # Avoid stdout spam in test environments, but format cleanly as structured json
        logger.info(json.dumps(log_data))

        return response


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": getattr(exc, "code", "HTTP_ERROR"),
                    "message": exc.detail,
                    "details": None,
                }
            },
            headers={"X-Request-ID": getattr(request.state, "request_id", "")},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed.",
                    "details": exc.errors(),
                }
            },
            headers={"X-Request-ID": getattr(request.state, "request_id", "")},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled server error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred.",
                    "details": str(exc),
                }
            },
            headers={"X-Request-ID": getattr(request.state, "request_id", "")},
        )
