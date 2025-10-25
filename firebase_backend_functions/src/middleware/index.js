'use strict';
const { verifyFirebaseAuth, requireAdmin } = require('./auth');

// Centralized middleware exports
module.exports = {
  verifyFirebaseAuth,
  requireAdmin,
};
