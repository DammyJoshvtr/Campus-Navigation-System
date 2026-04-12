"""
Input validation helpers.
All functions raise ValueError with a descriptive message on failure.
"""
import re

# Minimum 8 chars, at least one letter and one digit
_PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_email(email: str) -> str:
    email = email.strip().lower()
    if not email:
        raise ValueError("Email is required.")
    if not _EMAIL_RE.match(email):
        raise ValueError("Invalid email address format.")
    if len(email) > 255:
        raise ValueError("Email address is too long (max 255 chars).")
    return email


def validate_password(password: str) -> str:
    if not password:
        raise ValueError("Password is required.")
    if not _PASSWORD_RE.match(password):
        raise ValueError(
            "Password must be at least 8 characters and contain "
            "at least one letter and one digit."
        )
    return password


def validate_name(name: str) -> str:
    name = name.strip()
    if not name:
        raise ValueError("Name is required.")
    if len(name) < 2:
        raise ValueError("Name must be at least 2 characters.")
    if len(name) > 120:
        raise ValueError("Name must be at most 120 characters.")
    return name


def validate_coordinate(value, field_name: str, min_val: float, max_val: float) -> float:
    try:
        val = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{field_name}' must be a valid number.")
    if not (min_val <= val <= max_val):
        raise ValueError(f"'{field_name}' must be between {min_val} and {max_val}.")
    return val


def validate_lat(value, field_name: str = "latitude") -> float:
    return validate_coordinate(value, field_name, -90.0, 90.0)


def validate_lng(value, field_name: str = "longitude") -> float:
    return validate_coordinate(value, field_name, -180.0, 180.0)
