'use strict';
const crypto = require('crypto');

/**
 * Utilities for HMAC-based QR token creation/validation.
 * Uses env var HMAC_SECRET. Do not hardcode secrets.
 */

// PUBLIC_INTERFACE
function createQrToken(payload) {
  /** Create a compact HMAC-SHA256 token for QR payload. */
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error('HMAC_SECRET env var is required to create QR tokens');
  }
  const json = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(json).digest('hex');
  // Format: base64(payload).hexsig
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  return `${b64}.${sig}`;
}

// PUBLIC_INTERFACE
function verifyQrToken(token) {
  /** Verify a compact HMAC-SHA256 token and return the payload if valid. */
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error('HMAC_SECRET env var is required to verify QR tokens');
  }
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, reason: 'invalid_format' };
  }
  const [b64, sig] = token.split('.');
  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const expected = crypto.createHmac('sha256', secret).update(json).digest('hex');
    const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!valid) {
      return { valid: false, reason: 'bad_signature' };
    }
    return { valid: true, payload: JSON.parse(json) };
  } catch (e) {
    return { valid: false, reason: 'decode_error' };
  }
}

module.exports = {
  createQrToken,
  verifyQrToken,
};
