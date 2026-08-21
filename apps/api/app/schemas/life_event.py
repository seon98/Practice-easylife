from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.service import ServiceResponse


class LifeTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    why_it_matters: str
    task_type: str
    timing_label: str
    deadline_days: int | None
    estimated_minutes: int | None
    required_documents: list[str]
    official_url: str | None
    official_source: str | None
    caution: str | None
    display_order: int
    services: list[ServiceResponse] = Field(default_factory=list)


class LifeEventSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    short_label: str
    description: str
    icon: str
    category: str
    audience: list[str]
    reviewed_at: datetime | None
    task_count: int = 0


class LifeEventDetail(LifeEventSummary):
    tasks: list[LifeTaskResponse]


class LifePlanResponse(BaseModel):
    plan_id: int
    life_event_id: int
    status: str
    completed_tasks: int
    total_tasks: int
    progress_percent: int


class TaskProgressUpdate(BaseModel):
    is_completed: bool
    reminder_at: datetime | None = None
    note: str | None = Field(default=None, max_length=500)
