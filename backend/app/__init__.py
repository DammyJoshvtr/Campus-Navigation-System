import logging
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import get_config

# ---------------------------------------------------------------------------
# Extension instances (initialised in create_app)
# ---------------------------------------------------------------------------
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)

# In-memory JWT blacklist (swap for Redis in production)
jwt_blacklist: set[str] = set()


def create_app(config_class=None) -> Flask:
    """Application factory."""
    app = Flask(__name__)

    # ── Config ──────────────────────────────────────────────────────────────
    cfg = config_class or get_config()
    app.config.from_object(cfg)

    # ── Logging ─────────────────────────────────────────────────────────────
    _configure_logging(app)

    # ── Extensions ──────────────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── JWT callbacks ────────────────────────────────────────────────────────
    _register_jwt_callbacks(app)

    # ── Blueprints ───────────────────────────────────────────────────────────
    _register_blueprints(app)

    # ── Global error handlers ────────────────────────────────────────────────
    _register_error_handlers(app)

    # ── Health check ─────────────────────────────────────────────────────────
    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "service": "Campus Navigation API"})

    app.logger.info("Campus Navigation API started.")
    return app


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _configure_logging(app: Flask) -> None:
    level = logging.DEBUG if app.config.get("DEBUG") else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    app.logger.setLevel(level)


def _register_jwt_callbacks(app: Flask) -> None:
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload["jti"] in jwt_blacklist

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token", "details": str(error)}), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization token required"}), 401


def _register_blueprints(app: Flask) -> None:
    from app.routes.auth import auth_bp
    from app.routes.locations import locations_bp
    from app.routes.directions import directions_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(locations_bp, url_prefix="/api/locations")
    app.register_blueprint(directions_bp, url_prefix="/api/directions")


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "details": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({"error": "Rate limit exceeded. Please slow down."}), 429

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Internal Server Error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
