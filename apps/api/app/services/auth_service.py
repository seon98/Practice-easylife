from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.favorite import FavoriteModel
from app.models.user import UserModel
from app.security import hash_password, verify_password


async def get_user_by_email(session: AsyncSession, email: str) -> UserModel | None:
    return await session.scalar(select(UserModel).where(UserModel.email == email.lower()))


async def create_user(session: AsyncSession, email: str, password: str) -> UserModel:
    user = UserModel(email=email.lower(), password_hash=hash_password(password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate(session: AsyncSession, email: str, password: str) -> UserModel | None:
    user = await get_user_by_email(session, email)
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


async def merge_anonymous_favorites(session: AsyncSession, client_id: UUID, user: UserModel) -> None:
    existing = set(await session.scalars(select(FavoriteModel.service_id).where(FavoriteModel.user_id == user.id)))
    await session.execute(
        update(FavoriteModel)
        .where(FavoriteModel.client_id == client_id, FavoriteModel.service_id.not_in(existing))
        .values(user_id=user.id, client_id=None)
    )
    duplicates = (await session.scalars(
        select(FavoriteModel).where(FavoriteModel.client_id == client_id)
    )).all()
    for favorite in duplicates:
        await session.delete(favorite)
    await session.commit()
