const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const lotsRoutes = require('./lots');
const slotsRoutes = require('./slots');
const bookingsRoutes = require('./bookings');
const paymentsRoutes = require('./payments');
const analyticsRoutes = require('./analytics');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health checks
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/lots', lotsRoutes);
router.use('/lots/:lotId/slots', slotsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
