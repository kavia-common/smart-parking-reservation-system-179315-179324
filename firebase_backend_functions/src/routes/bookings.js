'use strict';
const express = require('express');
const BookingsController = require('../controllers/bookings');
const { verifyFirebaseAuth } = require('../middleware');

const router = express.Router();
const controller = new BookingsController();

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Booking lifecycle endpoints.
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: List my bookings
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [confirmed, cancelled, completed, in_progress] }
 *     responses:
 *       200: { description: User bookings }
 */
router.get('/', verifyFirebaseAuth, controller.listMine.bind(controller));

/**
 * @swagger
 * /bookings/reserve:
 *   post:
 *     summary: Reserve a slot
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lotId, slotId, startTime, endTime, price]
 *             properties:
 *               lotId: { type: string }
 *               slotId: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               price: { type: number }
 *               currency: { type: string }
 *     responses:
 *       200: { description: Booking created }
 *       409: { description: Slot not available }
 */
router.post('/reserve', verifyFirebaseAuth, controller.reserve.bind(controller));

/**
 * @swagger
 * /bookings/{bookingId}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cancelled }
 */
router.delete('/:bookingId', verifyFirebaseAuth, controller.cancel.bind(controller));

/**
 * @swagger
 * /bookings/check-in:
 *   post:
 *     summary: Check-in with QR token
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken]
 *             properties:
 *               qrToken: { type: string, description: "QR HMAC token" }
 *     responses:
 *       200: { description: Checked in }
 */
router.post('/check-in', controller.checkIn.bind(controller));

/**
 * @swagger
 * /bookings/{bookingId}/complete:
 *   post:
 *     summary: Complete a booking
 *     tags: [Bookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Completed }
 */
router.post('/:bookingId/complete', verifyFirebaseAuth, controller.complete.bind(controller));

module.exports = router;
