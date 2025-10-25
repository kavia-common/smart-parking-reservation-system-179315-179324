'use strict';
const { db } = require('../config/firebase');

class SlotsService {
  // PUBLIC_INTERFACE
  async listSlots(lotId, filter = {}) {
    /** List slots for a lot with optional isAvailable/level filter. */
    let q = db.collection('lots').doc(lotId).collection('slots');
    if (typeof filter.isAvailable === 'boolean') {
      q = q.where('isAvailable', '==', filter.isAvailable);
    }
    if (filter.level !== undefined) {
      q = q.where('level', '==', filter.level);
    }
    const snapshot = await q.get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // PUBLIC_INTERFACE
  async setAvailability(lotId, slotId, isAvailable) {
    /** Admin: set slot availability. */
    const ref = db.collection('lots').doc(lotId).collection('slots').doc(slotId);
    await ref.set({
      isAvailable,
      lotId,
      id: slotId,
      lastStatusChangeAt: new Date(),
    }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = new SlotsService();
