'use strict';
const express = require('express');
const AuthController = require('../controllers/auth');
const { verifyFirebaseAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const controller = new AuthController();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization endpoints.
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 */
router.get('/me', verifyFirebaseAuth, controller.me.bind(controller));

/**
 * @swagger
 * /auth/assign-admin:
 *   post:
 *     summary: Assign admin role to a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Firebase Auth UID to grant admin role
 *     responses:
 *       200:
 *         description: Role assigned
 *       403:
 *         description: Forbidden
 */
router.post('/assign-admin', verifyFirebaseAuth, requireAdmin, controller.assignAdmin.bind(controller));

module.exports = router;
