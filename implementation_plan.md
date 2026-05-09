# Admin Dashboard Implementation Plan

This document outlines the approach for building the web-based Admin Dashboard and integrating it with the existing Flask backend.

## User Review Required

> [!WARNING]
> The current mobile app might expect locations to come from `coordinates.json`. I will migrate these locations to a new `locations` database table and update the GET `/api/locations` endpoint to serve from the database instead. The JSON format returned will match the existing one exactly so the mobile app won't break, but I want to ensure you're okay with this migration.
> 
> Also, for admin authentication, since the existing app doesn't seem to use JWTs yet, I will add a simple token-based mechanism or check for an `admin_id` header in the requests made by the dashboard. Let me know if you prefer a full JWT implementation using `PyJWT`.

## Proposed Changes

### Backend (`joshua_backend`)

- **Database Migrations**
  - Create a script to add `role` (VARCHAR, default 'user') to the `users` table.
  - Create a script to add `approval_status` (VARCHAR, default 'pending') to the `events` table.
  - Create a script to create a `locations` table (id, name, type, latitude, longitude, image, description, approval_status) and migrate data from `coordinates.json`.
- **API Endpoints (`app.py`)**
  - **Auth**: Update `/api/auth/login` to return the user's role.
  - **Uploads**: Add `POST /api/upload` to handle image uploads and save them to `static/images/`.
  - **Locations**: Update `GET /api/locations` to fetch from the DB. Filter by `approval_status = 'approved'` unless an admin flag is provided. Add POST, PUT, DELETE endpoints for admin.
  - **Events**: Update `GET /api/events` to filter by `approval_status = 'approved'` unless an admin flag is provided. Add PUT, DELETE endpoints for admin.
  - **Users**: Add `GET /api/users` and `DELETE /api/users/<id>` for admin management.
  - **Approvals**: Add `PUT /api/admin/approve/<content_type>/<id>` to update `approval_status`.

### Frontend Admin Dashboard (`admin_dashboard`)

- **Initialization**
  - Initialize a new React project using Vite in `c:\dev\Campus-Navigation-System\admin_dashboard`.
  - Install and configure TailwindCSS, React Router, Axios, and Lucide Icons.
- **UI/UX Design**
  - Modern, responsive design with a sleek sidebar navigation.
  - Glassmorphism effects, modern typography (Inter), and subtle micro-animations for interactions.
- **Pages & Features**
  - **Login Page**: Secure entry point for admins.
  - **Dashboard Overview**: Key metrics (total users, events, locations) with cards.
  - **Manage Locations**: Data table with add/edit/delete functionality and image uploads.
  - **Manage Events**: Data table with add/edit/delete functionality.
  - **Manage Users**: List of users with verification status and delete option.
  - **Approvals**: Dedicated view to approve or reject pending locations and events.

## Verification Plan

### Automated/Manual Testing
- Run backend locally and verify database migrations execute successfully.
- Test all new CRUD API endpoints via the admin dashboard frontend.
- Verify image uploads save correctly to the `static/images/` directory and are accessible via URL.
- Run the admin dashboard and ensure responsive layout and dynamic states (loading, empty states) work perfectly.
- Ensure the JSON format for `GET /api/locations` matches the old `coordinates.json` format to prevent breaking the React Native app.
