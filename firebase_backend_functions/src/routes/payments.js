'use strict';
const express = require('express');
const PaymentsController = require('../controllers/payments');
const { verifyFirebaseAuth } = require('../middleware');

const router = express.Router();
const controller = new PaymentsController();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment related endpoints (optional, Stripe).
 */

/**
 * @swagger
 * /payments/create-intent:
 *   post:
 *     summary: Create Stripe PaymentIntent for a booking
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, amount]
 *             properties:
 *               bookingId: { type: string }
 *               amount: { type: number }
 *               currency: { type: string, example: "usd" }
 *               customerEmail: { type: string }
 *     responses:
 *       200: { description: PaymentIntent info }
 *       400: { description: Disabled or bad input }
 */
router.post('/create-intent', verifyFirebaseAuth, controller.createIntent.bind(controller));

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook receiver
 *     tags: [Payments]
 *     responses:
 *       200: { description: Received }
 */
router.post('/webhook', express.raw({ type: 'application/json' }), controller.webhook.bind(controller));

module.exports = router;
