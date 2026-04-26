"""
app/services/otp_service.py
---------------------------
Generates, stores, and emails a 6-digit OTP.

Design notes:
- OTP is generated with the `secrets` module (cryptographically secure).
- Expiry is stored as UTC datetime in the database.
- The email is sent via Flask-Mail (configured in config.py).
- Sending errors are logged but NOT re-raised so a mail outage doesn't
  crash the signup endpoint — a failed send returns False so the caller
  can inform the user.
"""

import secrets
import logging
from datetime import datetime, timedelta, timezone

from flask import current_app
from flask_mail import Message

from app import mail

logger = logging.getLogger(__name__)


def generate_otp() -> str:
    """Return a cryptographically random 6-digit string, zero-padded."""
    return str(secrets.randbelow(1_000_000)).zfill(6)


def compute_expiry() -> datetime:
    """Return a timezone-aware UTC datetime OTP_EXPIRY_MINUTES from now."""
    minutes = current_app.config.get("OTP_EXPIRY_MINUTES", 10)
    return datetime.now(timezone.utc) + timedelta(minutes=minutes)


def send_otp_email(to_email: str, fullname: str, otp: str) -> bool:
    """
    Send the OTP to `to_email`.

    Returns True on success, False if the send failed.
    Caller should check the return value and surface an appropriate message.
    """
    minutes = current_app.config.get("OTP_EXPIRY_MINUTES", 10)

    subject = "Your Campus Navigation Verification Code"
    body = f"""Hi {fullname},

Your one-time verification code is:

    {otp}

This code expires in {minutes} minutes.

If you did not request this, please ignore this email.

— Campus Navigation Team
"""

    html_body = f"""
<div style="font-family:sans-serif;max-width:480px;margin:auto;">
  <h2 style="color:#2563EB;">Campus Navigation</h2>
  <p>Hi <strong>{fullname}</strong>,</p>
  <p>Your verification code is:</p>
  <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
              text-align:center;padding:20px;background:#EFF6FF;
              border-radius:12px;color:#1D4ED8;">
    {otp}
  </div>
  <p style="color:#6B7280;font-size:13px;margin-top:16px;">
    This code expires in <strong>{minutes} minutes</strong>.<br>
    If you did not create an account, ignore this email.
  </p>
</div>
"""

    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            body=body,
            html=html_body,
        )
        mail.send(msg)
        logger.info("OTP email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send OTP email to %s: %s", to_email, exc)
        return False
