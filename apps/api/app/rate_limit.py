from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, Request, status

WINDOW_SECONDS = 60
MAX_ATTEMPTS = 10
attempts: dict[str, deque[float]] = defaultdict(deque)


async def limit_auth_attempts(request: Request) -> None:
    key = request.client.host if request.client else "unknown"
    now = monotonic()
    bucket = attempts[key]
    while bucket and bucket[0] <= now - WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= MAX_ATTEMPTS:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS, "Too many authentication attempts"
        )
    bucket.append(now)
