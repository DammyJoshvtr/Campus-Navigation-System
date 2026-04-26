"""
app/models/user.py
------------------
User model.  Handles both email/password and Google OAuth users.

Design decisions:
- password is nullable so Google users don't need one.
- otp_code / otp_expires_at are cleared after successful verification
  so they can't be replayed.
- is_verified defaults to False; Google users are set to True on creation.
"""

from datetime import datetime, timezone
from app import db


class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    fullname      = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(255), unique=True, nullable=False, index=True)
    # Nullable → Google users have no password
    password      = db.Column(db.String(255), nullable=True)
    is_verified   = db.Column(db.Boolean, default=False, nullable=False)
    # 6-digit OTP stored as plain string (short-lived, not a secret worth hashing)
    otp_code      = db.Column(db.String(6),  nullable=True)
    otp_expires_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at    = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    saved_locations = db.relationship(
        "SavedLocation",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    # ── Helpers ───────────────────────────────────────────────────────────────

    def is_otp_valid(self, code: str) -> bool:
        """Return True if the supplied code matches and has not expired."""
        if not self.otp_code or not self.otp_expires_at:
            return False
        now = datetime.now(timezone.utc)
        # Make otp_expires_at timezone-aware if stored as naive UTC
        expires = self.otp_expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return self.otp_code == code and now < expires

    def clear_otp(self) -> None:
        """Wipe OTP fields after successful use."""
        self.otp_code       = None
        self.otp_expires_at = None

    def to_dict(self) -> dict:
        return {
            "id":          self.id,
            "fullname":    self.fullname,
            "email":       self.email,
            "is_verified": self.is_verified,
            "created_at":  self.created_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"
