"""
conftest.py – Pytest fixtures for the Campus Navigation test suite.
"""
import pytest
from app import create_app, db as _db
from app.models.user import User
from app.models.location import Location
from config import TestingConfig


@pytest.fixture(scope="session")
def app():
    """Create a test application using an in-memory SQLite database."""
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """A test client for the Flask app."""
    return app.test_client()


@pytest.fixture(scope="function")
def db(app):
    """Provide a clean database for each test."""
    with app.app_context():
        _db.session.begin_nested()
        yield _db
        _db.session.rollback()


@pytest.fixture
def sample_user(db):
    """Create a verified test user."""
    from app.services.auth_service import hash_password
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=hash_password("Password1"),
        is_verified=True,
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def auth_headers(client, sample_user):
    """Return Authorization headers for the sample user."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password1"},
    )
    token = resp.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_location(db):
    """Create a test location."""
    loc = Location(
        name="Test Library",
        latitude=6.5248,
        longitude=3.3792,
        type="Library",
    )
    db.session.add(loc)
    db.session.commit()
    return loc
