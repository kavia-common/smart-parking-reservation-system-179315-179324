'use strict';
const { db } = require('../config/firebase');

class LotsService {
  // PUBLIC_INTERFACE
  async listLots() {
    /** List all active lots. */
    const snapshot = await db.collection('lots').where('isActive', '==', true).get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // PUBLIC_INTERFACE
  async getLot(lotId) {
    /** Get single lot by ID. */
    const doc = await db.collection('lots').doc(lotId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // PUBLIC_INTERFACE
  async upsertLot(lotId, data) {
    /** Admin: create or update lot metadata. */
    const now = new Date();
    await db.collection('lots').doc(lotId).set({
      ...data,
      updatedAt: now,
      createdAt: data.createdAt || now,
    }, { merge: true });
    const doc = await db.collection('lots').doc(lotId).get();
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = new LotsService();
