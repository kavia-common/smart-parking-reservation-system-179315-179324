'use strict';
const { db } = require('../config/firebase');

class AnalyticsService {
  // PUBLIC_INTERFACE
  async summary() {
    /** Return counts of lots, slots available, total bookings by status. */
    const lotsSnap = await db.collection('lots').get();
    const lots = lotsSnap.docs;

    let slotsTotal = 0;
    let slotsAvailable = 0;
    // Aggregate slots within each lot (simple summary; consider collection group for large data)
    for (const lot of lots) {
      const slotsSnap = await db.collection('lots').doc(lot.id).collection('slots').get();
      const slots = slotsSnap.docs.map(d => d.data());
      slotsTotal += slots.length;
      slotsAvailable += slots.filter(s => s.isAvailable === true).length;
    }

    // Bookings by status
    const statuses = ['confirmed', 'cancelled', 'completed', 'in_progress'];
    const bookingCounts = {};
    await Promise.all(statuses.map(async (st) => {
      const snap = await db.collection('bookings').where('status', '==', st).count().get();
      bookingCounts[st] = snap.data().count || 0;
    }));

    return {
      lots: lots.length,
      slotsTotal,
      slotsAvailable,
      bookings: bookingCounts,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AnalyticsService();
