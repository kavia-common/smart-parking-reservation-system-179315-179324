# smart-parking-reservation-system-179315-179324

Backend API provides:
- Auth: /auth/me, /auth/assign-admin (admin)
- Lots: /lots (GET), /lots/{lotId} (GET, PUT admin)
- Slots: /lots/{lotId}/slots (GET), /lots/{lotId}/slots/{slotId}/availability (PATCH admin)
- Bookings: /bookings (GET), /bookings/reserve (POST), /bookings/{bookingId} (DELETE), /bookings/check-in (POST), /bookings/{bookingId}/complete (POST)
- Payments (optional): /payments/create-intent (POST), /payments/webhook (POST)
- Analytics (admin): /analytics/summary (GET)

Docs:
- Swagger UI: /docs
- OpenAPI JSON: /openapi.json

Environment variables: see firebase_backend_functions/.env.example
