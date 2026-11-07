"""Tests for user settings API endpoints."""

from fastapi.testclient import TestClient


def test_get_settings(client: TestClient) -> None:
    """Test retrieving user settings."""
    response = client.get("/api/v1/settings?user_id=default_user")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    keys = {item["key"]: item["value"] for item in data}
    assert "lookahead_hours" in keys
    assert keys["lookahead_hours"] == "48"


def test_patch_settings(client: TestClient) -> None:
    """Test updating user settings."""
    payload = {"settings": {"lookahead_hours": "72", "custom_key": "custom_val"}}
    response = client.patch(
        "/api/v1/settings?user_id=default_user",
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    keys = {item["key"]: item["value"] for item in data}
    assert keys["lookahead_hours"] == "72"
    assert keys["custom_key"] == "custom_val"
