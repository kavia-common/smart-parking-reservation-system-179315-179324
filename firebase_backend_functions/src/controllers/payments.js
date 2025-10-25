'use strict';
const paymentsService = require('../services/payments');
const crypto = require('crypto');

class PaymentsController {
  // PUBLIC_INTERFACE
  async createIntent(req, res) {
    /** Create PaymentIntent for a booking if payments are enabled. */
    if (!paymentsService.isEnabled()) {
      return res.status(400).json({ error: 'payments_disabled' });
    }
    const { bookingId, amount, currency, customerEmail } = req.body || {};
    if (!bookingId || amount == null) {
      return res.status(400).json({ error: 'bookingId and amount required' });
    }
    try {
      const out = await paymentsService.createPaymentIntent({ bookingId, amount, currency, customerEmail });
      return res.json(out);
    } catch (e) {
      console.error('[payments] createIntent error', e);
      return res.status(500).json({ error: 'payment_intent_failed' });
    }
  }

  // PUBLIC_INTERFACE
  async webhook(req, res) {
    /**
     * Stripe webhook endpoint.
     * Uses STRIPE_WEBHOOK_SECRET (optional). If not provided, we will treat payload as already verified
     * which is fine for local dev but not recommended for production.
     */
    if (!paymentsService.isEnabled()) {
      return res.status(400).send('payments_disabled');
    }
    const { getStripe } = require('../utils/stripe');
    const stripe = getStripe();

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event = req.body;
    if (endpointSecret) {
      try {
        const raw = req.rawBody || req.bodyRaw || JSON.stringify(req.body);
        // For Express, we need raw body to verify signature. We'll compute from original buffer if provided by app.js
        // In this environment, fallback to manual if rawBody exists.
        const payload = typeof raw === 'string' ? raw : JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } catch (err) {
        console.error('[stripe] webhook signature verify failed', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    try {
      await paymentsService.handleStripeWebhook(event);
      return res.json({ received: true });
    } catch (e) {
      console.error('[stripe] webhook handle failed', e);
      return res.status(500).send('webhook_handle_failed');
    }
  }
}

module.exports = new PaymentsController();
