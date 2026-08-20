from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine
from app.routers import services

settings = get_settings()


@asynccontextmanager
async def lifespan(
    app: FastAPI,
) -> AsyncIterator[None]:
    """
    FastAPI 애플리케이션 lifecycle.

    DB 테이블 생성이나 migration은
    여기서 실행하지 않습니다.
    """

    del app

    yield

    # 애플리케이션 종료 시 connection pool 정리
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.2.0",
    lifespan=lifespan,
    docs_url=("/docs" if settings.app_env != "production" else None),
    redoc_url=("/redoc" if settings.app_env != "production" else None),
)


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
    """
    애플리케이션 프로세스 자체의 상태 확인.

    DB 상태는 여기서 조회하지 않습니다.
    """

    return {
        "status": "ok",
    }
