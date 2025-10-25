'use strict';
const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { createQrToken, verifyQrToken } = require('../utils/crypto');

class BookingsService {
  /**
   * Reserve a slot by creating a booking if available.
   * This is simplified logic; production systems may need stronger locking or transactions.
   */

  // PUBLIC_INTERFACE
  async reserve({ userId, lotId, slotId, startTime, endTime, price, currency }) {
    /** Reserve an available slot for a user and return booking with QR token. */
    const lotRef = db.collection('lots').doc(lotId);
    const slotRef = lotRef.collection('slots').doc(slotId);

    // Use transaction for atomic check+update
    const result = await db.runTransaction(async (tx) => {
      const slotDoc = await tx.get(slotRef);
      if (!slotDoc.exists) {
        throw new Error('slot_not_found');
      }
      const slot = slotDoc.data();
      if (slot.isAvailable === false) {
        throw new Error('slot_not_available');
      }

      // Mark slot unavailable
      tx.update(slotRef, { isAvailable: false, lastStatusChangeAt: new Date() });

      // Create booking
      const bookingRef = db.collection('bookings').doc();
      const now = new Date();
      const booking = {
        id: bookingRef.id,
        userId,
        lotId,
        slotId,
        status: 'confirmed',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalPrice: price,
        currency: currency || 'usd',
        qrCode: null,
        payment: {
          provider: null,
          clientSecret: null,
          paymentIntentId: null,
          status: null,
        },
        createdAt: now,
        updatedAt: now,
      };

      // Create QR HMAC token containing limited info
      const qrPayload = { b: bookingRef.id, u: userId, l: lotId, s: slotId, t: 'checkin' };
      const qrToken = createQrToken(qrPayload);
      booking.qrCode = qrToken;

      tx.set(bookingRef, booking);
      // Update lot availability counters if present
      tx.set(lotRef, { availableSlots: FieldValue.increment(-1) }, { merge: true });

      return booking;
    });

    return result;
  }

  // PUBLIC_INTERFACE
  async cancel({ userId, bookingId }) {
    /** Cancel a booking and free the slot. */
    const bookingRef = db.collection('bookings').doc(bookingId);
    const res = await db.runTransaction(async (tx) => {
      const bDoc = await tx.get(bookingRef);
      if (!bDoc.exists) throw new Error('booking_not_found');
      const booking = bDoc.data();
      if (booking.userId !== userId) throw new Error('forbidden');
      if (booking.status !== 'confirmed') throw new Error('cannot_cancel');

      const lotRef = db.collection('lots').doc(booking.lotId);
      const slotRef = lotRef.collection('slots').doc(booking.slotId);

      tx.update(bookingRef, { status: 'cancelled', updatedAt: new Date() });
      tx.update(slotRef, { isAvailable: true, lastStatusChangeAt: new Date() });
      tx.set(lotRef, { availableSlots: FieldValue.increment(1) }, { merge: true });

      return { ...booking, status: 'cancelled' };
    });
    return res;
  }

  // PUBLIC_INTERFACE
  async checkIn({ qrToken }) {
    /** Validate QR token for check-in and mark booking as in_progress. */
    const { valid, payload, reason } = verifyQrToken(qrToken);
    if (!valid) {
      throw new Error(`invalid_qr:${reason}`);
    }
    const bookingId = payload.b;
    const bookingRef = db.collection('bookings').doc(bookingId);

    const updated = await db.runTransaction(async (tx) => {
      const bDoc = await tx.get(bookingRef);
      if (!bDoc.exists) throw new Error('booking_not_found');
      const booking = bDoc.data();
      if (booking.status !== 'confirmed') throw new Error('cannot_checkin');

      tx.update(bookingRef, { status: 'in_progress', updatedAt: new Date() });
      return { ...booking, status: 'in_progress' };
    });
    return updated;
  }

  // PUBLIC_INTERFACE
  async complete({ bookingId }) {
    /** Mark booking as completed and release the slot. */
    const bookingRef = db.collection('bookings').doc(bookingId);
    const res = await db.runTransaction(async (tx) => {
      const bDoc = await tx.get(bookingRef);
      if (!bDoc.exists) throw new Error('booking_not_found');
      const booking = bDoc.data();
      if (booking.status !== 'in_progress') throw new Error('cannot_complete');

      const lotRef = db.collection('lots').doc(booking.lotId);
      const slotRef = lotRef.collection('slots').doc(booking.slotId);
      tx.update(bookingRef, { status: 'completed', updatedAt: new Date() });
      tx.update(slotRef, { isAvailable: true, lastStatusChangeAt: new Date() });
      tx.set(lotRef, { availableSlots: require('firebase-admin/firestore').FieldValue.increment(1) }, { merge: true });

      return { ...booking, status: 'completed' };
    });
    return res;
  }

  // PUBLIC_INTERFACE
  async listUserBookings({ userId, status, limit = 20 }) {
    /** Get recent bookings for user optionally filtered by status. */
    let q = db.collection('bookings').where('userId', '==', userId);
    if (status) q = q.where('status', '==', status);
    q = q.orderBy('startTime', 'desc').limit(limit);
    const snapshot = await q.get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

module.exports = new BookingsService();
