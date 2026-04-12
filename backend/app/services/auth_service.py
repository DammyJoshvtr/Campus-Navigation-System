"""
Authentication service layer.

Separates business logic from route handlers.
"""
import secrets
import logging
from datetime import datetime, timezone

import bcrypt
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_mail import Message

from app import db, mail
from app.models.user import User

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain.encode(), salt).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------

def _generate_verification_token() -> str:
    return secrets.token_urlsafe(32)


def _build_verification_url(token: str) -> str:
    base = current_app.config["FRONTEND_URL"].rstrip("/")
    return f"{base}/verify-email?token={token}"


# ---------------------------------------------------------------------------
# Email helpers
# ---------------------------------------------------------------------------

def send_verification_email(user: User) -> None:
    """Send an account-verification email to *user*."""
    url = _build_verification_url(user.verification_token)
    msg = Message(
        subject="Verify your Campus Nav account",
        recipients=[user.email],
        html=f"""
        <h2>Welcome to Campus Navigation, {user.name}!</h2>
        <p>Please verify your email address by clicking the button below.</p>
        <a href="{url}"
           style="display:inline-block;padding:12px 24px;background:#1a73e8;
                  color:#fff;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
        <p>Or copy this link: <a href="{url}">{url}</a></p>
        <p>This link is valid for 24 hours.</p>
        """,
    )
    try:
        mail.send(msg)
        logger.info("Verification email sent to %s", user.email)
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", user.email, exc)
        raise


# ---------------------------------------------------------------------------
# Core auth operations
# ---------------------------------------------------------------------------

def register_user(name: str, email: str, password: str) -> User:
    """
    Create a new (unverified) user and send a verification email.

    Raises:
        ValueError: if the email is already registered.
    """
    email = email.lower().strip()

    if User.query.filter_by(email=email).first():
        raise ValueError("An account with this email already exists.")

    user = User(
        name=name.strip(),
        email=email,
        password_hash=hash_password(password),
        verification_token=_generate_verification_token(),
    )
    db.session.add(user)
    db.session.commit()

    send_verification_email(user)
    return user


def verify_email(token: str) -> User:
    """
    Mark a user's email as verified.

    Raises:
        ValueError: if the token is invalid or already used.
    """
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        raise ValueError("Invalid or expired verification token.")
    if user.is_verified:
        raise ValueError("This account is already verified.")

    user.is_verified = True
    user.verification_token = None          # invalidate token
    user.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return user


def login_user(email: str, password: str) -> dict:
    """
    Validate credentials and return JWT tokens.

    Raises:
        ValueError: on invalid credentials or unverified account.
    """
    email = email.lower().strip()
    user = User.query.filter_by(email=email).first()

    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password.")

    if not user.is_verified:
        raise ValueError(
            "Please verify your email before logging in. "
            "Check your inbox for a verification link."
        )

    identity = str(user.id)
    additional_claims = {"email": user.email, "name": user.name}

    access_token = create_access_token(
        identity=identity, additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(identity=identity)

    logger.info("User %s logged in successfully.", user.email)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "user": user.to_dict(),
    }
