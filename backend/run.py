"""
run.py – Application entry point.

Usage:
    python run.py                    # development server
    gunicorn "run:app" -w 4          # production (gunicorn)
"""
from app import create_app, db
from app.models.user import User        # noqa: F401 – needed for migrations
from app.models.location import Location  # noqa: F401

app = create_app()


@app.shell_context_processor
def make_shell_context():
    """Expose models in `flask shell`."""
    return {"db": db, "User": User, "Location": Location}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config.get("DEBUG", False))
