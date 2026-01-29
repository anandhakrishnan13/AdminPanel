/**
 * User Controller
 * Handles HTTP requests for user operations with MongoDB error handling
 */

import mongoose from 'mongoose';
import { UserService } from '../services/user.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.util.js';
import { parsePaginationParams } from '../utils/pagination.util.js';
import { streamJsonArray } from '../utils/stream.util.js';
import { createValidationError } from '../middlewares/error.middleware.js';

export class UserController {
  /**
   * Handle MongoDB duplicate key error
   * @private
   */
  static handleMongoError(error) {
    // MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      throw createValidationError([
        {
          field,
          message: `${field} '${value}' already exists`,
        },
      ]);
    }

    // MongoDB validation error
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));
      throw createValidationError(errors);
    }

    // MongoDB CastError (invalid ObjectId)
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      throw createValidationError([
        {
          field: error.path,
          message: `Invalid ${error.path} format`,
        },
      ]);
    }

    // Re-throw other errors
    throw error;
  }

  /**
   * GET /api/users
   * Get paginated list of users
   */
  static async getUsers(req, res, next) {
    try {
      const { cursor, limit } = parsePaginationParams(req.query);
      const { role, status, search, departmentId } = req.query;

      const result = await UserService.getUsers({
        cursor,
        limit,
        role,
        status,
        search,
        departmentId,
      });

      sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createValidationError([
          {
            field: 'id',
            message: 'Invalid user ID format',
          },
        ]);
      }

      const user = await UserService.getUserById(id);

      sendSuccess(res, user);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * POST /api/users
   * Create new user
   */
  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);

      sendSuccess(res, user, 201);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createValidationError([
          {
            field: 'id',
            message: 'Invalid user ID format',
          },
        ]);
      }

      const user = await UserService.updateUser(id, req.body);

      sendSuccess(res, user);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createValidationError([
          {
            field: 'id',
            message: 'Invalid user ID format',
          },
        ]);
      }

      await UserService.deleteUser(id);

      sendSuccess(res, { deleted: true });
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics
   */
  static async getUserStats(req, res, next) {
    try {
      const stats = await UserService.getUserStats();

      sendSuccess(res, stats);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * GET /api/users/export
   * Stream all users for export
   */
  static async exportUsers(req, res, next) {
    try {
      const userGenerator = UserService.streamUsers();

      await streamJsonArray(res, userGenerator);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * POST /api/users/bulk
   * Bulk create users
   */
  static async bulkCreateUsers(req, res, next) {
    try {
      const { users } = req.body;

      if (!Array.isArray(users)) {
        throw createValidationError([
          {
            field: 'users',
            message: 'Users must be an array',
          },
        ]);
      }

      const result = await UserService.bulkCreateUsers(users);

      sendSuccess(res, result, 201);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }

  /**
   * DELETE /api/users/bulk
   * Bulk delete users
   */
  static async bulkDeleteUsers(req, res, next) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        throw createValidationError([
          {
            field: 'ids',
            message: 'IDs must be an array',
          },
        ]);
      }

      const result = await UserService.bulkDeleteUsers(ids);

      sendSuccess(res, result);
    } catch (error) {
      try {
        this.handleMongoError(error);
      } catch (handledError) {
        next(handledError);
      }
    }
  }
}

export default UserController;
