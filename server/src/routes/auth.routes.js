/**
 * Auth Routes
 * Authentication endpoints
 */

import express from 'express';
import { login, logout, changePassword } from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// PUT /api/auth/change-password
router.put('/change-password', changePassword);

export default router;
