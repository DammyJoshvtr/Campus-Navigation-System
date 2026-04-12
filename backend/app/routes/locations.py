"""
Location routes.

GET  /api/locations              - list all locations (protected)
GET  /api/locations/<id>         - get a single location (protected)
POST /api/locations              - create a location (protected)
PUT  /api/locations/<id>         - update a location (protected)
DELETE /api/locations/<id>       - soft-delete a location (protected)
GET  /api/locations/search       - full-text search (protected)
GET  /api/locations/types        - list valid location types
"""
import logging
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app import db
from app.models.location import Location, LOCATION_TYPES
from app.utils.validators import validate_lat, validate_lng
from app.utils.responses import success, created, error

logger = logging.getLogger(__name__)

locations_bp = Blueprint("locations", __name__)


# ---------------------------------------------------------------------------
# GET /api/locations/types  (no auth – useful for signup forms)
# ---------------------------------------------------------------------------

@locations_bp.get("/types")
def get_types():
    return success(list(LOCATION_TYPES), "Location types retrieved.")


# ---------------------------------------------------------------------------
# GET /api/locations
# ---------------------------------------------------------------------------

@locations_bp.get("/")
@locations_bp.get("")
@jwt_required()
def list_locations():
    """
    List all active locations with optional filters.

    Query params:
        type        – filter by location type
        page        – page number (default 1)
        per_page    – results per page (default 20, max 100)
    """
    location_type = request.args.get("type")
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(100, max(1, request.args.get("per_page", 20, type=int)))

    query = Location.query.filter_by(is_active=True)
    if location_type:
        if location_type not in LOCATION_TYPES:
            return error(f"Invalid type. Valid types: {', '.join(LOCATION_TYPES)}", 400)
        query = query.filter_by(type=location_type)

    query = query.order_by(Location.name)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success(
        {
            "locations": [loc.to_dict() for loc in pagination.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        },
        "Locations retrieved.",
    )


# ---------------------------------------------------------------------------
# GET /api/locations/search
# ---------------------------------------------------------------------------

@locations_bp.get("/search")
@jwt_required()
def search_locations():
    """Search locations by name (case-insensitive substring match)."""
    q = request.args.get("q", "").strip()
    if not q:
        return error("Query parameter 'q' is required.", 400)
    if len(q) < 2:
        return error("Query must be at least 2 characters.", 400)

    results = (
        Location.query
        .filter(Location.is_active.is_(True))
        .filter(Location.name.ilike(f"%{q}%"))
        .order_by(Location.name)
        .limit(50)
        .all()
    )

    return success(
        {"locations": [loc.to_dict() for loc in results], "count": len(results)},
        f"{len(results)} location(s) found.",
    )


# ---------------------------------------------------------------------------
# GET /api/locations/<id>
# ---------------------------------------------------------------------------

@locations_bp.get("/<int:location_id>")
@jwt_required()
def get_location(location_id: int):
    loc = Location.query.filter_by(id=location_id, is_active=True).first()
    if not loc:
        return error("Location not found.", 404)
    return success(loc.to_dict())


# ---------------------------------------------------------------------------
# POST /api/locations
# ---------------------------------------------------------------------------

@locations_bp.post("/")
@locations_bp.post("")
@jwt_required()
def create_location():
    """Create a new campus location."""
    data = request.get_json(silent=True) or {}

    errors = {}
    name = data.get("name", "").strip()
    if not name:
        errors["name"] = "Name is required."
    elif len(name) > 200:
        errors["name"] = "Name must be at most 200 characters."

    loc_type = data.get("type", "Other")
    if loc_type not in LOCATION_TYPES:
        errors["type"] = f"Invalid type. Valid: {', '.join(LOCATION_TYPES)}"

    try:
        lat = validate_lat(data.get("latitude"))
    except (ValueError, TypeError) as e:
        errors["latitude"] = str(e)

    try:
        lng = validate_lng(data.get("longitude"))
    except (ValueError, TypeError) as e:
        errors["longitude"] = str(e)

    if errors:
        return error("Validation failed.", 422, errors)

    loc = Location(
        name=name,
        description=data.get("description"),
        latitude=lat,
        longitude=lng,
        type=loc_type,
        building_code=data.get("building_code"),
        floor=data.get("floor"),
    )
    db.session.add(loc)
    db.session.commit()

    return created(loc.to_dict(), "Location created.")


# ---------------------------------------------------------------------------
# PUT /api/locations/<id>
# ---------------------------------------------------------------------------

@locations_bp.put("/<int:location_id>")
@jwt_required()
def update_location(location_id: int):
    """Update an existing location."""
    loc = Location.query.filter_by(id=location_id, is_active=True).first()
    if not loc:
        return error("Location not found.", 404)

    data = request.get_json(silent=True) or {}
    errors = {}

    if "name" in data:
        name = data["name"].strip()
        if not name:
            errors["name"] = "Name cannot be empty."
        elif len(name) > 200:
            errors["name"] = "Name too long."
        else:
            loc.name = name

    if "description" in data:
        loc.description = data["description"]

    if "type" in data:
        if data["type"] not in LOCATION_TYPES:
            errors["type"] = f"Invalid type."
        else:
            loc.type = data["type"]

    if "latitude" in data:
        try:
            loc.latitude = validate_lat(data["latitude"])
        except ValueError as e:
            errors["latitude"] = str(e)

    if "longitude" in data:
        try:
            loc.longitude = validate_lng(data["longitude"])
        except ValueError as e:
            errors["longitude"] = str(e)

    if "building_code" in data:
        loc.building_code = data["building_code"]

    if "floor" in data:
        loc.floor = data["floor"]

    if errors:
        return error("Validation failed.", 422, errors)

    db.session.commit()
    return success(loc.to_dict(), "Location updated.")


# ---------------------------------------------------------------------------
# DELETE /api/locations/<id>  (soft delete)
# ---------------------------------------------------------------------------

@locations_bp.delete("/<int:location_id>")
@jwt_required()
def delete_location(location_id: int):
    loc = Location.query.filter_by(id=location_id, is_active=True).first()
    if not loc:
        return error("Location not found.", 404)

    loc.is_active = False
    db.session.commit()
    return success({}, "Location deleted.")
