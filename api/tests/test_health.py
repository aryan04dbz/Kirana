"""Tests for health check endpoints."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    """Test GET / returns welcome information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "KiranaAI"
    assert "version" in data


def test_health_check(client: TestClient) -> None:
    """Test GET /health returns ok and database connected."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "KiranaAI"
    assert data["database"] == "connected"


def test_api_v1_health_check(client: TestClient) -> None:
    """Test GET /api/v1/health returns ok status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
