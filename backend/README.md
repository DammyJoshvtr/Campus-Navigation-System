# Campus Navigation API

Flask REST API for the Campus Navigation System.

---

## Project Structure

```
campus-api/
├── app/
│   ├── __init__.py          # App factory + extension init
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model (email/password + Google)
│   │   └── location.py      # Location + SavedLocation models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   └── locations.py     # /api/locations/* endpoints
│   ├── services/
│   │   ├── otp_service.py        # OTP generation + email
│   │   └── google_auth_service.py # Google token verification
│   └── utils/
│       ├── responses.py     # Standard JSON envelope
│       └── validators.py    # Input validation helpers
├── config.py                # Configuration classes
├── run.py                   # Entry point
├── seed.py                  # Seed 36 campus locations
├── requirements.txt
└── .env.example
```

---

## Setup

### 1. Clone and create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Random secret for signing JWTs |
| `MAIL_USERNAME` | Gmail address (or SMTP user) |
| `MAIL_PASSWORD` | Gmail App Password (not your real password) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |

**Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords.

### 3. Create the database

```bash
createdb campus_nav          # PostgreSQL CLI
```

### 4. Run migrations

```bash
flask --app run:app db init       # First time only — creates migrations/ folder
flask --app run:app db migrate -m "initial"
flask --app run:app db upgrade
```

### 5. Seed campus locations

```bash
python seed.py
# → Seed complete: 36 inserted, 0 already existed.
```

### 6. Start the server

```bash
python run.py
# → Running on http://0.0.0.0:5000
```

---

## API Reference

All responses follow this envelope:
```json
{ "success": true, "message": "...", "data": {} }
```

### Authentication

#### `POST /api/auth/signup`
```json
{
  "fullname": "Ade Okon",
  "email": "ade.okon@run.edu.ng",
  "password": "securepass123"
}
```
- Email must end with `@edu.ng`
- Sends a 6-digit OTP to the email
- User cannot log in until OTP is verified

#### `POST /api/auth/verify-otp`
```json
{ "email": "ade.okon@run.edu.ng", "otp": "483920" }
```
Returns JWT on success.

#### `POST /api/auth/resend-otp`
```json
{ "email": "ade.okon@run.edu.ng" }
```

#### `POST /api/auth/login`
```json
{ "email": "ade.okon@run.edu.ng", "password": "securepass123" }
```
Returns JWT on success.

#### `POST /api/auth/google-login`
```json
{ "id_token": "<Google ID token from frontend>" }
```
- Frontend completes Google OAuth and sends the `id_token`
- Email must end with `@edu.ng`
- No OTP step — Google has already verified the email

#### `GET /api/auth/me`
Headers: `Authorization: Bearer <token>`

---

### Locations

#### `GET /api/locations/`
Returns all 36 campus locations.

Optional filters:
- `?type=Faculty` — filter by type
- `?q=library` — search by name

#### `GET /api/locations/<id>`
Single location.

#### `POST /api/locations/save` 🔒
```json
{ "location_id": 18 }
```

#### `GET /api/locations/saved` 🔒
Returns current user's saved locations.

#### `DELETE /api/locations/saved/<saved_id>` 🔒
`saved_id` is the ID of the saved entry, not the location.

🔒 = Requires `Authorization: Bearer <token>` header.

---

## Frontend Integration

### Connecting to the API (React Native)

```ts
// services/api.ts
const BASE_URL = "http://192.168.x.x:5000/api"; // use your machine's LAN IP

export async function apiFetch(path: string, options?: RequestInit, token?: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  return res.json();
}
```

### Replace the static locations fetch

Your `getLocation.ts` currently fetches from `http://192.168.x.x:3000/locations`.
Change the URL to:
```
http://192.168.x.x:5000/api/locations/
```
The response shape is identical — each location has `id`, `name`, `coordinate`, and `type`.

---

## Google OAuth — Frontend Setup

Install `expo-auth-session`:
```bash
npx expo install expo-auth-session expo-web-browser
```

After the user completes Google sign-in, send the `id_token` to your API:
```ts
const { authentication } = await promptAsync();
if (authentication?.idToken) {
  const res = await apiFetch("/auth/google-login", {
    method: "POST",
    body: JSON.stringify({ id_token: authentication.idToken }),
  });
}
```

---

## Production Deployment

```bash
gunicorn "run:app" \
  --workers 4 \
  --bind 0.0.0.0:5000 \
  --access-logfile - \
  --error-logfile -
```

Set `FLASK_ENV=production` in your environment.
