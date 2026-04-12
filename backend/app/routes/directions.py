"""
Directions routes.

POST /api/directions   - compute route between two coordinates
"""
import logging
from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.services.directions_service import get_directions
from app.utils.validators import validate_lat, validate_lng
from app.utils.responses import success, error
from app import limiter

logger = logging.getLogger(__name__)

directions_bp = Blueprint("directions", __name__)


@directions_bp.post("/")
@directions_bp.post("")
@jwt_required()
@limiter.limit("60 per minute")
def directions():
    """
    Compute walking directions between two campus coordinates.

    Request body:
    {
        "origin": { "lat": 6.5244, "lng": 3.3792 },
        "destination": { "lat": 6.5280, "lng": 3.3810 },
        "points": 20           // optional, number of polyline points
    }

    Response:
    {
        "distance": "450 m",
        "distance_meters": 450.12,
        "duration": "6 mins",
        "duration_seconds": 321,
        "route": [
            { "lat": 6.5244, "lng": 3.3792 },
            ...
        ]
    }
    """
    data = request.get_json(silent=True) or {}

    origin_data = data.get("origin") or {}
    dest_data = data.get("destination") or {}

    errors = {}

    # Validate origin
    try:
        orig_lat = validate_lat(origin_data.get("lat"), "origin.lat")
    except (ValueError, TypeError) as e:
        errors["origin.lat"] = str(e)

    try:
        orig_lng = validate_lng(origin_data.get("lng"), "origin.lng")
    except (ValueError, TypeError) as e:
        errors["origin.lng"] = str(e)

    # Validate destination
    try:
        dest_lat = validate_lat(dest_data.get("lat"), "destination.lat")
    except (ValueError, TypeError) as e:
        errors["destination.lat"] = str(e)

    try:
        dest_lng = validate_lng(dest_data.get("lng"), "destination.lng")
    except (ValueError, TypeError) as e:
        errors["destination.lng"] = str(e)

    if errors:
        return error("Validation failed.", 422, errors)

    # Optional number of polyline points (10–100)
    num_points = data.get("points", 20)
    try:
        num_points = max(10, min(100, int(num_points)))
    except (TypeError, ValueError):
        num_points = 20

    try:
        result = get_directions(
            origin_lat=orig_lat,
            origin_lng=orig_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            num_points=num_points,
        )
    except ValueError as e:
        return error(str(e), 400)
    except Exception as e:
        logger.error("Directions error: %s", e, exc_info=True)
        return error("Could not compute directions.", 500)

    return success(result.to_dict(), "Directions computed.")
