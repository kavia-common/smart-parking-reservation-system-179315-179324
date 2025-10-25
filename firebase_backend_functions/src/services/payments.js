'use strict';
const { db } = require('../config/firebase');
const { getStripe } = require('../utils/stripe');

class PaymentsService {
  // PUBLIC_INTERFACE
  isEnabled() {
    /** Return boolean if payments feature is enabled. */
    return String(process.env.FEATURE_PAYMENTS_ENABLED || 'false').toLowerCase() === 'true';
  }

  // PUBLIC_INTERFACE
  async createPaymentIntent({ bookingId, amount, currency = 'usd', customerEmail }) {
    /** Create a Stripe PaymentIntent for a booking and store data on booking. */
    const stripe = getStripe(); // may throw when misconfigured
    if (!stripe) {
      throw new Error('payments_disabled');
    }
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bDoc = await bookingRef.get();
    if (!bDoc.exists) throw new Error('booking_not_found');
    const booking = bDoc.data();

    if (booking.payment && booking.payment.status === 'succeeded') {
      return { clientSecret: booking.payment.clientSecret, paymentIntentId: booking.payment.paymentIntentId };
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      receipt_email: customerEmail || booking.email || undefined,
      metadata: { bookingId },
      automatic_payment_methods: { enabled: true },
    });

    await bookingRef.set({
      payment: {
        provider: 'stripe',
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        status: intent.status || 'requires_payment_method',
      },
      updatedAt: new Date(),
    }, { merge: true });

    return { clientSecret: intent.client_secret, paymentIntentId: intent.id, status: intent.status };
  }

  // PUBLIC_INTERFACE
  async handleStripeWebhook(event) {
    /** Handle a payment_intent.succeeded/canceled etc and update booking. Event object is already verified by route. */
    const stripeObject = event.data && event.data.object;
    if (!stripeObject || !stripeObject.metadata || !stripeObject.metadata.bookingId) {
      return;
    }
    const bookingId = stripeObject.metadata.bookingId;
    const bookingRef = db.collection('bookings').doc(bookingId);
    const updates = {
      updatedAt: new Date(),
      payment: {
        provider: 'stripe',
        clientSecret: stripeObject.client_secret || null,
        paymentIntentId: stripeObject.id,
        status: stripeObject.status || event.type,
      },
    };
    await bookingRef.set(updates, { merge: true });
  }
}

module.exports = new PaymentsService();
