"""
app/utils/responses.py
----------------------
All API responses use the same envelope:

  { "success": true|false, "message": "...", "data": {} }

Centralising this means we only change the format in one place.
"""

from flask import jsonify


def success_response(message: str, data: dict | list | None = None, status: int = 200):
    """Return a 2xx JSON response."""
    return jsonify({
        "success": True,
        "message": message,
        "data":    data or {},
    }), status


def error_response(message: str, status: int = 400, data: dict | None = None):
    """Return a 4xx/5xx JSON response."""
    return jsonify({
        "success": False,
        "message": message,
        "data":    data or {},
    }), status
