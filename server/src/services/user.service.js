/**
 * User Service
 * Business logic layer for user operations
 */

import { UserModel } from '../models/user.model.js';
import { createNotFoundError, createValidationError } from '../middlewares/error.middleware.js';
import { createPaginationResult } from '../utils/pagination.util.js';

export class UserService {
  /**
   * Get paginated list of users
   * @param {object} options - Query options
   * @returns {Promise<object>}
   */
  static async getUsers(options = {}) {
    const { cursor, limit = 20, role, search } = options;
    
    // Fetch limit + 1 to check for more results
    const users = await UserModel.findAll({
      cursor,
      limit,
      role,
      search,
    });
    
    // Create pagination result
    const { data, pagination } = createPaginationResult(users, limit);
    
    // Return lean users (without passwords)
    return {
      data: data.map(user => UserModel.toLean(user)),
      pagination,
    };
  }
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  static async getUserById(id) {
    const user = await UserModel.findById(id);
    
    if (!user) {
      throw createNotFoundError('User');
    }
    
    return UserModel.toLean(user);
  }
  
  /**
   * Create new user
   * @param {object} data - User data
   * @returns {Promise<object>}
   */
  static async createUser(data) {
    // Check if email already exists
    const emailExists = await UserModel.emailExists(data.email);
    if (emailExists) {
      throw createValidationError([
        { field: 'email', message: 'Email already in use' }
      ]);
    }
    
    // Hash password (placeholder - use bcrypt in production)
    const hashedPassword = `hashed_${data.password}`;
    
    const user = await UserModel.create({
      ...data,
      password: hashedPassword,
    });
    
    return UserModel.toLean(user);
  }
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {object} data - Update data
   * @returns {Promise<object>}
   */
  static async updateUser(id, data) {
    // Check user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw createNotFoundError('User');
    }
    
    // Check email uniqueness if changing email
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await UserModel.emailExists(data.email, id);
      if (emailExists) {
        throw createValidationError([
          { field: 'email', message: 'Email already in use' }
        ]);
      }
    }
    
    // Don't allow password update through this method
    const { password, ...updateData } = data;
    
    const updatedUser = await UserModel.update(id, updateData);
    
    return UserModel.toLean(updatedUser);
  }
  
  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  static async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw createNotFoundError('User');
    }
    
    await UserModel.delete(id);
    return true;
  }
  
  /**
   * Get user statistics
   * @returns {Promise<object>}
   */
  static async getUserStats() {
    const [totalUsers, adminCount, userCount, moderatorCount] = await Promise.all([
      UserModel.count(),
      UserModel.count({ role: 'admin' }),
      UserModel.count({ role: 'user' }),
      UserModel.count({ role: 'moderator' }),
    ]);
    
    return {
      total: totalUsers,
      byRole: {
        admin: adminCount,
        user: userCount,
        moderator: moderatorCount,
      },
    };
  }
  
  /**
   * Stream all users (for export)
   * Generator function for streaming large datasets
   */
  static async *streamUsers() {
    const users = await UserModel.findAll({ limit: 1000 });
    
    for (const user of users) {
      yield UserModel.toLean(user);
    }
  }
}

export default UserService;
