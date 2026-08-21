from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class GuideModel(Base):
    __tablename__ = "guides"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240))
    summary: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80), index=True)
    status: Mapped[str] = mapped_column(
        String(20), default="draft", server_default="draft", index=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class GuideServiceModel(Base):
    __tablename__ = "guide_services"
    __table_args__ = (
        UniqueConstraint(
            "guide_id", "service_id", name="uq_guide_services_guide_service"
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    guide_id: Mapped[int] = mapped_column(
        ForeignKey("guides.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )


class AnalyticsEventModel(Base):
    __tablename__ = "analytics_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    event_name: Mapped[str] = mapped_column(String(50), index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    client_id: Mapped[str] = mapped_column(String(100), index=True)
    service_id: Mapped[int | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"), index=True
    )
    guide_id: Mapped[int | None] = mapped_column(
        ForeignKey("guides.id", ondelete="SET NULL"), index=True
    )
    event_metadata: Mapped[dict[str, object]] = mapped_column(
        JSON, default=dict, server_default="{}"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )


class AffiliatePartnerModel(Base):
    __tablename__ = "affiliate_partners"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    program_name: Mapped[str] = mapped_column(String(180))
    base_url: Mapped[str] = mapped_column(String(1000))
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )


class AffiliateLinkModel(Base):
    __tablename__ = "affiliate_links"
    id: Mapped[int] = mapped_column(primary_key=True)
    partner_id: Mapped[int] = mapped_column(
        ForeignKey("affiliate_partners.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[int | None] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    guide_id: Mapped[int | None] = mapped_column(
        ForeignKey("guides.id", ondelete="CASCADE"), index=True
    )
    destination_url: Mapped[str] = mapped_column(String(2000))
    disclosure: Mapped[str] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class SponsorshipModel(Base):
    __tablename__ = "sponsorships"
    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"), index=True
    )
    campaign_name: Mapped[str] = mapped_column(String(180))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    priority: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    status: Mapped[str] = mapped_column(
        String(20), default="draft", server_default="draft", index=True
    )
    budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PlanModel(Base):
    __tablename__ = "plans"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0, server_default="0"
    )
    billing_interval: Mapped[str] = mapped_column(
        String(20), default="month", server_default="month"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )


class SubscriptionModel(Base):
    __tablename__ = "subscriptions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), index=True)
    status: Mapped[str] = mapped_column(
        String(30), default="pending", server_default="pending", index=True
    )
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provider: Mapped[str] = mapped_column(
        String(50), default="sandbox", server_default="sandbox"
    )
    provider_subscription_id: Mapped[str | None] = mapped_column(
        String(255), unique=True
    )
    cancel_at_period_end: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )


class PaymentEventModel(Base):
    __tablename__ = "payment_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    provider_event_id: Mapped[str] = mapped_column(String(255), unique=True)
    event_type: Mapped[str] = mapped_column(String(80))
    payload: Mapped[dict[str, object]] = mapped_column(JSON)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class UserPreferenceModel(Base):
    __tablename__ = "user_preferences"
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    interests: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    age_group: Mapped[str | None] = mapped_column(String(30))
    employment_status: Mapped[str | None] = mapped_column(String(50))
    housing_status: Mapped[str | None] = mapped_column(String(50))
    startup_interest: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class NotificationPreferenceModel(Base):
    __tablename__ = "notification_preferences"
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    service_updates: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    deadlines: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    checklist: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    marketing: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )
    email_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    unsubscribe_token_hash: Mapped[str] = mapped_column(String(64), unique=True)


class NotificationModel(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    kind: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(20), default="pending", server_default="pending", index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ApiClientModel(Base):
    __tablename__ = "api_clients"
    id: Mapped[int] = mapped_column(primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(120))
    api_key_prefix: Mapped[str] = mapped_column(String(16), index=True)
    api_key_hash: Mapped[str] = mapped_column(String(64), unique=True)
    plan: Mapped[str] = mapped_column(String(20), default="free", server_default="free")
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ApiUsageModel(Base):
    __tablename__ = "api_usage"
    id: Mapped[int] = mapped_column(primary_key=True)
    api_client_id: Mapped[int] = mapped_column(
        ForeignKey("api_clients.id", ondelete="CASCADE"), index=True
    )
    endpoint: Mapped[str] = mapped_column(String(255))
    response_status: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )


class RevenueRecordModel(Base):
    __tablename__ = "revenue_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(30), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(
        String(3), default="KRW", server_default="KRW"
    )
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    external_reference: Mapped[str | None] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
