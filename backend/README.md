# 🗺️ Campus Navigation System — Backend API

A production-ready Flask REST API for navigating a university campus. Includes JWT authentication, email verification, location management, and a walking-directions engine built on the Haversine formula.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Directions Algorithm](#directions-algorithm)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flask 3.x |
| ORM | SQLAlchemy + Flask-Migrate |
| Database | PostgreSQL (MySQL supported) |
| Auth | JWT (Flask-JWT-Extended) + bcrypt |
| Email | Flask-Mail |
| CORS | Flask-Cors |
| Rate Limiting | Flask-Limiter |
| Testing | pytest + pytest-flask |
| Production | Gunicorn |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory, extension init, error handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   └── location.py      # Location model
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # /api/auth/*
│   │   ├── locations.py     # /api/locations/*
│   │   └── directions.py    # /api/directions
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py        # Registration, login, email verification
│   │   └── directions_service.py  # Haversine + polyline generation
│   └── utils/
│       ├── __init__.py
│       ├── validators.py    # Input validation helpers
│       └── responses.py     # Standardised JSON response helpers
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_locations.py
│   └── test_directions.py
├── config.py                # Development / Production / Testing configs
├── run.py                   # Entry point
├── seed.py                  # Sample campus data seeder
├── requirements.txt
├── .env.example
└── Campus_Navigation_API.postman_collection.json
```

---

## Quick Start

### 1. Clone and create virtual environment

```bash
git clone <repo-url>
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database URL, email credentials, and secrets
```

### 3. Set up the database

```bash
# Create the database first (PostgreSQL example):
createdb campus_nav_db

# Run migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 4. Seed sample campus locations

```bash
python seed.py
```

### 5. Start the development server

```bash
python run.py
# Server runs at http://localhost:5000
```

### 6. Verify it's working

```bash
curl http://localhost:5000/health
# → {"status": "ok", "service": "Campus Navigation API"}
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `FLASK_ENV` | `development` / `production` | `development` |
| `SECRET_KEY` | Flask secret key | *(required)* |
| `DATABASE_URL` | SQLAlchemy database URI | *(required)* |
| `JWT_SECRET_KEY` | JWT signing secret | *(required)* |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token TTL (seconds) | `3600` |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token TTL (seconds) | `2592000` |
| `MAIL_SERVER` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USE_TLS` | Enable TLS | `True` |
| `MAIL_USERNAME` | SMTP username | *(required)* |
| `MAIL_PASSWORD` | SMTP password / app password | *(required)* |
| `FRONTEND_URL` | Base URL for email links | `http://localhost:3000` |

---

## API Reference

All API responses follow this envelope format:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

Errors include an optional `"details"` object with field-level validation messages.

---

### Auth Endpoints

#### `POST /api/auth/signup`

Register a new user.

**Request:**
```json
{
  "name": "Ada Obi",
  "email": "ada@university.edu",
  "password": "Secure123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created. Please check your email to verify your account.",
  "data": {
    "id": 1,
    "name": "Ada Obi",
    "email": "ada@university.edu",
    "is_verified": false,
    "created_at": "2024-07-15T10:00:00+00:00"
  }
}
```

---

#### `POST /api/auth/login`

Authenticate and receive JWT tokens.

**Request:**
```json
{
  "email": "ada@university.edu",
  "password": "Secure123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "user": { "id": 1, "name": "Ada Obi", "email": "ada@university.edu" }
  }
}
```

---

#### `GET /api/auth/verify/<token>`

Verify email address (link sent by email).

**Response `200`:** Account activated.

---

#### `GET /api/auth/me` *(protected)*

Return the authenticated user's profile.

---

#### `POST /api/auth/refresh` *(requires refresh token)*

Issue a new access token.

---

#### `POST /api/auth/logout` *(protected)*

Revoke the current access token (adds JTI to blacklist).

---

### Location Endpoints

All location endpoints require a valid `Authorization: Bearer <token>` header except `GET /types`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/locations` | List locations (paginated, filterable by `type`) |
| `GET` | `/api/locations/search?q=<term>` | Search by name |
| `GET` | `/api/locations/<id>` | Get single location |
| `GET` | `/api/locations/types` | List valid location types |
| `POST` | `/api/locations` | Create a location |
| `PUT` | `/api/locations/<id>` | Update a location |
| `DELETE` | `/api/locations/<id>` | Soft-delete a location |

**Create location body:**
```json
{
  "name": "Innovation Hub",
  "description": "Co-working space for student startups.",
  "latitude": 6.5263,
  "longitude": 3.3815,
  "type": "Faculty",
  "building_code": "INN-01",
  "floor": 2
}
```

**Valid location types:**
`Lecture Room`, `Faculty`, `Library`, `Cafeteria`, `Laboratory`, `Administrative`, `Sports Facility`, `Hostel`, `Clinic`, `Parking`, `Chapel`, `Other`

---

### Directions Endpoint

#### `POST /api/directions` *(protected)*

Compute a walking route between two coordinates.

**Request:**
```json
{
  "origin":      { "lat": 6.5244, "lng": 3.3792 },
  "destination": { "lat": 6.5280, "lng": 3.3810 },
  "points": 20
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "distance": "450 m",
    "distance_meters": 449.87,
    "duration": "6 mins",
    "duration_seconds": 321,
    "route": [
      { "lat": 6.5244, "lng": 3.3792 },
      { "lat": 6.5248, "lng": 3.3792 },
      { "lat": 6.5252, "lng": 3.3792 },
      { "lat": 6.5256, "lng": 3.3798 },
      { "lat": 6.5260, "lng": 3.3804 },
      { "lat": 6.5264, "lng": 3.3807 },
      { "lat": 6.5268, "lng": 3.3808 },
      { "lat": 6.5274, "lng": 3.3809 },
      { "lat": 6.5280, "lng": 3.3810 }
    ]
  }
}
```

---

## Directions Algorithm

The directions service is implemented in `app/services/directions_service.py`.

### Haversine Distance

```
a = sin²(Δlat/2) + cos(lat₁)·cos(lat₂)·sin²(Δlng/2)
c = 2·arcsin(√a)
d = R·c          where R = 6,371,000 m
```

### Polyline Generation

For distances **< 50 m**: linear interpolation along the great circle.

For distances **≥ 50 m**: an **L-shaped path** is generated via an intermediate waypoint at `(origin.lat, destination.lng)`. This simulates realistic campus walking patterns (horizontal corridor → vertical corridor) rather than cutting diagonally across lawns or buildings.

### Walking Speed

Duration is estimated at **1.4 m/s** (standard pedestrian speed). This constant is easily overridden via the `WALKING_SPEED_MS` variable in the service.

---

## Testing

```bash
# Install test dependencies (included in requirements.txt)
pip install pytest pytest-flask pytest-mock

# Run all tests
pytest tests/ -v

# Run with coverage
pip install pytest-cov
pytest tests/ --cov=app --cov-report=term-missing
```

---

## Deployment

### Gunicorn (Production)

```bash
FLASK_ENV=production gunicorn "run:app" \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "run:app", "--workers", "4", "--bind", "0.0.0.0:8000"]
```

### Checklist before going live

- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Switch `DATABASE_URL` to production PostgreSQL instance
- [ ] Configure real SMTP credentials for Flask-Mail
- [ ] Replace in-memory JWT blacklist with Redis (`RATELIMIT_STORAGE_URL=redis://...`)
- [ ] Run `flask db upgrade` on the production database
- [ ] Set `FLASK_ENV=production`
