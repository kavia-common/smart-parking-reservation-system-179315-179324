'use strict';
const express = require('express');
const AnalyticsController = require('../controllers/analytics');
const { verifyFirebaseAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const controller = new AnalyticsController();

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Admin analytics endpoints.
 */

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Analytics summary
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Summary metrics }
 *       403: { description: Forbidden }
 */
router.get('/summary', verifyFirebaseAuth, requireAdmin, controller.summary.bind(controller));

module.exports = router;
