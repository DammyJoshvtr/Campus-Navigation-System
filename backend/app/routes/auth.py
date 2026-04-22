"""
Authentication routes.

POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/verify/<token>
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
"""
import logging
from flask import Blueprint, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt,
    get_jwt_identity,
    create_access_token,
)

from app import jwt_blacklist
from app.models.user import User
from app.services.auth_service import register_user, verify_email, login_user
from app.utils.validators import validate_email, validate_password, validate_name
from app.utils.responses import success, created, error
from app import limiter

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


# ---------------------------------------------------------------------------
# POST /api/auth/signup
# ---------------------------------------------------------------------------

@auth_bp.post("/signup")
@limiter.limit("10 per hour")
def signup():
    """Register a new user account."""
    data = request.get_json(silent=True) or {}

    # Validate
    errors = {}
    try:
        name = validate_name(data.get("name", ""))
    except ValueError as e:
        errors["name"] = str(e)

    try:
        email = validate_email(data.get("email", ""))
    except ValueError as e:
        errors["email"] = str(e)

    try:
        password = validate_password(data.get("password", ""))
    except ValueError as e:
        errors["password"] = str(e)

    if errors:
        return error("Validation failed", 422, errors)

    try:
        user = register_user(name=name, email=email, password=password)
    except ValueError as e:
        return error(str(e), 409)
    except Exception as e:
        logger.error("Signup error: %s", e, exc_info=True)
        return error("Registration failed. Please try again later.", 500)

    return created(
        user.to_dict(),
        "Account created. Please check your email to verify your account.",
    )


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------

@auth_bp.post("/login")
@limiter.limit("20 per hour")
def login():
    """Authenticate and return JWT tokens."""
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return error("Email and password are required.", 400)

    try:
        token_data = login_user(email=email, password=password)
    except ValueError as e:
        return error(str(e), 401)
    except Exception as e:
        logger.error("Login error: %s", e, exc_info=True)
        return error("Login failed. Please try again later.", 500)

    return success(token_data, "Login successful.")


# ---------------------------------------------------------------------------
# GET /api/auth/verify/<token>
# ---------------------------------------------------------------------------

@auth_bp.get("/verify/<string:token>")
def verify(token: str):
    """Verify email address via token sent by email."""
    try:
        user = verify_email(token)
    except ValueError as e:
        return error(str(e), 400)
    except Exception as e:
        logger.error("Verification error: %s", e, exc_info=True)
        return error("Verification failed.", 500)

    return success(user.to_dict(), "Email verified successfully. You can now log in.")


# ---------------------------------------------------------------------------
# POST /api/auth/refresh
# ---------------------------------------------------------------------------

@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using a valid refresh token."""
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)
    return success(
        {"access_token": new_access_token, "token_type": "Bearer"},
        "Token refreshed.",
    )


# ---------------------------------------------------------------------------
# POST /api/auth/logout
# ---------------------------------------------------------------------------

@auth_bp.post("/logout")
@jwt_required()
def logout():
    """Revoke the current access token."""
    jti = get_jwt()["jti"]
    jwt_blacklist.add(jti)
    return success({}, "Logged out successfully.")


# ---------------------------------------------------------------------------
# GET /api/auth/me   (protected example)
# ---------------------------------------------------------------------------

@auth_bp.get("/me")
@jwt_required()
def me():
    """Return the authenticated user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return error("User not found.", 404)
    return success(user.to_dict())
