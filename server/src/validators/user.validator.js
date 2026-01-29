/**
 * User Validation Schemas
 */

import { patterns } from '../middlewares/validation.middleware.js';

export const createUserSchema = {
  required: ['email', 'name', 'password'],
  fields: {
    email: {
      type: 'string',
      pattern: patterns.email,
      patternMessage: 'Invalid email format',
      maxLength: 255,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 128,
    },
    role: {
      type: 'string',
      enum: ['admin', 'user', 'moderator'],
    },
  },
};

export const updateUserSchema = {
  fields: {
    email: {
      type: 'string',
      pattern: patterns.email,
      patternMessage: 'Invalid email format',
      maxLength: 255,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
    role: {
      type: 'string',
      enum: ['admin', 'user', 'moderator'],
    },
    avatar: {
      type: 'string',
      maxLength: 500,
    },
  },
};

export const userIdParamSchema = {
  required: ['id'],
  fields: {
    id: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
};
