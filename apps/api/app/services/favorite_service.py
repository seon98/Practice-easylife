from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.favorite import FavoriteModel


def owner_clause(client_id: UUID | None, user_id: int | None):
    return (
        FavoriteModel.user_id == user_id
        if user_id is not None
        else FavoriteModel.client_id == client_id
    )


async def list_favorites(
    session: AsyncSession, client_id: UUID | None, user_id: int | None
) -> list[FavoriteModel]:
    result = await session.scalars(
        select(FavoriteModel)
        .options(selectinload(FavoriteModel.service))
        .where(owner_clause(client_id, user_id))
        .order_by(FavoriteModel.created_at)
    )
    return list(result)


async def add_favorite(
    session: AsyncSession, service_id: int, client_id: UUID | None, user_id: int | None
) -> FavoriteModel:
    existing = await session.scalar(
        select(FavoriteModel)
        .options(selectinload(FavoriteModel.service))
        .where(owner_clause(client_id, user_id), FavoriteModel.service_id == service_id)
    )
    if existing:
        return existing
    favorite = FavoriteModel(
        service_id=service_id, client_id=None if user_id else client_id, user_id=user_id
    )
    session.add(favorite)
    await session.commit()
    return await session.scalar(
        select(FavoriteModel)
        .options(selectinload(FavoriteModel.service))
        .where(FavoriteModel.id == favorite.id)
    )  # type: ignore[return-value]


async def delete_favorite(
    session: AsyncSession, service_id: int, client_id: UUID | None, user_id: int | None
) -> bool:
    favorite = await session.scalar(
        select(FavoriteModel).where(
            owner_clause(client_id, user_id), FavoriteModel.service_id == service_id
        )
    )
    if favorite is None:
        return False
    await session.delete(favorite)
    await session.commit()
    return True
