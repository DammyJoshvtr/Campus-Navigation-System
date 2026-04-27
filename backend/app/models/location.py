"""
app/models/location.py
----------------------
Location    — campus places seeded from coordinates.json.
SavedLocation — join table between a user and a location they bookmarked.
"""

from datetime import datetime, timezone
from app import db


class Location(db.Model):
    __tablename__ = "locations"

    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String(255), nullable=False)
    latitude  = db.Column(db.Float,       nullable=False)
    longitude = db.Column(db.Float,       nullable=False)
    type      = db.Column(db.String(100), nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    saved_by = db.relationship(
        "SavedLocation",
        back_populates="location",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def to_dict(self) -> dict:
        return {
            "id":        self.id,
            "name":      self.name,
            "coordinate": {
                "latitude":  self.latitude,
                "longitude": self.longitude,
            },
            # Keep the same key the frontend already uses
            "type": self.type,
        }

    def __repr__(self) -> str:
        return f"<Location {self.id}: {self.name}>"


class SavedLocation(db.Model):
    __tablename__ = "saved_locations"

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    created_at  = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Prevent a user from saving the same location twice
    __table_args__ = (
        db.UniqueConstraint("user_id", "location_id", name="uq_user_location"),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    user     = db.relationship("User",     back_populates="saved_locations")
    location = db.relationship("Location", back_populates="saved_by")

    def to_dict(self) -> dict:
        return {
            "id":         self.id,
            "created_at": self.created_at.isoformat(),
            "location":   self.location.to_dict(),
        }

    def __repr__(self) -> str:
        return f"<SavedLocation user={self.user_id} location={self.location_id}>"
