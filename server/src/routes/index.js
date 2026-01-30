/**
 * API Routes Index
 * Aggregates all route modules
 */

import { Router } from 'express';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Admin API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        health: '/health',
      },
    },
  });
});

export default router;
