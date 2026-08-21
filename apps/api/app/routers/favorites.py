from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.service import ServiceModel
from app.models.user import UserModel
from app.schemas.favorite import FavoriteResponse
from app.security import get_optional_user
from app.services import favorite_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


def require_identity(client_id: UUID | None, user: UserModel | None) -> None:
    if client_id is None and user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "X-Client-ID header is required")


@router.get("", response_model=list[FavoriteResponse])
async def get_favorites(
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[UserModel | None, Depends(get_optional_user)],
    client_id: Annotated[UUID | None, Header(alias="X-Client-ID")] = None,
) -> list[FavoriteResponse]:
    require_identity(client_id, user)
    items = await favorite_service.list_favorites(session, client_id, user.id if user else None)
    return [FavoriteResponse.model_validate(item) for item in items]


@router.post("/{service_id}", response_model=FavoriteResponse)
async def add_favorite(
    service_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[UserModel | None, Depends(get_optional_user)],
    client_id: Annotated[UUID | None, Header(alias="X-Client-ID")] = None,
) -> FavoriteResponse:
    require_identity(client_id, user)
    if await session.get(ServiceModel, service_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    item = await favorite_service.add_favorite(session, service_id, client_id, user.id if user else None)
    return FavoriteResponse.model_validate(item)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_favorite(
    service_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[UserModel | None, Depends(get_optional_user)],
    client_id: Annotated[UUID | None, Header(alias="X-Client-ID")] = None,
) -> Response:
    require_identity(client_id, user)
    await favorite_service.delete_favorite(session, service_id, client_id, user.id if user else None)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
