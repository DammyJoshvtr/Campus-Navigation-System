"""
run.py
------
Entry point for the Flask development server.
In production, use gunicorn:  gunicorn "run:app" --workers 4 --bind 0.0.0.0:5000
"""

import os
from app import create_app

app = create_app(os.environ.get("FLASK_ENV", "development"))

if __name__ == "__main__":
    app.run(
        host  = "0.0.0.0",
        port  = int(os.environ.get("PORT", 5000)),
        debug = app.config.get("DEBUG", False),
    )
