/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import { UserService } from '../services/user.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.util.js';
import { parsePaginationParams } from '../utils/pagination.util.js';
import { streamJsonArray } from '../utils/stream.util.js';

export class UserController {
  /**
   * GET /api/users
   * Get paginated list of users
   */
  static async getUsers(req, res, next) {
    try {
      const { cursor, limit } = parsePaginationParams(req.query);
      const { role, search } = req.query;
      
      const result = await UserService.getUsers({
        cursor,
        limit,
        role,
        search,
      });
      
      sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      sendSuccess(res, user);
    } catch (error) {
      next(error);
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
      next(error);
    }
  }
  
  /**
   * PUT /api/users/:id
   * Update user
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body);
      
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/users/:id
   * Delete user
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      
      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
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
      next(error);
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
      next(error);
    }
  }
}

export default UserController;
