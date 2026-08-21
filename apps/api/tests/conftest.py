import asyncio
import os
from collections.abc import Iterator

import asyncpg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://easylife:easylife-local@localhost:5433/easylife_test"
)
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-tests"

from app.database import AsyncSessionFactory, engine
from app.main import app
from app.models import ServiceModel
from app.models.base import Base
from app.rate_limit import attempts


async def ensure_test_database() -> None:
    connection = await asyncpg.connect(
        "postgresql://easylife:easylife-local@localhost:5433/postgres"
    )
    try:
        if not await connection.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'easylife_test'"
        ):
            await connection.execute("CREATE DATABASE easylife_test")
    finally:
        await connection.close()


async def reset_schema() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    async with AsyncSessionFactory() as session:
        session.add_all(
            [
                ServiceModel(
                    name="정부24",
                    description="정부 민원 서비스",
                    category="공공",
                    url="https://www.gov.kr",
                ),
                ServiceModel(
                    name="홈택스",
                    description="세금 서비스",
                    category="세금",
                    url="https://www.hometax.go.kr",
                ),
            ]
        )
        await session.commit()


@pytest.fixture(scope="session", autouse=True)
def database() -> Iterator[None]:
    asyncio.run(ensure_test_database())
    asyncio.run(reset_schema())
    yield
    asyncio.run(engine.dispose())


@pytest.fixture
def client() -> Iterator[TestClient]:
    attempts.clear()
    with TestClient(app) as value:
        yield value


@pytest.fixture
def client_id() -> str:
    return "e2f5ce36-70ee-4eec-b175-df464c930d70"


@pytest.fixture
def user_token(client: TestClient) -> str:
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "user@example.com", "password": "strong-password"},
    )
    if response.status_code == 409:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "strong-password"},
        )
    return response.json()["access_token"]


@pytest.fixture
def admin_token(client: TestClient) -> str:
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "admin@example.com", "password": "strong-password"},
    )
    user_id = response.json()["user"]["id"] if response.status_code == 201 else None

    async def promote() -> None:
        async with AsyncSessionFactory() as session:
            user_id_value = user_id or await session.scalar(
                text("SELECT id FROM users WHERE email='admin@example.com'")
            )
            await session.execute(
                text("UPDATE users SET is_admin=true WHERE id=:id"),
                {"id": user_id_value},
            )
            await session.commit()

    asyncio.run(promote())
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "strong-password"},
    )
    return login_response.json()["access_token"]
