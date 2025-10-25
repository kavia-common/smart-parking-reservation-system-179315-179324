Smart Parking Reservation System - Local Integration Guide

Overview
This document explains how to run the backend and frontend together locally, which environment variables are required, and how the key end-to-end flows work.

1) Environment variables
Backend (firebase_backend_functions/.env)
- See .env.example. Required at runtime:
  - PORT: default 3001
  - ALLOWED_ORIGIN: http://localhost:3000
  - FIREBASE_PROJECT_ID: your Firebase project id
  - One of:
    - FIREBASE_SERVICE_ACCOUNT_JSON: inline JSON string (recommended in CI)
    - GOOGLE_APPLICATION_CREDENTIALS: path to a service account key file
  - HMAC_SECRET: required for QR creation/verification
  - Optional Stripe (only if FEATURE_PAYMENTS_ENABLED=true):
    - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

Frontend (react_frontend_app/.env)
- See .env.example. Required at runtime:
  - REACT_APP_API_BASE: http://localhost:3001
  - REACT_APP_SITE_URL: http://localhost:3000
  - REACT_APP_FIREBASE_*: standard Firebase Web config values for your project

2) Start services
Backend:
- cd smart-parking-reservation-system-179315-179324/firebase_backend_functions
- cp .env.example .env and fill values
- npm install
- npm run dev (or npm start)
- Backend should listen on http://localhost:3001

Frontend:
- cd smart-parking-reservation-system-179315-179325/react_frontend_app
- cp .env.example .env and fill values
- npm install
- npm start
- Frontend runs at http://localhost:3000

3) CORS and base URLs
- Backend uses ALLOWED_ORIGIN to permit browser requests via CORS.
- Ensure ALLOWED_ORIGIN includes http://localhost:3000 (default CRA).
- Axios client in frontend uses REACT_APP_API_BASE for the base URL.

4) Firebase auth token propagation
- Frontend initializes Firebase using REACT_APP_FIREBASE_*.
- Axios interceptor attaches Authorization: Bearer <idToken> when user is signed in.
- Protected endpoints require this header. Example: /auth/me, /bookings, /analytics/summary.
- If requests fail with 401, confirm the user is signed in and a valid Firebase project is configured.

5) End-to-end flows to verify
- User login:
  - Use email/password or Google login. After login, navigator goes to /book.
  - Verify Authorization header is present on API calls (e.g., browser devtools).

- Fetch lots/slots:
  - Lots: GET /lots (no auth)
  - Slots: GET /lots/{lotId}/slots (no auth). The demo UI also shows a Firestore-based mock; hook can be adapted to call the backend.

- Reserve slot and QR payload:
  - Frontend calls POST /bookings/reserve with { lotId, slotId, startTime, endTime, price, currency }.
  - Backend returns booking with qrCode (HMAC token). Displayed as QR in UI.

- Check-in:
  - POST /bookings/check-in with { qrToken } (no auth required for gate scanner scenario).
  - Booking status switches to in_progress.

- Complete booking:
  - POST /bookings/{bookingId}/complete (requires auth). Status becomes completed.

- Booking history:
  - GET /bookings (auth required) with optional ?status=... to filter.

- Admin CRUD:
  - PUT /lots/{lotId} (auth + admin)
  - PATCH /lots/{lotId}/slots/{slotId}/availability (auth + admin)
  - GET /analytics/summary (auth + admin)

6) Common issues and remediation
- 401 Unauthorized:
  - Ensure frontend user is signed in and Axios interceptor attaches a token.
  - Verify Firebase Web config matches the same project as the backend service account.
- 403 Forbidden (admin only):
  - Grant admin in Firestore by calling POST /auth/assign-admin with admin user’s uid from an existing admin account, or prewrite {roles:['admin']} into users/{uid}.
- CORS error:
  - Set ALLOWED_ORIGIN to http://localhost:3000 in backend .env and restart backend.
- QR creation/verification error:
  - Ensure HMAC_SECRET is set in backend .env. Without it, reserve/check-in will fail.
- Payments disabled:
  - Set FEATURE_PAYMENTS_ENABLED=true and STRIPE_SECRET_KEY for payment flows. Update webhook secret if using Stripe webhooks.

7) Notes
- Swagger UI: http://localhost:3001/docs
- OpenAPI JSON: http://localhost:3001/openapi.json
- Firestore indexes and rules are provided under firebase_backend_functions.
