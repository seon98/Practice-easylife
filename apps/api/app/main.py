from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import services

settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url=("/docs" if settings.app_env != "production" else None),
    redoc_url=("/redoc" if settings.app_env != "production" else None),
)


# Next.js 개발 서버가 FastAPI를 호출할 수 있도록
# 허용할 Origin을 명시적으로 제한합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=[
        "Accept",
        "Authorization",
        "Content-Type",
    ],
)


app.include_router(
    services.router,
    prefix="/api/v1",
)


@app.get(
    "/health",
    include_in_schema=False,
)
async def health() -> dict[str, str]:
    """서버 상태 확인용 엔드포인트."""

    return {
        "status": "ok",
    }
