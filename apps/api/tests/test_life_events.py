import asyncio
from uuid import uuid4

from fastapi.testclient import TestClient

from app.database import AsyncSessionFactory
from app.models.life_event import LifeEventModel, LifeEventTaskModel


async def seed_life_event() -> tuple[int, str]:
    async with AsyncSessionFactory() as session:
        slug = f"moving-test-{uuid4().hex}"
        event = LifeEventModel(
            slug=slug,
            title="이사했어요: 순서대로 확인하세요",
            short_label="이사했어요",
            description="이사 전후에 필요한 절차를 빠짐없이 확인합니다.",
            icon="🏠",
            category="주거",
            audience=["이사 예정자"],
            is_published=True,
            display_order=1,
        )
        session.add(event)
        await session.flush()
        session.add_all(
            [
                LifeEventTaskModel(
                    life_event_id=event.id,
                    title="전입신고",
                    description="정부24 또는 주민센터에서 전입신고를 합니다.",
                    why_it_matters="주소지 행정정보를 갱신하기 위해 필요합니다.",
                    task_type="required",
                    timing_label="이사 후 14일 이내",
                    deadline_days=14,
                    estimated_minutes=10,
                    required_documents=["신분증"],
                    official_url="https://www.gov.kr",
                    official_source="정부24",
                    display_order=1,
                ),
                LifeEventTaskModel(
                    life_event_id=event.id,
                    title="공과금 주소 변경",
                    description="전기·가스·수도 이용 정보를 변경합니다.",
                    why_it_matters="요금 누락과 정산 문제를 예방합니다.",
                    task_type="recommended",
                    timing_label="이사 당일",
                    estimated_minutes=20,
                    required_documents=[],
                    display_order=2,
                ),
            ]
        )
        await session.commit()
        return event.id, slug


def test_list_and_detail_life_events(client: TestClient) -> None:
    _, slug = asyncio.run(seed_life_event())

    list_response = client.get("/api/v1/life-events")
    assert list_response.status_code == 200
    listed_event = next(item for item in list_response.json() if item["slug"] == slug)
    assert listed_event["task_count"] == 2

    detail_response = client.get(f"/api/v1/life-events/{slug}")
    assert detail_response.status_code == 200
    assert [task["title"] for task in detail_response.json()["tasks"]] == [
        "전입신고",
        "공과금 주소 변경",
    ]


def test_plan_requires_login(client: TestClient) -> None:
    event_id, _ = asyncio.run(seed_life_event())
    response = client.post(f"/api/v1/life-events/{event_id}/plans")
    assert response.status_code == 401


def test_user_can_start_plan_and_complete_task(
    client: TestClient, user_token: str
) -> None:
    event_id, slug = asyncio.run(seed_life_event())
    headers = {"Authorization": f"Bearer {user_token}"}

    detail = client.get(f"/api/v1/life-events/{slug}").json()
    start_response = client.post(
        f"/api/v1/life-events/{event_id}/plans", headers=headers
    )
    assert start_response.status_code == 201
    plan = start_response.json()
    assert plan["total_tasks"] == 2
    assert plan["progress_percent"] == 0

    update_response = client.patch(
        f"/api/v1/life-events/plans/{plan['plan_id']}/tasks/{detail['tasks'][0]['id']}",
        headers=headers,
        json={"is_completed": True},
    )
    assert update_response.status_code == 200
    assert update_response.json()["completed_tasks"] == 1
    assert update_response.json()["progress_percent"] == 50

    plans_response = client.get("/api/v1/life-events/me/plans", headers=headers)
    assert plans_response.status_code == 200
    assert plans_response.json()[0]["plan_id"] == plan["plan_id"]
