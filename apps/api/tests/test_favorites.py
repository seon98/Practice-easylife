from fastapi.testclient import TestClient


def test_anonymous_favorite_lifecycle(client: TestClient, client_id: str) -> None:
    headers = {"X-Client-ID": client_id}
    assert client.get("/api/v1/favorites").status_code == 400
    assert client.post("/api/v1/favorites/1", headers=headers).status_code == 200
    assert client.post("/api/v1/favorites/1", headers=headers).status_code == 200
    assert len(client.get("/api/v1/favorites", headers=headers).json()) == 1
    assert client.post("/api/v1/favorites/9999", headers=headers).status_code == 404
    assert client.delete("/api/v1/favorites/1", headers=headers).status_code == 204
