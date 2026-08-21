from fastapi.testclient import TestClient


def test_guide_lifecycle_and_analytics(client: TestClient, admin_token: str) -> None:
    auth = {"Authorization": f"Bearer {admin_token}"}
    created = client.post(
        "/api/v1/admin/guides",
        headers=auth,
        json={
            "slug": "moving-checklist",
            "title": "이사 체크리스트",
            "summary": "이사 전후 필요한 절차",
            "content": "전입신고와 주소 변경을 확인하세요.",
            "category": "주거",
            "status": "published",
            "service_ids": [1],
        },
    )
    assert created.status_code == 201
    guide = client.get("/api/v1/guides/moving-checklist")
    assert guide.status_code == 200
    assert guide.json()["service_ids"] == [1]
    event = client.post(
        "/api/v1/analytics/events",
        json={
            "event_name": "guide_view",
            "client_id": "test-client-123",
            "guide_id": guide.json()["id"],
            "metadata": {"path": "/guides/moving-checklist"},
        },
    )
    assert event.status_code == 202
    assert (
        client.get("/api/v1/admin/analytics/summary", headers=auth).status_code == 200
    )


def test_affiliate_redirect_is_allowlisted(
    client: TestClient, admin_token: str
) -> None:
    auth = {"Authorization": f"Bearer {admin_token}"}
    partner = client.post(
        "/api/v1/admin/affiliate/partners",
        headers=auth,
        json={
            "name": "Example",
            "program_name": "Example Partner",
            "base_url": "https://example.com",
            "is_active": True,
        },
    )
    assert partner.status_code == 201
    bad = client.post(
        "/api/v1/admin/affiliate/links",
        headers=auth,
        json={
            "partner_id": partner.json()["id"],
            "service_id": 1,
            "destination_url": "https://evil.example/path",
            "disclosure": "제휴 링크",
        },
    )
    assert bad.status_code == 422
    good = client.post(
        "/api/v1/admin/affiliate/links",
        headers=auth,
        json={
            "partner_id": partner.json()["id"],
            "service_id": 1,
            "destination_url": "https://example.com/path",
            "disclosure": "제휴 링크",
        },
    )
    assert good.status_code == 201
    redirect = client.get(f"/r/{good.json()['id']}", follow_redirects=False)
    assert redirect.status_code == 307
    assert redirect.headers["location"] == "https://example.com/path"


def test_b2b_key_is_shown_once_and_rate_limited_api_works(
    client: TestClient, user_token: str
) -> None:
    auth = {"Authorization": f"Bearer {user_token}"}
    created = client.post(
        "/api/v1/api-clients",
        headers=auth,
        json={"name": "테스트 클라이언트", "plan": "free"},
    )
    assert created.status_code == 201
    raw_key = created.json()["api_key"]
    assert raw_key.startswith("el_")
    response = client.get("/api/public/v1/services", headers={"X-API-Key": raw_key})
    assert response.status_code == 200
    assert len(response.json()) >= 2
    assert (
        client.get(
            "/api/public/v1/services", headers={"X-API-Key": "el_invalid"}
        ).status_code
        == 401
    )


def test_payment_webhook_requires_signature(client: TestClient) -> None:
    response = client.post(
        "/api/v1/payments/webhook",
        json={
            "event_id": "event_12345678",
            "event_type": "subscription.activated",
            "user_id": 1,
            "plan_code": "plus",
            "provider_subscription_id": "sub_123",
        },
    )
    assert response.status_code == 401
