# Connect joshua_backend to native app

The goal is to seamlessly connect your React Native app (`native`) to your `joshua_backend`, ensuring that all authentication flows (Signup, OTP Verification, and Login) mirror the functionality defined in the original `backend`.

## User Review Required

> [!WARNING]
> **Database Modification**: To support OTP verification in `joshua_backend`, we will need to add two columns to your MySQL `users` table: `is_verified` (BOOLEAN) and `otp_code` (VARCHAR). I will execute a Python script to run an `ALTER TABLE` query. If your database already has these fields, let me know. 
> 
> **Email Delivery**: The original `backend` uses `flask-mail` to send real emails. `joshua_backend` doesn't have `flask-mail` installed. Do you want me to print the OTP in the backend console for local testing, or install `Flask-Mail` and configure actual email sending? I will default to **printing the OTP in the server console** for testing unless you advise otherwise.

## Proposed Changes

### `joshua_backend`

*   **Refactor to REST API**: Modify `app.py` so that endpoints expect and return JSON instead of rendering HTML forms. We will implement CORS so your frontend can communicate without issues.
*   **Match Endpoints**: 
    *   `POST /api/auth/signup`: Accepts JSON (`fullname`, `email`, `password`), creates an unverified user, generates a 6-digit OTP, and saves it.
    *   `POST /api/auth/verify-otp`: Accepts JSON (`email`, `otp`), checks the database, marks the user as verified if it matches.
    *   `POST /api/auth/login`: Accepts JSON (`email`, `password`), verifies credentials and the `is_verified` flag, and successfully logs the user in.
*   **Dependencies**: I'll add `flask-cors` to allow your native app (or web emulator) to hit the local server.

---

### `native`

*   **API Service (`api.ts`)**: Add `authSignup` and adjust endpoints to match `joshua_backend`.
*   **Sign-in Page (`signin.tsx`)**: 
    *   Implement the API connection for the Signup tab. On success, it will redirect to the Verify page, dynamically passing the user's email.
    *   Implement the API connection for the Signin tab. On success, it will redirect to `/home`.
    *   Add loading states and error handling with `Alert`.
*   **Verify Email Page (`verifyEmail.tsx`)**:
    *   Update it to grab the dynamically passed email from the Signup page instead of the hardcoded `johndoe@email.com`.

## Verification Plan

### Automated/Manual Verification
1.  **Signup Flow**: I'll enter a test user in the frontend. Ensure the backend receives it, creates the record, and prints an OTP.
2.  **Verify Flow**: Use the printed OTP in the frontend to verify the account successfully.
3.  **Login Flow**: Ensure the verified user can log in via the app and unverified users are rejected.
4.  **Database**: I will query the `users` table to confirm `is_verified` correctly toggles.
