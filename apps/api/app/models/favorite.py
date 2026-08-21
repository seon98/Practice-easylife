from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FavoriteModel(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("client_id", "service_id", name="uq_favorites_client_service"),
        UniqueConstraint("user_id", "service_id", name="uq_favorites_user_service"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    user: Mapped["UserModel | None"] = relationship(back_populates="favorites")  # type: ignore[name-defined] # noqa: F821
    service: Mapped["ServiceModel"] = relationship(back_populates="favorites")  # type: ignore[name-defined] # noqa: F821
