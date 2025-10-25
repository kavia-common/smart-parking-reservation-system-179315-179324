'use strict';
const bookingsService = require('../services/bookings');

class BookingsController {
  // PUBLIC_INTERFACE
  async reserve(req, res) {
    /** Reserve a slot for the authenticated user. */
    const userId = req.user.uid;
    const { lotId, slotId, startTime, endTime, price, currency } = req.body || {};
    if (!lotId || !slotId || !startTime || !endTime || price == null) {
      return res.status(400).json({ error: 'lotId, slotId, startTime, endTime, price required' });
    }
    try {
      const booking = await bookingsService.reserve({ userId, lotId, slotId, startTime, endTime, price, currency });
      return res.json(booking);
    } catch (e) {
      if (e.message === 'slot_not_found') return res.status(404).json({ error: e.message });
      if (e.message === 'slot_not_available') return res.status(409).json({ error: e.message });
      console.error('[reserve] error', e);
      return res.status(500).json({ error: 'reserve_failed' });
    }
  }

  // PUBLIC_INTERFACE
  async cancel(req, res) {
    /** Cancel user's booking. */
    const userId = req.user.uid;
    const { bookingId } = req.params;
    try {
      const b = await bookingsService.cancel({ userId, bookingId });
      return res.json(b);
    } catch (e) {
      const map = { booking_not_found: 404, forbidden: 403, cannot_cancel: 400 };
      const code = map[e.message] || 500;
      return res.status(code).json({ error: e.message });
    }
  }

  // PUBLIC_INTERFACE
  async checkIn(req, res) {
    /** Validate QR and set status to in_progress. */
    const { qrToken } = req.body || {};
    if (!qrToken) return res.status(400).json({ error: 'qrToken required' });
    try {
      const b = await bookingsService.checkIn({ qrToken });
      return res.json(b);
    } catch (e) {
      const code = e.message.startsWith('invalid_qr') ? 400 : 400;
      return res.status(code).json({ error: e.message });
    }
  }

  // PUBLIC_INTERFACE
  async complete(req, res) {
    /** Complete a booking. */
    const { bookingId } = req.params;
    try {
      const b = await bookingsService.complete({ bookingId });
      return res.json(b);
    } catch (e) {
      const map = { booking_not_found: 404, cannot_complete: 400 };
      const code = map[e.message] || 500;
      return res.status(code).json({ error: e.message });
    }
  }

  // PUBLIC_INTERFACE
  async listMine(req, res) {
    /** List current user's bookings. */
    const userId = req.user.uid;
    const { status, limit } = req.query;
    const items = await bookingsService.listUserBookings({ userId, status, limit: limit ? Number(limit) : 20 });
    return res.json(items);
  }
}

module.exports = new BookingsController();
