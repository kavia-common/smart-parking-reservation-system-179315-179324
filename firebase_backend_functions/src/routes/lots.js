'use strict';
const express = require('express');
const LotsController = require('../controllers/lots');
const { verifyFirebaseAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const controller = new LotsController();

/**
 * @swagger
 * tags:
 *   - name: Lots
 *     description: Parking lots management and listing.
 */

/**
 * @swagger
 * /lots:
 *   get:
 *     summary: List active lots
 *     tags: [Lots]
 *     responses:
 *       200:
 *         description: List of lots
 */
router.get('/', controller.list.bind(controller));

/**
 * @swagger
 * /lots/{lotId}:
 *   get:
 *     summary: Get a lot
 *     tags: [Lots]
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: Lot found }
 *       404: { description: Not found }
 */
router.get('/:lotId', controller.get.bind(controller));

/**
 * @swagger
 * /lots/{lotId}:
 *   put:
 *     summary: Create or update a lot (admin)
 *     tags: [Lots]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { schema: { type: object } }
 *     responses:
 *       200: { description: Saved }
 *       403: { description: Forbidden }
 */
router.put('/:lotId', verifyFirebaseAuth, requireAdmin, controller.upsert.bind(controller));

module.exports = router;
