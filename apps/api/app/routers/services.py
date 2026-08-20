from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.service import ServiceResponse
from app.services import service_catalog

router = APIRouter(
    prefix="/services",
    tags=["services"],
)


DatabaseSession = Annotated[
    AsyncSession,
    Depends(get_db),
]


@router.get(
    "",
    response_model=list[ServiceResponse],
)
async def get_services(
    session: DatabaseSession,
) -> list[ServiceResponse]:
    """전체 서비스를 조회합니다."""

    services = await service_catalog.list_services(
        session,
    )

    return [ServiceResponse.model_validate(service) for service in services]


@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
)
async def get_service(
    service_id: Annotated[
        int,
        Path(gt=0),
    ],
    session: DatabaseSession,
) -> ServiceResponse:
    """서비스 상세 정보를 조회합니다."""

    service = await service_catalog.get_service(
        session,
        service_id,
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return ServiceResponse.model_validate(
        service,
    )
