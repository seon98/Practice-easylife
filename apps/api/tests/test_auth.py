from fastapi.testclient import TestClient


def test_signup_login_me_and_conflict(client: TestClient) -> None:
    payload = {"email": "new@example.com", "password": "strong-password"}
    signup_response = client.post("/api/v1/auth/signup", json=payload)
    assert signup_response.status_code == 201
    assert "password" not in str(signup_response.json())
    assert client.post("/api/v1/auth/signup", json=payload).status_code == 409
    assert (
        client.post(
            "/api/v1/auth/login", json={**payload, "password": "wrong"}
        ).status_code
        == 401
    )
    login_response = client.post("/api/v1/auth/login", json=payload)
    token = login_response.json()["access_token"]
    assert (
        client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
        ).status_code
        == 200
    )
    assert client.get("/api/v1/auth/me").status_code == 401


def test_signup_validation(client: TestClient) -> None:
    assert (
        client.post(
            "/api/v1/auth/signup", json={"email": "invalid", "password": "short"}
        ).status_code
        == 422
    )
