'use strict';
const express = require('express');
const SlotsController = require('../controllers/slots');
const { verifyFirebaseAuth, requireAdmin } = require('../middleware');

const router = express.Router({ mergeParams: true });
const controller = new SlotsController();

/**
 * @swagger
 * tags:
 *   - name: Slots
 *     description: Slots listing and admin operations.
 */

/**
 * @swagger
 * /lots/{lotId}/slots:
 *   get:
 *     summary: List slots for a lot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: isAvailable
 *         schema: { type: boolean }
 *       - in: query
 *         name: level
 *         schema: { oneOf: [ { type: string }, { type: number } ] }
 *     responses:
 *       200: { description: List of slots }
 */
router.get('/', controller.list.bind(controller));

/**
 * @swagger
 * /lots/{lotId}/slots/{slotId}/availability:
 *   patch:
 *     summary: Set slot availability (admin)
 *     tags: [Slots]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isAvailable]
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Forbidden }
 */
router.patch('/:slotId/availability', verifyFirebaseAuth, requireAdmin, controller.setAvailability.bind(controller));

module.exports = router;
