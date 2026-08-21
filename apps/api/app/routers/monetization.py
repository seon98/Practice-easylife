import secrets
from datetime import UTC, datetime, timedelta
from hashlib import sha256
from typing import Annotated
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.monetization import (
    AffiliateLinkModel,
    AffiliatePartnerModel,
    AnalyticsEventModel,
    ApiClientModel,
    ApiUsageModel,
    FeedbackRequestModel,
    GuideModel,
    GuideServiceModel,
    NotificationPreferenceModel,
    PaymentEventModel,
    PlanModel,
    RevenueRecordModel,
    SponsorshipModel,
    SubscriptionModel,
    UserPreferenceModel,
)
from app.models.service import ServiceModel
from app.models.user import UserModel
from app.payments.provider import get_payment_provider
from app.rate_limit import limit_auth_attempts
from app.schemas.monetization import (
    AffiliateLinkCreate,
    AffiliatePartnerCreate,
    AnalyticsEventCreate,
    ApiClientCreate,
    ApiClientCreated,
    CheckoutResponse,
    FeedbackRequestCreate,
    FeedbackRequestResponse,
    GuideCreate,
    GuideResponse,
    GuideUpdate,
    NotificationPreferenceUpdate,
    PaymentWebhook,
    SponsorshipCreate,
    SubscriptionResponse,
    UserPreferenceUpdate,
)
from app.schemas.service import ServiceResponse
from app.security import get_current_user, get_optional_user, require_admin

router = APIRouter(prefix="/api/v1", tags=["monetization"])
public_router = APIRouter(prefix="/api/public/v1", tags=["public-api"])
redirect_router = APIRouter(tags=["affiliate"])
Db = Annotated[AsyncSession, Depends(get_db)]
Admin = Annotated[UserModel, Depends(require_admin)]
CurrentUser = Annotated[UserModel, Depends(get_current_user)]
OptionalUser = Annotated[UserModel | None, Depends(get_optional_user)]


async def guide_response(session: AsyncSession, guide: GuideModel) -> GuideResponse:
    service_ids = list(
        await session.scalars(
            select(GuideServiceModel.service_id).where(
                GuideServiceModel.guide_id == guide.id
            )
        )
    )
    return GuideResponse.model_validate(guide).model_copy(
        update={"service_ids": service_ids}
    )


@router.get("/guides", response_model=list[GuideResponse])
async def list_guides(session: Db) -> list[GuideResponse]:
    rows = list(
        await session.scalars(
            select(GuideModel)
            .where(GuideModel.status == "published")
            .order_by(GuideModel.published_at.desc())
        )
    )
    return [await guide_response(session, row) for row in rows]


@router.get("/guides/{slug}", response_model=GuideResponse)
async def get_guide(slug: str, session: Db) -> GuideResponse:
    row = await session.scalar(
        select(GuideModel).where(
            GuideModel.slug == slug, GuideModel.status == "published"
        )
    )
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guide not found")
    return await guide_response(session, row)


@router.post(
    "/feedback",
    response_model=dict[str, str],
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_feedback(
    payload: FeedbackRequestCreate,
    session: Db,
    _: None = Depends(limit_auth_attempts),
) -> dict[str, str]:
    session.add(
        FeedbackRequestModel(
            category=payload.category,
            email=payload.email,
            page_url=payload.page_url,
            message=payload.message,
        )
    )
    await session.commit()
    return {"status": "accepted"}


@router.get("/admin/feedback", response_model=list[FeedbackRequestResponse])
async def admin_feedback(session: Db, _: Admin) -> list[FeedbackRequestModel]:
    return list(
        await session.scalars(
            select(FeedbackRequestModel)
            .order_by(FeedbackRequestModel.created_at.desc())
            .limit(200)
        )
    )


@router.get("/admin/guides", response_model=list[GuideResponse])
async def admin_guides(session: Db, _: Admin) -> list[GuideResponse]:
    rows = list(
        await session.scalars(select(GuideModel).order_by(GuideModel.updated_at.desc()))
    )
    return [await guide_response(session, row) for row in rows]


@router.post(
    "/admin/guides", response_model=GuideResponse, status_code=status.HTTP_201_CREATED
)
async def create_guide(payload: GuideCreate, session: Db, _: Admin) -> GuideResponse:
    data = payload.model_dump(exclude={"service_ids"})
    if data["status"] == "published":
        data["published_at"] = datetime.now(UTC)
    guide = GuideModel(**data)
    session.add(guide)
    await session.flush()
    session.add_all(
        [
            GuideServiceModel(guide_id=guide.id, service_id=value)
            for value in payload.service_ids
        ]
    )
    await session.commit()
    await session.refresh(guide)
    return await guide_response(session, guide)


@router.patch("/admin/guides/{guide_id}", response_model=GuideResponse)
async def update_guide(
    guide_id: int, payload: GuideUpdate, session: Db, _: Admin
) -> GuideResponse:
    guide = await session.get(GuideModel, guide_id)
    if guide is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guide not found")
    changes = payload.model_dump(exclude_unset=True, exclude={"service_ids"})
    if changes.get("status") == "published" and guide.published_at is None:
        changes["published_at"] = datetime.now(UTC)
    for key, value in changes.items():
        setattr(guide, key, value)
    if payload.service_ids is not None:
        await session.execute(
            delete(GuideServiceModel).where(GuideServiceModel.guide_id == guide_id)
        )
        session.add_all(
            [
                GuideServiceModel(guide_id=guide_id, service_id=value)
                for value in payload.service_ids
            ]
        )
    await session.commit()
    await session.refresh(guide)
    return await guide_response(session, guide)


@router.post("/analytics/events", status_code=status.HTTP_202_ACCEPTED)
async def record_event(
    payload: AnalyticsEventCreate, session: Db, user: OptionalUser
) -> dict[str, str]:
    session.add(
        AnalyticsEventModel(
            event_name=payload.event_name,
            user_id=user.id if user else None,
            client_id=payload.client_id,
            service_id=payload.service_id,
            guide_id=payload.guide_id,
            event_metadata=payload.metadata,
        )
    )
    await session.commit()
    return {"status": "accepted"}


@router.get("/admin/analytics/summary")
async def analytics_summary(session: Db, _: Admin) -> dict[str, object]:
    since = datetime.now(UTC) - timedelta(days=30)
    count_rows = (
        await session.execute(
            select(AnalyticsEventModel.event_name, func.count())
            .where(AnalyticsEventModel.created_at >= since)
            .group_by(AnalyticsEventModel.event_name)
        )
    ).all()
    counts: dict[str, int] = {name: count for name, count in count_rows}
    popular_services = (
        await session.execute(
            select(
                ServiceModel.name, func.count(AnalyticsEventModel.id).label("clicks")
            )
            .join(
                AnalyticsEventModel, AnalyticsEventModel.service_id == ServiceModel.id
            )
            .where(
                AnalyticsEventModel.event_name == "service_click",
                AnalyticsEventModel.created_at >= since,
            )
            .group_by(ServiceModel.id)
            .order_by(func.count(AnalyticsEventModel.id).desc())
            .limit(10)
        )
    ).all()
    popular_guides = (
        await session.execute(
            select(GuideModel.title, func.count(AnalyticsEventModel.id).label("views"))
            .join(AnalyticsEventModel, AnalyticsEventModel.guide_id == GuideModel.id)
            .where(
                AnalyticsEventModel.event_name == "guide_view",
                AnalyticsEventModel.created_at >= since,
            )
            .group_by(GuideModel.id)
            .order_by(func.count(AnalyticsEventModel.id).desc())
            .limit(10)
        )
    ).all()
    return {
        "period_days": 30,
        "events": counts,
        "popular_services": [{"name": n, "clicks": c} for n, c in popular_services],
        "popular_guides": [{"title": t, "views": v} for t, v in popular_guides],
    }


@router.post("/admin/affiliate/partners", status_code=status.HTTP_201_CREATED)
async def create_partner(
    payload: AffiliatePartnerCreate, session: Db, _: Admin
) -> dict[str, int]:
    row = AffiliatePartnerModel(**payload.model_dump(mode="json"))
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return {"id": row.id}


@router.post("/admin/affiliate/links", status_code=status.HTTP_201_CREATED)
async def create_affiliate(
    payload: AffiliateLinkCreate, session: Db, _: Admin
) -> dict[str, int]:
    partner = await session.get(AffiliatePartnerModel, payload.partner_id)
    if (
        partner is None
        or urlparse(str(payload.destination_url)).hostname
        != urlparse(partner.base_url).hostname
    ):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Destination must match the registered partner domain",
        )
    row = AffiliateLinkModel(**payload.model_dump(mode="json"))
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return {"id": row.id}


@redirect_router.get("/r/{affiliate_id}")
async def affiliate_redirect(
    affiliate_id: int, session: Db, request: Request
) -> RedirectResponse:
    row = await session.get(AffiliateLinkModel, affiliate_id)
    if row is None or not row.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Affiliate link not found")
    partner = await session.get(AffiliatePartnerModel, row.partner_id)
    if (
        partner is None
        or not partner.is_active
        or urlparse(row.destination_url).hostname != urlparse(partner.base_url).hostname
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unsafe affiliate destination")
    session.add(
        AnalyticsEventModel(
            event_name="affiliate_click",
            client_id=request.headers.get("X-Client-ID", "anonymous")[:100],
            service_id=row.service_id,
            guide_id=row.guide_id,
            event_metadata={"campaign": partner.program_name},
        )
    )
    await session.commit()
    return RedirectResponse(
        row.destination_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT
    )


@router.post("/admin/sponsorships", status_code=status.HTTP_201_CREATED)
async def create_sponsorship(
    payload: SponsorshipCreate, session: Db, _: Admin
) -> dict[str, int]:
    row = SponsorshipModel(**payload.model_dump())
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return {"id": row.id}


@router.get("/sponsorships/active")
async def active_sponsorships(session: Db) -> list[dict[str, object]]:
    now = datetime.now(UTC)
    rows = (
        await session.execute(
            select(SponsorshipModel, ServiceModel)
            .join(ServiceModel)
            .where(
                SponsorshipModel.status == "active",
                SponsorshipModel.starts_at <= now,
                SponsorshipModel.ends_at > now,
            )
            .order_by(SponsorshipModel.priority.desc())
        )
    ).all()
    return [
        {
            "campaign_id": c.id,
            "label": "Sponsored",
            "service": ServiceResponse.model_validate(s).model_dump(mode="json"),
        }
        for c, s in rows
    ]


@router.get("/subscriptions/me", response_model=SubscriptionResponse)
async def subscription_me(session: Db, user: CurrentUser) -> SubscriptionResponse:
    row = (
        await session.execute(
            select(SubscriptionModel, PlanModel)
            .join(PlanModel)
            .where(
                SubscriptionModel.user_id == user.id,
                SubscriptionModel.status == "active",
            )
            .order_by(SubscriptionModel.ends_at.desc())
            .limit(1)
        )
    ).first()
    if not row:
        return SubscriptionResponse(
            plan="free",
            status="active",
            is_plus=False,
            features=["services", "guides", "favorites"],
        )
    subscription, plan = row
    return SubscriptionResponse(
        plan=plan.code,
        status=subscription.status,
        is_plus=plan.code == "plus",
        ends_at=subscription.ends_at,
        features=[
            "services",
            "guides",
            "favorites",
            "recommendations",
            "ad_free",
            "notifications",
        ],
    )


@router.post("/payments/checkout", response_model=CheckoutResponse)
async def create_checkout(session: Db, user: CurrentUser) -> CheckoutResponse:
    plan = await session.scalar(
        select(PlanModel).where(PlanModel.code == "plus", PlanModel.is_active.is_(True))
    )
    if plan is None:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Plus plan is not configured"
        )
    checkout = await get_payment_provider().create_checkout(
        user_id=user.id, plan_code=plan.code
    )
    return CheckoutResponse(**checkout.__dict__)


@router.post("/payments/webhook", status_code=status.HTTP_204_NO_CONTENT)
async def payment_webhook(
    request: Request, session: Db, x_payment_signature: Annotated[str, Header()] = ""
) -> Response:
    body = await request.body()
    provider = get_payment_provider()
    if not provider.verify_webhook(body=body, signature=x_payment_signature):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid webhook signature")
    payload = PaymentWebhook.model_validate_json(body)
    if await session.scalar(
        select(PaymentEventModel.id).where(
            PaymentEventModel.provider_event_id == payload.event_id
        )
    ):
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    plan = await session.scalar(
        select(PlanModel).where(PlanModel.code == payload.plan_code)
    )
    if plan is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown plan")
    event = PaymentEventModel(
        provider_event_id=payload.event_id,
        event_type=payload.event_type,
        payload=payload.model_dump(mode="json"),
    )
    session.add(event)
    subscription = await session.scalar(
        select(SubscriptionModel).where(
            SubscriptionModel.provider_subscription_id
            == payload.provider_subscription_id
        )
    )
    if subscription is None:
        subscription = SubscriptionModel(
            user_id=payload.user_id,
            plan_id=plan.id,
            provider="configured",
            provider_subscription_id=payload.provider_subscription_id,
        )
        session.add(subscription)
    if payload.event_type in {"subscription.activated", "subscription.renewed"}:
        subscription.status = "active"
        subscription.starts_at = datetime.now(UTC)
        subscription.ends_at = datetime.now(UTC) + timedelta(days=30)
    elif payload.event_type == "subscription.canceled":
        subscription.status = "canceled"
        subscription.cancel_at_period_end = True
    else:
        subscription.status = "past_due"
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/preferences")
async def update_preferences(
    payload: UserPreferenceUpdate, session: Db, user: CurrentUser
) -> dict[str, str]:
    row = await session.get(UserPreferenceModel, user.id)
    if row is None:
        row = UserPreferenceModel(user_id=user.id)
        session.add(row)
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    await session.commit()
    return {"status": "saved"}


@router.get("/recommendations")
async def recommendations(session: Db, user: CurrentUser) -> list[dict[str, object]]:
    entitlement = await subscription_me(session, user)
    if not entitlement.is_plus:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "EasyLife Plus is required")
    prefs = await session.get(UserPreferenceModel, user.id)
    interests = set(prefs.interests if prefs else [])
    services = list(await session.scalars(select(ServiceModel)))
    ranked = sorted(
        services, key=lambda item: (item.category in interests, item.id), reverse=True
    )
    return [
        {
            "service": ServiceResponse.model_validate(item).model_dump(mode="json"),
            "score": 100 if item.category in interests else 10,
            "reason": f"{item.category} 분야를 관심사로 선택했기 때문에 추천했습니다."
            if item.category in interests
            else "EasyLife의 기본 추천 서비스입니다.",
            "sponsored": False,
        }
        for item in ranked[:10]
    ]


@router.put("/notifications/preferences")
async def notification_preferences(
    payload: NotificationPreferenceUpdate, session: Db, user: CurrentUser
) -> dict[str, str]:
    row = await session.get(NotificationPreferenceModel, user.id)
    if row is None:
        token = secrets.token_urlsafe(32)
        row = NotificationPreferenceModel(
            user_id=user.id, unsubscribe_token_hash=sha256(token.encode()).hexdigest()
        )
        session.add(row)
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    await session.commit()
    return {"status": "saved"}


@router.post("/notifications/unsubscribe/{token}")
async def unsubscribe(token: str, session: Db) -> dict[str, str]:
    row = await session.scalar(
        select(NotificationPreferenceModel).where(
            NotificationPreferenceModel.unsubscribe_token_hash
            == sha256(token.encode()).hexdigest()
        )
    )
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unsubscribe token not found")
    row.email_enabled = False
    row.marketing = False
    await session.commit()
    return {"status": "unsubscribed"}


def hash_api_key(raw: str) -> str:
    return sha256(f"{get_settings().secret_key}:{raw}".encode()).hexdigest()


@router.post(
    "/api-clients", response_model=ApiClientCreated, status_code=status.HTTP_201_CREATED
)
async def create_api_client(
    payload: ApiClientCreate, session: Db, user: CurrentUser
) -> ApiClientCreated:
    raw = f"el_{secrets.token_urlsafe(32)}"
    row = ApiClientModel(
        owner_user_id=user.id,
        name=payload.name,
        api_key_prefix=raw[:12],
        api_key_hash=hash_api_key(raw),
        plan=payload.plan,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return ApiClientCreated(id=row.id, name=row.name, api_key=raw)


@router.get("/api-clients/{client_id}/usage")
async def api_client_usage(
    client_id: int, session: Db, user: CurrentUser
) -> dict[str, object]:
    client = await session.get(ApiClientModel, client_id)
    if client is None or client.owner_user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API client not found")
    since = datetime.now(UTC) - timedelta(days=30)
    rows = (
        await session.execute(
            select(ApiUsageModel.endpoint, func.count())
            .where(
                ApiUsageModel.api_client_id == client.id,
                ApiUsageModel.created_at >= since,
            )
            .group_by(ApiUsageModel.endpoint)
        )
    ).all()
    return {
        "period_days": 30,
        "client_id": client.id,
        "usage": [
            {"endpoint": endpoint, "requests": count} for endpoint, count in rows
        ],
    }


async def authenticate_api_client(session: AsyncSession, raw: str) -> ApiClientModel:
    client = await session.scalar(
        select(ApiClientModel).where(
            ApiClientModel.api_key_hash == hash_api_key(raw),
            ApiClientModel.is_active.is_(True),
        )
    )
    if client is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
    minute_ago = datetime.now(UTC) - timedelta(minutes=1)
    usage = await session.scalar(
        select(func.count())
        .select_from(ApiUsageModel)
        .where(
            ApiUsageModel.api_client_id == client.id,
            ApiUsageModel.created_at >= minute_ago,
        )
    )
    if (usage or 0) >= get_settings().public_api_free_requests_per_minute:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limit exceeded")
    return client


@public_router.get("/services", response_model=list[ServiceResponse])
async def public_services(
    session: Db, x_api_key: Annotated[str, Header()]
) -> list[ServiceResponse]:
    client = await authenticate_api_client(session, x_api_key)
    rows = list(await session.scalars(select(ServiceModel).order_by(ServiceModel.id)))
    session.add(
        ApiUsageModel(
            api_client_id=client.id,
            endpoint="/api/public/v1/services",
            response_status=200,
        )
    )
    await session.commit()
    return [ServiceResponse.model_validate(row) for row in rows]


@public_router.get("/services/{service_id}", response_model=ServiceResponse)
async def public_service(
    service_id: int, session: Db, x_api_key: Annotated[str, Header()]
) -> ServiceResponse:
    client = await authenticate_api_client(session, x_api_key)
    row = await session.get(ServiceModel, service_id)
    code = 200 if row else 404
    session.add(
        ApiUsageModel(
            api_client_id=client.id,
            endpoint="/api/public/v1/services/{id}",
            response_status=code,
        )
    )
    await session.commit()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    return ServiceResponse.model_validate(row)


@router.get("/admin/revenue/summary")
async def revenue_summary(session: Db, _: Admin) -> dict[str, object]:
    event_rows = (
        await session.execute(
            select(AnalyticsEventModel.event_name, func.count()).group_by(
                AnalyticsEventModel.event_name
            )
        )
    ).all()
    events: dict[str, int] = {name: count for name, count in event_rows}
    revenue_rows = (
        await session.execute(
            select(
                RevenueRecordModel.source,
                func.coalesce(func.sum(RevenueRecordModel.amount), 0),
            ).group_by(RevenueRecordModel.source)
        )
    ).all()
    revenue: dict[str, object] = {source: amount for source, amount in revenue_rows}
    active_subscriptions = (
        await session.scalar(
            select(func.count())
            .select_from(SubscriptionModel)
            .where(SubscriptionModel.status == "active")
        )
        or 0
    )
    mrr = await session.scalar(
        select(func.coalesce(func.sum(PlanModel.price), 0))
        .select_from(SubscriptionModel)
        .join(PlanModel)
        .where(
            SubscriptionModel.status == "active", PlanModel.billing_interval == "month"
        )
    )
    page_views = events.get("page_view", 0)
    signups = events.get("signup", 0)
    clicks = events.get("service_click", 0)
    return {
        "traffic": {"page_views": page_views},
        "engagement": {
            "service_clicks": clicks,
            "guide_views": events.get("guide_view", 0),
            "favorites": events.get("favorite_add", 0),
        },
        "conversion": {
            "signups": signups,
            "signup_rate": (signups / page_views) if page_views else None,
            "subscription_views": events.get("subscription_view", 0),
            "subscriptions_started": events.get("subscription_started", 0),
        },
        "revenue": {
            "by_source": revenue,
            "subscription_mrr": mrr,
            "active_subscriptions": active_subscriptions,
        },
    }
