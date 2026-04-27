"""
app/__init__.py
---------------
App factory.  Creates and configures the Flask application.
Using a factory (create_app) instead of a module-level app object
allows multiple instances (e.g. production vs test) and avoids
circular imports between extensions.
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from config import config_map

# ── Extension singletons (no app bound yet) ───────────────────────────────────
db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()
mail    = Mail()
bcrypt  = Bcrypt()


def create_app(config_name: str | None = None) -> Flask:
    """
    Create and return a configured Flask application.

    Parameters
    ----------
    config_name : str | None
        One of 'development', 'production', 'testing'.
        Falls back to FLASK_ENV environment variable, then 'development'.
    """
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # ── Initialise extensions ────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    bcrypt.init_app(app)

    # Allow all origins in development; tighten in production via env var
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Register blueprints ──────────────────────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.locations import locations_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(locations_bp, url_prefix="/api/locations")

    # ── JWT error handlers ───────────────────────────────────────────────────
    from app.utils.responses import error_response

    @jwt.unauthorized_loader
    def missing_token(reason):
        return error_response("Authentication token is missing.", 401)

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return error_response("Invalid authentication token.", 422)

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return error_response("Authentication token has expired.", 401)

    # ── Global 404 / 405 handlers ────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method not allowed.", 405)

    return app
