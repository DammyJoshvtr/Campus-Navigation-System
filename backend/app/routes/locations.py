"""
app/routes/locations.py
-----------------------
Location blueprint.

Public endpoints (no auth):
  GET  /api/locations          — list all campus locations
  GET  /api/locations/<id>     — single location

Protected endpoints (JWT required):
  POST   /api/locations/save          — save a location for the current user
  GET    /api/locations/saved         — list current user's saved locations
  DELETE /api/locations/saved/<id>    — remove a saved location
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

from app import db
from app.models.location import Location, SavedLocation
from app.utils.responses import success_response, error_response

locations_bp = Blueprint("locations", __name__)


# ─── GET /api/locations ───────────────────────────────────────────────────────

@locations_bp.get("/")
def get_all_locations():
    """
    Return all campus locations.

    Optional query params:
      ?type=Faculty        — filter by type (case-insensitive)
      ?q=library           — search name (case-insensitive)
    """
    query = Location.query

    location_type = request.args.get("type")
    if location_type:
        query = query.filter(
            Location.type.ilike(location_type)
        )

    search = request.args.get("q")
    if search:
        query = query.filter(
            Location.name.ilike(f"%{search}%")
        )

    locations = query.order_by(Location.id).all()
    return success_response(
        f"{len(locations)} location(s) found.",
        [loc.to_dict() for loc in locations],
    )


# ─── GET /api/locations/<id> ──────────────────────────────────────────────────

@locations_bp.get("/<int:location_id>")
def get_location(location_id: int):
    """Return a single location by ID."""
    location = db.session.get(Location, location_id)
    if not location:
        return error_response("Location not found.", 404)
    return success_response("Location retrieved.", location.to_dict())


# ─── POST /api/locations/save ─────────────────────────────────────────────────

@locations_bp.post("/save")
@jwt_required()
def save_location():
    """
    Save a location to the current user's list.

    Body: { location_id: <int> }
    Returns 409 if already saved.
    """
    user_id = int(get_jwt_identity())
    data    = request.get_json(silent=True) or {}

    location_id = data.get("location_id")
    if not location_id or not isinstance(location_id, int):
        return error_response("location_id (integer) is required.", 422)

    location = db.session.get(Location, location_id)
    if not location:
        return error_response("Location not found.", 404)

    saved = SavedLocation(user_id=user_id, location_id=location_id)
    db.session.add(saved)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Location is already saved.", 409)

    return success_response("Location saved.", saved.to_dict(), 201)


# ─── GET /api/locations/saved ─────────────────────────────────────────────────

@locations_bp.get("/saved")
@jwt_required()
def get_saved_locations():
    """Return all locations the current user has saved."""
    user_id = int(get_jwt_identity())

    saved = (
        SavedLocation.query
        .filter_by(user_id=user_id)
        .order_by(SavedLocation.created_at.desc())
        .all()
    )

    return success_response(
        f"{len(saved)} saved location(s).",
        [s.to_dict() for s in saved],
    )


# ─── DELETE /api/locations/saved/<id> ────────────────────────────────────────

@locations_bp.delete("/saved/<int:saved_id>")
@jwt_required()
def delete_saved_location(saved_id: int):
    """
    Remove a saved location.

    The `saved_id` is the ID of the SavedLocation row, NOT the Location ID.
    Only the owner can delete their own saved entries.
    """
    user_id = int(get_jwt_identity())

    saved = db.session.get(SavedLocation, saved_id)

    if not saved:
        return error_response("Saved location not found.", 404)

    # Ownership check — prevent users from deleting each other's saves
    if saved.user_id != user_id:
        return error_response("Not authorised to delete this saved location.", 403)

    db.session.delete(saved)
    db.session.commit()

    return success_response("Saved location removed.")
