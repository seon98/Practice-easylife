from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
)


class ServiceResponse(BaseModel):
    """서비스 API 응답 모델."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int = Field(gt=0)

    name: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        min_length=1,
        max_length=1000,
    )

    category: str = Field(
        min_length=1,
        max_length=50,
    )

    url: HttpUrl


class ServiceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=1000)
    category: str = Field(min_length=1, max_length=50)
    url: HttpUrl


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, min_length=1, max_length=1000)
    category: str | None = Field(default=None, min_length=1, max_length=50)
    url: HttpUrl | None = None
