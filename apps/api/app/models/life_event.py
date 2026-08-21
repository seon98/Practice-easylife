from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class LifeEventModel(Base):
    __tablename__ = "life_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    short_label: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(String(500))
    icon: Mapped[str] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(60), index=True)
    audience: Mapped[list[str]] = mapped_column(JSON, default=list, server_default="[]")
    is_published: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", index=True
    )
    display_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class LifeEventTaskModel(Base):
    __tablename__ = "life_event_tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    life_event_id: Mapped[int] = mapped_column(
        ForeignKey("life_events.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    why_it_matters: Mapped[str] = mapped_column(String(500))
    task_type: Mapped[str] = mapped_column(
        String(30), default="required", server_default="required"
    )
    timing_label: Mapped[str] = mapped_column(String(100))
    deadline_days: Mapped[int | None] = mapped_column(Integer)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer)
    required_documents: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    official_url: Mapped[str | None] = mapped_column(String(1000))
    official_source: Mapped[str | None] = mapped_column(String(160))
    caution: Mapped[str | None] = mapped_column(String(500))
    display_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0")


class LifeEventTaskServiceModel(Base):
    __tablename__ = "life_event_task_services"
    __table_args__ = (
        UniqueConstraint("task_id", "service_id", name="uq_life_event_task_service"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("life_event_tasks.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )


class UserLifePlanModel(Base):
    __tablename__ = "user_life_plans"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "life_event_id",
            "started_on",
            name="uq_user_life_plan_event_date",
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    life_event_id: Mapped[int] = mapped_column(
        ForeignKey("life_events.id", ondelete="CASCADE"), index=True
    )
    started_on: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    status: Mapped[str] = mapped_column(
        String(20), default="active", server_default="active", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class UserTaskProgressModel(Base):
    __tablename__ = "user_task_progress"
    __table_args__ = (
        UniqueConstraint("plan_id", "task_id", name="uq_user_task_progress_plan_task"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(
        ForeignKey("user_life_plans.id", ondelete="CASCADE"), index=True
    )
    task_id: Mapped[int] = mapped_column(
        ForeignKey("life_event_tasks.id", ondelete="CASCADE"), index=True
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(String(500))
