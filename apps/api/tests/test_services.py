from fastapi.testclient import TestClient


def test_services_list_and_detail(client: TestClient) -> None:
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    assert len(response.json()) >= 2
    assert client.get("/api/v1/services/1").status_code == 200
    assert client.get("/api/v1/services/9999").status_code == 404
    assert client.get("/api/v1/services/0").status_code == 422
