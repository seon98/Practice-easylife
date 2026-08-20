from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, status

from app.schemas.service import ServiceResponse
from app.services import service_catalog

router = APIRouter(
    prefix="/services",
    tags=["services"],
)


@router.get(
    "",
    response_model=list[ServiceResponse],
)
async def get_services() -> list[ServiceResponse]:
    """전체 서비스 목록을 조회합니다."""

    return service_catalog.list_services()


@router.get(
    "/{service_id}",
    response_model=ServiceResponse,
)
async def get_service(
    service_id: Annotated[
        int,
        Path(gt=0),
    ],
) -> ServiceResponse:
    """서비스 ID로 상세 정보를 조회합니다."""

    service = service_catalog.get_service(
        service_id,
    )

    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return service
