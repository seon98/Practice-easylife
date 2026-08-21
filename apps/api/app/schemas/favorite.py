from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.service import ServiceResponse


class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    created_at: datetime
    service: ServiceResponse
