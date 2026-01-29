/**
 * API Routes Index
 * Aggregates all route modules
 */

import { Router } from 'express';
import userRoutes from './user.routes.js';

const router = Router();

// Mount route modules
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Admin API',
      version: '1.0.0',
      endpoints: {
        users: '/api/users',
        health: '/health',
      },
    },
  });
});

export default router;
