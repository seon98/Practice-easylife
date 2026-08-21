from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.life_event import (
    LifeEventModel,
    LifeEventTaskModel,
    LifeEventTaskServiceModel,
    UserLifePlanModel,
    UserTaskProgressModel,
)
from app.models.service import ServiceModel
from app.models.user import UserModel
from app.schemas.life_event import (
    LifeEventDetail,
    LifeEventSummary,
    LifePlanResponse,
    LifeTaskResponse,
    TaskProgressUpdate,
)
from app.schemas.service import ServiceResponse
from app.security import get_current_user

router = APIRouter(prefix="/life-events", tags=["life-events"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[UserModel, Depends(get_current_user)]


async def task_response(
    session: AsyncSession, task: LifeEventTaskModel
) -> LifeTaskResponse:
    services = list(
        await session.scalars(
            select(ServiceModel)
            .join(
                LifeEventTaskServiceModel,
                LifeEventTaskServiceModel.service_id == ServiceModel.id,
            )
            .where(LifeEventTaskServiceModel.task_id == task.id)
        )
    )
    return LifeTaskResponse.model_validate(task).model_copy(
        update={"services": [ServiceResponse.model_validate(item) for item in services]}
    )


@router.get("", response_model=list[LifeEventSummary])
async def list_life_events(session: Db) -> list[LifeEventSummary]:
    rows = (
        await session.execute(
            select(LifeEventModel, func.count(LifeEventTaskModel.id))
            .outerjoin(LifeEventTaskModel)
            .where(LifeEventModel.is_published.is_(True))
            .group_by(LifeEventModel.id)
            .order_by(LifeEventModel.display_order, LifeEventModel.id)
        )
    ).all()
    return [
        LifeEventSummary.model_validate(event).model_copy(update={"task_count": count})
        for event, count in rows
    ]


@router.get("/{slug}", response_model=LifeEventDetail)
async def get_life_event(slug: str, session: Db) -> LifeEventDetail:
    event = await session.scalar(
        select(LifeEventModel).where(
            LifeEventModel.slug == slug, LifeEventModel.is_published.is_(True)
        )
    )
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Life event not found")
    tasks = list(
        await session.scalars(
            select(LifeEventTaskModel)
            .where(LifeEventTaskModel.life_event_id == event.id)
            .order_by(LifeEventTaskModel.display_order, LifeEventTaskModel.id)
        )
    )
    summary = LifeEventSummary.model_validate(event).model_copy(
        update={"task_count": len(tasks)}
    )
    return LifeEventDetail(
        **summary.model_dump(),
        tasks=[await task_response(session, task) for task in tasks],
    )


async def plan_response(
    session: AsyncSession, plan: UserLifePlanModel
) -> LifePlanResponse:
    total = (
        await session.scalar(
            select(func.count())
            .select_from(UserTaskProgressModel)
            .where(UserTaskProgressModel.plan_id == plan.id)
        )
        or 0
    )
    completed = (
        await session.scalar(
            select(func.count())
            .select_from(UserTaskProgressModel)
            .where(
                UserTaskProgressModel.plan_id == plan.id,
                UserTaskProgressModel.is_completed.is_(True),
            )
        )
        or 0
    )
    return LifePlanResponse(
        plan_id=plan.id,
        life_event_id=plan.life_event_id,
        status=plan.status,
        completed_tasks=completed,
        total_tasks=total,
        progress_percent=round(completed * 100 / total) if total else 0,
    )


@router.post(
    "/{life_event_id}/plans",
    response_model=LifePlanResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_plan(life_event_id: int, session: Db, user: User) -> LifePlanResponse:
    event = await session.get(LifeEventModel, life_event_id)
    if event is None or not event.is_published:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Life event not found")
    existing = await session.scalar(
        select(UserLifePlanModel).where(
            UserLifePlanModel.user_id == user.id,
            UserLifePlanModel.life_event_id == event.id,
            UserLifePlanModel.status == "active",
        )
    )
    if existing is not None:
        return await plan_response(session, existing)
    plan = UserLifePlanModel(user_id=user.id, life_event_id=event.id)
    session.add(plan)
    await session.flush()
    task_ids = list(
        await session.scalars(
            select(LifeEventTaskModel.id).where(
                LifeEventTaskModel.life_event_id == event.id
            )
        )
    )
    session.add_all(
        [
            UserTaskProgressModel(plan_id=plan.id, task_id=task_id)
            for task_id in task_ids
        ]
    )
    await session.commit()
    await session.refresh(plan)
    return await plan_response(session, plan)


@router.get("/me/plans", response_model=list[LifePlanResponse])
async def my_plans(session: Db, user: User) -> list[LifePlanResponse]:
    plans = list(
        await session.scalars(
            select(UserLifePlanModel)
            .where(UserLifePlanModel.user_id == user.id)
            .order_by(UserLifePlanModel.created_at.desc())
        )
    )
    return [await plan_response(session, plan) for plan in plans]


@router.patch("/plans/{plan_id}/tasks/{task_id}", response_model=LifePlanResponse)
async def update_task(
    plan_id: int, task_id: int, payload: TaskProgressUpdate, session: Db, user: User
) -> LifePlanResponse:
    plan = await session.scalar(
        select(UserLifePlanModel).where(
            UserLifePlanModel.id == plan_id, UserLifePlanModel.user_id == user.id
        )
    )
    if plan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Plan not found")
    progress = await session.scalar(
        select(UserTaskProgressModel).where(
            UserTaskProgressModel.plan_id == plan.id,
            UserTaskProgressModel.task_id == task_id,
        )
    )
    if progress is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found in plan")
    progress.is_completed = payload.is_completed
    progress.completed_at = datetime.now(UTC) if payload.is_completed else None
    progress.reminder_at = payload.reminder_at
    progress.note = payload.note
    await session.commit()
    return await plan_response(session, plan)
