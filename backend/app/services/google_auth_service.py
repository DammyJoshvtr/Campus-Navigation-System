"""
app/services/google_auth_service.py
------------------------------------
Verifies a Google ID token sent from the frontend (after the user completes
the Google OAuth flow client-side).

Flow on the frontend:
  1. User taps "Sign in with Google"
  2. Google returns an id_token (JWT)
  3. Frontend sends that id_token to POST /api/auth/google-login
  4. We verify it here using Google's public keys (google-auth library)
  5. We extract email, name and check the domain

This approach (verify on server, not proxy Google's OAuth) is correct for
mobile apps where there is no server-side redirect URI.
"""

import logging
from flask import current_app
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)

# google-auth caches Google's public keys internally — no manual caching needed.
_http_request = google_requests.Request()


def verify_google_token(token: str) -> dict | None:
    """
    Verify a Google ID token and return the payload dict, or None on failure.

    Returned dict contains at minimum:
      - email       (str)
      - name        (str)
      - email_verified (bool)
      - sub         (str)  — Google user ID
    """
    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not client_id:
        logger.error("GOOGLE_CLIENT_ID is not configured.")
        return None

    try:
        payload = id_token.verify_oauth2_token(
            token,
            _http_request,
            client_id,
        )
        return payload
    except ValueError as exc:
        # Token is expired, has wrong audience, or is otherwise invalid
        logger.warning("Google token verification failed: %s", exc)
        return None
    except Exception as exc:
        logger.error("Unexpected error verifying Google token: %s", exc)
        return None
