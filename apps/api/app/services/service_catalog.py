from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.service import ServiceModel


async def list_services(
    session: AsyncSession,
) -> list[ServiceModel]:
    """전체 서비스를 조회합니다."""

    statement = select(
        ServiceModel,
    ).order_by(
        ServiceModel.id,
    )

    result = await session.scalars(statement)

    return list(result.all())


async def get_service(
    session: AsyncSession,
    service_id: int,
) -> ServiceModel | None:
    """서비스 ID로 단일 서비스를 조회합니다."""

    return await session.get(
        ServiceModel,
        service_id,
    )
