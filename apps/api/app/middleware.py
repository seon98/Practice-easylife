import logging
from time import perf_counter
from uuid import uuid4

from fastapi import Request, Response

logger = logging.getLogger("easylife.requests")


async def request_context(request: Request, call_next) -> Response:
    request_id = request.headers.get("X-Request-ID", str(uuid4()))[:128]
    started = perf_counter()
    response = await call_next(request)
    elapsed_ms = (perf_counter() - started) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    logger.info(
        "request method=%s path=%s status=%s duration_ms=%.2f request_id=%s",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        request_id,
    )
    return response
