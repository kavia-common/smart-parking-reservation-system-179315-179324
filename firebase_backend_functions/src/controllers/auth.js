'use strict';
const { db } = require('../config/firebase');

class AuthController {
  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Return current authenticated user profile from Firestore and token info. */
    const uid = req.user.uid;
    const doc = await db.collection('users').doc(uid).get();
    return res.json({
      uid,
      email: req.user.email,
      roles: req.user.roles,
      profile: doc.exists ? doc.data() : null,
    });
  }

  // PUBLIC_INTERFACE
  async assignAdmin(req, res) {
    /** Admin-only: assign admin role to a user by uid. */
    const { uid } = req.body || {};
    if (!uid) return res.status(400).json({ error: 'uid_required' });
    await db.collection('users').doc(uid).set({
      roles: ['admin'],
      updatedAt: new Date(),
    }, { merge: true });
    return res.json({ status: 'ok', uid, roles: ['admin'] });
  }
}

module.exports = new AuthController();
