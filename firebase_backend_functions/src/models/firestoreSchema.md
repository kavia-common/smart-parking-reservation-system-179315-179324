# Firestore Schema (Smart Parking Reservation System)

This document describes the Firestore collections, recommended fields, and composite indexes used by the backend. The backend uses the Firebase Admin SDK and enforces all business logic server-side. The client may optionally read public data (e.g., lots and slots availability) according to `firestore.rules`.

## Collections Overview

- lots (top-level)
  - slots (subcollection)
- bookings (top-level)
- users (top-level)
- admin (top-level; restricted)
  - analytics (subcollections as needed)
  - configurations

## lots

Represents a parking lot location and metadata.

Fields:
- id: string (document ID)
- name: string
- address: string
- geo: { lat: number, lng: number }
- totalSlots: number
- availableSlots: number
- amenities: string[] (e.g., ["EV", "Covered"])
- pricing: {
    baseRatePerHour: number,
    currency: string
  }
- createdAt: Timestamp
- updatedAt: Timestamp
- isActive: boolean

### lots/{lotId}/slots (subcollection)

Represents individual slots inside a lot.

Fields:
- id: string (document ID)
- lotId: string (duplicated for easier queries; equals parent lotId)
- label: string (e.g., "A12")
- level: string | number
- isAvailable: boolean
- lastStatusChangeAt: Timestamp
- features: string[] (e.g., ["EV", "Accessible"])

Indexes:
- Composite: lotId + isAvailable
- Composite: lotId + level + isAvailable

## bookings

Represents a user's booking for a slot.

Fields:
- id: string (document ID)
- userId: string (Auth UID)
- lotId: string
- slotId: string
- status: string (e.g., "pending", "confirmed", "cancelled", "completed")
- startTime: Timestamp
- endTime: Timestamp
- totalPrice: number
- currency: string
- qrCode: string (optional; may store URL or content string)
- payment: {
    provider: "stripe" | null,
    clientSecret: string | null,
    paymentIntentId: string | null,
    status: "requires_payment_method" | "succeeded" | "canceled" | "processing" | null
  }
- metadata: object (optional)
- createdAt: Timestamp
- updatedAt: Timestamp

Indexes:
- Composite: userId + status + startTime (descending)
- Composite: lotId + slotId + startTime

## users

User profile and preferences.

Fields:
- id: string (document ID; equals Auth UID)
- displayName: string
- email: string
- phone: string (optional)
- roles: string[] (e.g., ["user"], ["admin"])
- preferences: {
    notifications: { email: boolean, sms: boolean, push: boolean }
  }
- createdAt: Timestamp
- updatedAt: Timestamp

## admin

Administrative data, restricted from client access.
- analytics: usage stats and aggregation results
- configurations: feature toggles, pricing overrides

## Security Rules Summary

- lots: public read, no client writes.
- slots: public read (optional), no client writes.
- bookings: user can read only their own bookings; no client writes (use backend API).
- users: user can read their own document; no client writes.
- admin: no client access.

See `firestore.rules` for exact details.

## Composite Indexes

The following indexes are defined in `firestore.indexes.json`:

- bookings: userId (asc), status (asc), startTime (desc)
- bookings: lotId (asc), slotId (asc), startTime (asc)
- slots: lotId (asc), isAvailable (asc)
- slots: lotId (asc), level (asc), isAvailable (asc)

Deploy these via Firebase CLI or project CI as needed.
