"""Standard JSON response helpers."""
from flask import jsonify


def success(data: dict | list, message: str = "Success", status: int = 200):
    body = {"success": True, "message": message, "data": data}
    return jsonify(body), status


def created(data: dict | list, message: str = "Created"):
    return success(data, message, 201)


def error(message: str, status: int = 400, details: dict | None = None):
    body = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status
