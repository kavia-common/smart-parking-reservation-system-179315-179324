'use strict';

/**
 * Stripe utility that lazily initializes Stripe when payments are enabled.
 * Controlled by:
 *  - FEATURE_PAYMENTS_ENABLED
 *  - STRIPE_SECRET_KEY
 */

// PUBLIC_INTERFACE
function getStripe() {
  /** Return Stripe instance if feature enabled; otherwise null. */
  const enabled = String(process.env.FEATURE_PAYMENTS_ENABLED || 'false').toLowerCase() === 'true';
  if (!enabled) return null;

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is required when FEATURE_PAYMENTS_ENABLED=true');
  }
  // Lazy require only when needed to avoid dependency during non-payment flows.
  // The version is controlled via package.json. Here we just instantiate.
  // eslint-disable-next-line global-require
  const Stripe = require('stripe');
  return new Stripe(secret, { apiVersion: '2024-06-20' });
}

module.exports = { getStripe };
