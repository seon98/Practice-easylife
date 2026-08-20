from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
    }


def test_get_services() -> None:
    response = client.get(
        "/api/v1/services",
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 6

    assert data[0]["name"] == "정부24"


def test_get_service() -> None:
    response = client.get(
        "/api/v1/services/1",
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "정부24"


def test_service_not_found() -> None:
    response = client.get(
        "/api/v1/services/9999",
    )

    assert response.status_code == 404

    assert response.json() == {
        "detail": "Service not found",
    }
