from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

EVENT_NAMES = Literal[
    "page_view",
    "guide_view",
    "service_view",
    "service_click",
    "affiliate_click",
    "favorite_add",
    "signup",
    "login",
    "subscription_view",
    "subscription_started",
]


class GuideCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    title: str = Field(min_length=1, max_length=240)
    summary: str = Field(min_length=1, max_length=500)
    content: str = Field(min_length=1, max_length=50000)
    category: str = Field(min_length=1, max_length=80)
    status: Literal["draft", "published", "archived"] = "draft"
    service_ids: list[int] = Field(default_factory=list, max_length=30)


class GuideUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    summary: str | None = Field(default=None, min_length=1, max_length=500)
    content: str | None = Field(default=None, min_length=1, max_length=50000)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    status: Literal["draft", "published", "archived"] | None = None
    service_ids: list[int] | None = Field(default=None, max_length=30)


class GuideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    summary: str
    content: str
    category: str
    status: str
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    service_ids: list[int] = Field(default_factory=list)


class AnalyticsEventCreate(BaseModel):
    event_name: EVENT_NAMES
    client_id: str = Field(min_length=8, max_length=100)
    service_id: int | None = Field(default=None, gt=0)
    guide_id: int | None = Field(default=None, gt=0)
    metadata: dict[str, str | int | float | bool] = Field(default_factory=dict)

    @field_validator("metadata")
    @classmethod
    def restrict_metadata(cls, value: dict[str, object]) -> dict[str, object]:
        allowed = {"path", "referrer_domain", "position", "campaign"}
        if len(value) > 10 or not set(value).issubset(allowed):
            raise ValueError("metadata contains unsupported keys")
        return value


class AffiliatePartnerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    program_name: str = Field(min_length=1, max_length=180)
    base_url: HttpUrl
    is_active: bool = True


class AffiliateLinkCreate(BaseModel):
    partner_id: int = Field(gt=0)
    service_id: int | None = Field(default=None, gt=0)
    guide_id: int | None = Field(default=None, gt=0)
    destination_url: HttpUrl
    disclosure: str = Field(min_length=1, max_length=500)
    is_active: bool = True


class SponsorshipCreate(BaseModel):
    service_id: int = Field(gt=0)
    campaign_name: str = Field(min_length=1, max_length=180)
    starts_at: datetime
    ends_at: datetime
    priority: int = Field(default=0, ge=0, le=1000)
    status: Literal["draft", "active", "paused", "ended"] = "draft"
    budget: Decimal | None = Field(default=None, ge=0)

    @field_validator("ends_at")
    @classmethod
    def validate_end(cls, value: datetime, info: object) -> datetime:
        data = getattr(info, "data", {})
        if data.get("starts_at") and value <= data["starts_at"]:
            raise ValueError("ends_at must be after starts_at")
        return value


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    is_plus: bool
    ends_at: datetime | None = None
    features: list[str]


class CheckoutResponse(BaseModel):
    checkout_id: str
    provider: str
    status: str
    message: str


class PaymentWebhook(BaseModel):
    event_id: str = Field(min_length=8, max_length=255)
    event_type: Literal[
        "subscription.activated",
        "subscription.renewed",
        "subscription.canceled",
        "payment.failed",
    ]
    user_id: int = Field(gt=0)
    plan_code: str = Field(min_length=1, max_length=50)
    provider_subscription_id: str = Field(min_length=1, max_length=255)


class UserPreferenceUpdate(BaseModel):
    interests: list[str] = Field(default_factory=list, max_length=20)
    age_group: str | None = Field(default=None, max_length=30)
    employment_status: str | None = Field(default=None, max_length=50)
    housing_status: str | None = Field(default=None, max_length=50)
    startup_interest: bool = False


class NotificationPreferenceUpdate(BaseModel):
    service_updates: bool = True
    deadlines: bool = True
    checklist: bool = True
    marketing: bool = False
    email_enabled: bool = True


class ApiClientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    plan: Literal["free"] = "free"


class ApiClientCreated(BaseModel):
    id: int
    name: str
    api_key: str
    warning: str = "이 API 키는 다시 표시되지 않습니다. 안전하게 보관하세요."
