'use strict';
const { auth, db } = require('../config/firebase');

/**
 * Authentication and authorization middleware using Firebase Admin.
 * Attaches req.user with { uid, email, roles }.
 */

// PUBLIC_INTERFACE
async function verifyFirebaseAuth(req, res, next) {
  /** Verify Firebase ID token from Authorization: Bearer <token>. */
  try {
    const header = req.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const idToken = header.substring('Bearer '.length).trim();
    const decoded = await auth.verifyIdToken(idToken, true);
    const uid = decoded.uid;

    // Fetch roles from /users/{uid}
    const userDoc = await db.collection('users').doc(uid).get();
    const roles = (userDoc.exists && Array.isArray(userDoc.data().roles)) ? userDoc.data().roles : ['user'];

    req.user = {
      uid,
      email: decoded.email || null,
      roles,
      decodedToken: decoded,
    };
    next();
  } catch (err) {
    console.error('[auth] verify failed', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// PUBLIC_INTERFACE
function requireAdmin(req, res, next) {
  /** Ensure req.user has admin role. */
  if (!req.user || !Array.isArray(req.user.roles) || !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  return next();
}

module.exports = {
  verifyFirebaseAuth,
  requireAdmin,
};
