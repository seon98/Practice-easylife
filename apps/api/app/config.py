from functools import lru_cache

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 환경설정."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "EasyLife API"
    app_env: str = "local"

    database_url: str = (
        "postgresql+asyncpg://easylife:easylife-local@localhost:5433/easylife"
    )

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    secret_key: str = "development-only-change-me-at-least-32-characters"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "easylife-api"
    jwt_audience: str = "easylife-web"
    access_token_expire_minutes: int = Field(default=30, gt=0, le=1440)
    log_level: str = "INFO"
    payment_secret_key: str = ""
    payment_webhook_secret: str = ""
    email_provider_api_key: str = ""
    public_api_free_requests_per_minute: int = Field(default=30, gt=0, le=1000)

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        value = value.replace("sslmode=require", "ssl=require")
        value = value.replace("&channel_binding=require", "")
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.app_env == "production" and self.secret_key.startswith("development-"):
            raise ValueError("A secure SECRET_KEY is required in production")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
