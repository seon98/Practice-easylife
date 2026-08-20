from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings

settings = get_settings()


engine = create_async_engine(
    settings.database_url,
    # 끊어진 커넥션을 사용하기 전에 확인
    pool_pre_ping=True,
    # SQL 로그는 필요할 때만 True로 변경
    echo=False,
)


AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    # commit 이후 ORM 객체 속성을
    # 다시 조회하지 않도록 설정
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[
    AsyncSession,
    None,
]:
    """FastAPI 요청 단위 DB Session."""

    async with AsyncSessionFactory() as session:
        try:
            yield session

        except Exception:
            await session.rollback()
            raise
