from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.service import ServiceModel
from app.models.user import UserModel
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.security import require_admin

router = APIRouter(prefix="/admin/services", tags=["admin"])


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    payload: ServiceCreate,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[UserModel, Depends(require_admin)],
) -> ServiceResponse:
    service = ServiceModel(**payload.model_dump(mode="json"))
    session.add(service)
    await session.commit()
    await session.refresh(service)
    return ServiceResponse.model_validate(service)


@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    payload: ServiceUpdate,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[UserModel, Depends(require_admin)],
) -> ServiceResponse:
    service = await session.get(ServiceModel, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    for field, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(service, field, value)
    await session.commit()
    await session.refresh(service)
    return ServiceResponse.model_validate(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[UserModel, Depends(require_admin)],
) -> Response:
    service = await session.get(ServiceModel, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    await session.delete(service)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
