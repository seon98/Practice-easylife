from fastapi.testclient import TestClient


def test_admin_authorization(client: TestClient, user_token: str, admin_token: str) -> None:
    payload = {"name": "테스트", "description": "테스트 서비스", "category": "기타", "url": "https://example.com"}
    assert client.post("/api/v1/admin/services", json=payload).status_code == 401
    assert client.post("/api/v1/admin/services", json=payload, headers={"Authorization": f"Bearer {user_token}"}).status_code == 403
    created = client.post("/api/v1/admin/services", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert created.status_code == 201
    service_id = created.json()["id"]
    auth = {"Authorization": f"Bearer {admin_token}"}
    assert client.patch(f"/api/v1/admin/services/{service_id}", json={"name": "수정됨"}, headers=auth).status_code == 200
    assert client.delete(f"/api/v1/admin/services/{service_id}", headers=auth).status_code == 204
    assert client.patch("/api/v1/admin/services/9999", json={"name": "없음"}, headers=auth).status_code == 404
    assert client.post("/api/v1/admin/services", json={**payload, "url": "bad"}, headers=auth).status_code == 422
