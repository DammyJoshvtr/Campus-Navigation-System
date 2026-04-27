"""
app/utils/validators.py
-----------------------
Input validation helpers shared across routes.
Keeping validation out of routes keeps the route handlers thin.
"""

import os
import re

ALLOWED_DOMAIN = os.environ.get("ALLOWED_EMAIL_DOMAIN", "edu.ng")

# Simple email regex — good enough for our .edu.ng check
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email: str) -> bool:
    """Return True if the string looks like a valid email address."""
    return bool(EMAIL_RE.match(email.strip()))


def is_university_email(email: str) -> bool:
    """Return True if the email ends with the configured university domain."""
    return email.strip().lower().endswith(f"@{ALLOWED_DOMAIN}")


def validate_signup_payload(data: dict) -> list[str]:
    """
    Validate the signup request body.
    Returns a list of human-readable error strings (empty = valid).
    """
    errors: list[str] = []

    fullname = (data.get("fullname") or "").strip()
    email    = (data.get("email")    or "").strip()
    password = (data.get("password") or "").strip()

    if not fullname:
        errors.append("Full name is required.")
    elif len(fullname) < 2:
        errors.append("Full name must be at least 2 characters.")

    if not email:
        errors.append("Email is required.")
    elif not is_valid_email(email):
        errors.append("Email address is not valid.")
    elif not is_university_email(email):
        errors.append(f"Email must be a university address ending with @{ALLOWED_DOMAIN}.")

    if not password:
        errors.append("Password is required.")
    elif len(password) < 8:
        errors.append("Password must be at least 8 characters.")

    return errors


def validate_login_payload(data: dict) -> list[str]:
    errors: list[str] = []
    if not (data.get("email") or "").strip():
        errors.append("Email is required.")
    if not (data.get("password") or "").strip():
        errors.append("Password is required.")
    return errors
