"""Tests for /api/auth/* endpoints."""
import pytest


class TestSignup:
    def test_signup_success(self, client, db, mocker):
        mocker.patch("app.services.auth_service.send_verification_email")
        resp = client.post(
            "/api/auth/signup",
            json={"name": "Alice", "email": "alice@example.com", "password": "Secure123"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["success"] is True
        assert data["data"]["email"] == "alice@example.com"
        assert "password" not in data["data"]

    def test_signup_duplicate_email(self, client, db, sample_user, mocker):
        mocker.patch("app.services.auth_service.send_verification_email")
        resp = client.post(
            "/api/auth/signup",
            json={"name": "Another", "email": "test@example.com", "password": "Secure123"},
        )
        assert resp.status_code == 409

    def test_signup_invalid_email(self, client, db):
        resp = client.post(
            "/api/auth/signup",
            json={"name": "Bob", "email": "not-an-email", "password": "Secure123"},
        )
        assert resp.status_code == 422
        assert "email" in resp.get_json()["details"]

    def test_signup_weak_password(self, client, db):
        resp = client.post(
            "/api/auth/signup",
            json={"name": "Bob", "email": "bob@example.com", "password": "short"},
        )
        assert resp.status_code == 422
        assert "password" in resp.get_json()["details"]


class TestLogin:
    def test_login_success(self, client, sample_user):
        resp = client.post(
            "/api/auth/login",
            json={"email": "test@example.com", "password": "Password1"},
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_wrong_password(self, client, sample_user):
        resp = client.post(
            "/api/auth/login",
            json={"email": "test@example.com", "password": "wrongpass"},
        )
        assert resp.status_code == 401

    def test_login_unknown_email(self, client):
        resp = client.post(
            "/api/auth/login",
            json={"email": "nobody@example.com", "password": "Password1"},
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/api/auth/login", json={"email": "test@example.com"})
        assert resp.status_code == 400


class TestProtectedRoute:
    def test_me_authenticated(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["email"] == "test@example.com"

    def test_me_unauthenticated(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401
