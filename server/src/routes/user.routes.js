/**
 * User Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validate, sanitize } from '../middlewares/validation.middleware.js';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../validators/user.validator.js';

const router = Router();

// GET /api/users/stats - Must be before /:id to avoid conflict
router.get('/stats', UserController.getUserStats);

// GET /api/users/export - Stream all users
router.get('/export', UserController.exportUsers);

// GET /api/users - List users with pagination
router.get('/', UserController.getUsers);

// GET /api/users/:id - Get single user
router.get('/:id', 
  validate(userIdParamSchema, 'params'),
  UserController.getUserById
);

// POST /api/users - Create user
router.post('/', 
  sanitize(['email', 'name', 'password', 'role', 'avatar']),
  validate(createUserSchema, 'body'),
  UserController.createUser
);

// PUT /api/users/:id - Update user
router.put('/:id',
  validate(userIdParamSchema, 'params'),
  sanitize(['email', 'name', 'role', 'avatar']),
  validate(updateUserSchema, 'body'),
  UserController.updateUser
);

// DELETE /api/users/:id - Delete user
router.delete('/:id',
  validate(userIdParamSchema, 'params'),
  UserController.deleteUser
);

export default router;
