from datetime import datetime, timezone
from app import db


class LocationType(db.Enum):
    pass


LOCATION_TYPES = (
    "Lecture Room",
    "Faculty",
    "Library",
    "Cafeteria",
    "Laboratory",
    "Administrative",
    "Sports Facility",
    "Hostel",
    "Clinic",
    "Parking",
    "Chapel",
    "Other",
)


class Location(db.Model):
    """A campus point-of-interest."""

    __tablename__ = "locations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    type = db.Column(
        db.Enum(*LOCATION_TYPES, name="location_type_enum"),
        nullable=False,
        default="Other",
    )
    building_code = db.Column(db.String(20), nullable=True)   # e.g. "ENG-A"
    floor = db.Column(db.Integer, nullable=True)              # null = outdoor
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        db.CheckConstraint("latitude BETWEEN -90 AND 90", name="ck_lat_range"),
        db.CheckConstraint("longitude BETWEEN -180 AND 180", name="ck_lng_range"),
    )

    def __repr__(self) -> str:
        return f"<Location id={self.id} name={self.name!r}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "type": self.type,
            "building_code": self.building_code,
            "floor": self.floor,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }
