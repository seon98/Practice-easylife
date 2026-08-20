from pydantic import BaseModel, Field, HttpUrl


class ServiceResponse(BaseModel):
    """서비스 API 응답 모델."""

    id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=1000)
    category: str = Field(min_length=1, max_length=50)
    url: HttpUrl
