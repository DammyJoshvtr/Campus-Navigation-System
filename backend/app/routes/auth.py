"""
app/routes/auth.py
------------------
Authentication blueprint.

Endpoints
---------
POST /api/auth/signup         — register with email + password, triggers OTP
POST /api/auth/verify-otp     — confirm OTP, enables login
POST /api/auth/resend-otp     — resend a fresh OTP
POST /api/auth/login          — email + password → JWT
POST /api/auth/google-login   — Google ID token → JWT
GET  /api/auth/me             — return current user (JWT required)
"""

from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db, bcrypt
from app.models.user import User
from app.services.otp_service import generate_otp, compute_expiry, send_otp_email
from app.services.google_auth_service import verify_google_token
from app.utils.responses import success_response, error_response
from app.utils.validators import (
    validate_signup_payload,
    validate_login_payload,
    is_university_email,
)

auth_bp = Blueprint("auth", __name__)


# ─── POST /api/auth/signup ────────────────────────────────────────────────────

@auth_bp.post("/signup")
def signup():
    """
    Register a new user.

    Body: { fullname, email, password }
    - Email must end with @edu.ng
    - Sends a 6-digit OTP to the email
    - User cannot log in until OTP is verified
    """
    data   = request.get_json(silent=True) or {}
    errors = validate_signup_payload(data)
    if errors:
        return error_response(errors[0], 422)

    email    = data["email"].strip().lower()
    fullname = data["fullname"].strip()
    password = data["password"].strip()

    # Duplicate email check
    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists.", 409)

    # Hash password with bcrypt
    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    otp     = generate_otp()
    expiry  = compute_expiry()

    user = User(
        fullname       = fullname,
        email          = email,
        password       = hashed_pw,
        is_verified    = False,
        otp_code       = otp,
        otp_expires_at = expiry,
    )
    db.session.add(user)
    db.session.commit()

    # Send OTP — if this fails we still return 201 but include a warning
    sent = send_otp_email(email, fullname, otp)

    message = (
        "Account created. Please check your email for a verification code."
        if sent
        else "Account created but we could not send the verification email. "
             "Use /resend-otp to try again."
    )

    return success_response(message, {"email": email}, 201)


# ─── POST /api/auth/verify-otp ────────────────────────────────────────────────

@auth_bp.post("/verify-otp")
def verify_otp():
    """
    Verify the 6-digit OTP.

    Body: { email, otp }
    On success: marks user as verified and returns a JWT.
    """
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp   = (data.get("otp")   or "").strip()

    if not email or not otp:
        return error_response("email and otp are required.", 422)

    user = User.query.filter_by(email=email).first()
    if not user:
        return error_response("No account found with this email.", 404)

    if user.is_verified:
        return error_response("Account is already verified.", 400)

    if not user.is_otp_valid(otp):
        return error_response(
            "Invalid or expired verification code. Request a new one.", 400
        )

    # Mark verified and clear OTP so it can't be reused
    user.is_verified = True
    user.clear_otp()
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return success_response(
        "Email verified successfully. You are now logged in.",
        {"token": token, "user": user.to_dict()},
    )


# ─── POST /api/auth/resend-otp ────────────────────────────────────────────────

@auth_bp.post("/resend-otp")
def resend_otp():
    """
    Issue a fresh OTP for an unverified account.

    Body: { email }
    """
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return error_response("email is required.", 422)

    user = User.query.filter_by(email=email).first()
    if not user:
        return error_response("No account found with this email.", 404)

    if user.is_verified:
        return error_response("Account is already verified.", 400)

    otp    = generate_otp()
    expiry = compute_expiry()

    user.otp_code       = otp
    user.otp_expires_at = expiry
    db.session.commit()

    sent = send_otp_email(email, user.fullname, otp)
    if not sent:
        return error_response("Could not send verification email. Try again later.", 500)

    return success_response("A new verification code has been sent to your email.")


# ─── POST /api/auth/login ─────────────────────────────────────────────────────

@auth_bp.post("/login")
def login():
    """
    Email + password login.

    Body: { email, password }
    Returns a JWT on success.
    """
    data   = request.get_json(silent=True) or {}
    errors = validate_login_payload(data)
    if errors:
        return error_response(errors[0], 422)

    email    = data["email"].strip().lower()
    password = data["password"].strip()

    user = User.query.filter_by(email=email).first()

    # Use a constant-time check even for missing users to prevent enumeration
    if not user or not user.password:
        # Dummy check so timing is similar whether user exists or not
        bcrypt.check_password_hash(
            "$2b$12$KIXnGy7x9nFq8YhEP4v3LOKvz8e7vMFCDOvKBvKbHZvnkgPp.VBCe",
            password,
        )
        return error_response("Invalid email or password.", 401)

    if not bcrypt.check_password_hash(user.password, password):
        return error_response("Invalid email or password.", 401)

    if not user.is_verified:
        return error_response(
            "Email not verified. Please check your inbox for the verification code.",
            403,
        )

    token = create_access_token(identity=str(user.id))

    return success_response(
        "Login successful.",
        {"token": token, "user": user.to_dict()},
    )


# ─── POST /api/auth/google-login ─────────────────────────────────────────────

@auth_bp.post("/google-login")
def google_login():
    """
    Authenticate via a Google ID token.

    Body: { id_token: "<token from Google>" }

    - Verifies the token cryptographically using google-auth.
    - Rejects emails that don't end with @edu.ng.
    - Creates the user automatically if they don't exist yet.
    - Google users are pre-verified (no OTP step).
    """
    data     = request.get_json(silent=True) or {}
    token_str = (data.get("id_token") or "").strip()

    if not token_str:
        return error_response("id_token is required.", 422)

    payload = verify_google_token(token_str)
    if payload is None:
        return error_response("Invalid or expired Google token.", 401)

    email = payload.get("email", "").lower()
    name  = payload.get("name", "Google User")

    if not payload.get("email_verified", False):
        return error_response("Google account email is not verified.", 400)

    if not is_university_email(email):
        return error_response(
            f"Only university email addresses (@edu.ng) are allowed.", 403
        )

    # Find or create the user
    user = User.query.filter_by(email=email).first()
    created = False

    if not user:
        user = User(
            fullname    = name,
            email       = email,
            password    = None,   # no password for Google users
            is_verified = True,   # Google has already verified the email
        )
        db.session.add(user)
        db.session.commit()
        created = True

    elif not user.is_verified:
        # Edge case: account existed but wasn't verified (e.g. from a previous
        # failed email signup) — Google verification is sufficient
        user.is_verified = True
        user.clear_otp()
        db.session.commit()

    token   = create_access_token(identity=str(user.id))
    message = "Account created via Google." if created else "Login successful."

    return success_response(
        message,
        {"token": token, "user": user.to_dict()},
        201 if created else 200,
    )


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────

@auth_bp.get("/me")
@jwt_required()
def me():
    """Return the profile of the currently authenticated user."""
    user_id = get_jwt_identity()
    user    = db.session.get(User, int(user_id))

    if not user:
        return error_response("User not found.", 404)

    return success_response("User profile retrieved.", user.to_dict())
