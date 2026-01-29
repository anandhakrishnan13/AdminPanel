/**
 * User Service
 * Business logic and data access for user operations
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, Role, Department } from '../models/schemas/user.schema.js';
import { createNotFoundError, createValidationError } from '../middlewares/error.middleware.js';
import { createPaginationResult } from '../utils/pagination.util.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

export class UserService {
  /**
   * Hash password with bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>}
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get paginated list of users
   * @param {object} options - Query options
   * @returns {Promise<object>}
   */
  static async getUsers(options = {}) {
    const { cursor, limit = 20, role, status, search, departmentId } = options;

    // Build query
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { reportCode: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply cursor pagination
    if (cursor) {
      query._id = { $gt: cursor };
    }

    // Fetch limit + 1 to check for more
    const users = await User.find(query)
      .select('-password') // Exclude password
      .populate('roleId', 'name code level')
      .populate('departmentId', 'name code')
      .populate('reportingManagerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean(); // Convert to plain JavaScript object

    // Create pagination result
    const { data, pagination } = createPaginationResult(users, limit);

    return { data, pagination };
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<object>}
   */
  static async getUserById(id) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createValidationError([{ field: 'id', message: 'Invalid user ID format' }]);
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('roleId', 'name code level')
      .populate('departmentId', 'name code')
      .populate('reportingManagerId', 'name email')
      .lean();

    if (!user) {
      throw createNotFoundError('User');
    }

    return user;
  }

  /**
   * Create new user (with transaction)
   * @param {object} data - User data
   * @returns {Promise<object>}
   */
  static async createUser(data) {
    // Validate report code uniqueness
    const codeExists = await User.reportCodeExists(data.reportCode);
    if (codeExists) {
      throw createValidationError([{ field: 'reportCode', message: 'Report code already in use' }]);
    }

    // Validate email uniqueness
    const emailExists = await User.emailExists(data.email);
    if (emailExists) {
      throw createValidationError([{ field: 'email', message: 'Email already in use' }]);
    }

    // Validate password length
    if (!data.password || data.password.length < 6) {
      throw createValidationError([
        { field: 'password', message: 'Password must be at least 6 characters' },
      ]);
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate role exists
      const role = await Role.findById(data.roleId).session(session);
      if (!role) {
        throw new Error('Invalid role ID');
      }

      // 2. Validate department if provided
      if (data.departmentId) {
        const dept = await Department.findById(data.departmentId).session(session);
        if (!dept) {
          throw new Error('Invalid department ID');
        }
      }

      // 3. Validate reporting manager if provided
      if (data.reportingManagerId) {
        const manager = await User.findById(data.reportingManagerId).session(session);
        if (!manager) {
          throw new Error('Invalid reporting manager ID');
        }
      }

      // 4. Create user (password hashing happens in pre-save hook)
      const [user] = await User.create([data], { session });

      // 5. Commit transaction
      await session.commitTransaction();

      // 6. Return user without password
      return await this.getUserById(user._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update user (with transaction)
   * @param {string} id - User ID
   * @param {object} data - Update data
   * @returns {Promise<object>}
   */
  static async updateUser(id, data) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createValidationError([{ field: 'id', message: 'Invalid user ID format' }]);
    }

    // Check user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw createNotFoundError('User');
    }

    // Validate email uniqueness if changing
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await User.emailExists(data.email, id);
      if (emailExists) {
        throw createValidationError([{ field: 'email', message: 'Email already in use' }]);
      }
    }

    // Validate report code uniqueness if changing
    if (data.reportCode && data.reportCode !== existingUser.reportCode) {
      const codeExists = await User.reportCodeExists(data.reportCode, id);
      if (codeExists) {
        throw createValidationError([
          { field: 'reportCode', message: 'Report code already in use' },
        ]);
      }
    }

    // Validate password length if provided
    if (data.password) {
      if (data.password.length < 6) {
        throw createValidationError([
          { field: 'password', message: 'Password must be at least 6 characters' },
        ]);
      }
      // Note: Password hashing happens in Mongoose pre-save hook
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find user in transaction
      const user = await User.findById(id).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate role if changing
      if (data.roleId && data.roleId.toString() !== user.roleId.toString()) {
        const role = await Role.findById(data.roleId).session(session);
        if (!role) {
          throw new Error('Invalid role ID');
        }
      }

      // Validate department if changing
      if (data.departmentId !== undefined) {
        if (data.departmentId && data.departmentId !== user.departmentId?.toString()) {
          const dept = await Department.findById(data.departmentId).session(session);
          if (!dept) {
            throw new Error('Invalid department ID');
          }
        }
      }

      // Validate reporting manager if changing
      if (data.reportingManagerId !== undefined) {
        if (
          data.reportingManagerId &&
          data.reportingManagerId !== user.reportingManagerId?.toString()
        ) {
          const manager = await User.findById(data.reportingManagerId).session(session);
          if (!manager) {
            throw new Error('Invalid reporting manager ID');
          }
        }
      }

      // Update user
      Object.assign(user, data);
      user.updatedAt = new Date();
      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Return updated user without password
      return await this.getUserById(user._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete user (with transaction and dependency checks)
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  static async deleteUser(id) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createValidationError([{ field: 'id', message: 'Invalid user ID format' }]);
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user exists
      const user = await User.findById(id).session(session);
      if (!user) {
        throw createNotFoundError('User');
      }

      // Check if user is a reporting manager for others
      const subordinates = await User.countDocuments({ reportingManagerId: id }).session(session);
      if (subordinates > 0) {
        throw new Error('Cannot delete user with subordinates. Reassign subordinates first.');
      }

      // Check if user is department head
      const isDeptHead = await Department.countDocuments({ headId: id }).session(session);
      if (isDeptHead > 0) {
        throw new Error('Cannot delete department head. Reassign department first.');
      }

      // Delete user
      await User.deleteOne({ _id: id }).session(session);

      // Commit transaction
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<object>}
   */
  static async getUserStats() {
    const [totalUsers, superAdminCount, adminCount, hodCount, managerCount, employeeCount] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'SUPER_ADMIN' }),
        User.countDocuments({ role: 'ADMIN' }),
        User.countDocuments({ role: 'HOD' }),
        User.countDocuments({ role: 'MANAGER' }),
        User.countDocuments({ role: 'EMPLOYEE' }),
      ]);

    const [activeCount, inactiveCount] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
    ]);

    return {
      total: totalUsers,
      byRole: {
        superAdmin: superAdminCount,
        admin: adminCount,
        hod: hodCount,
        manager: managerCount,
        employee: employeeCount,
      },
      byStatus: {
        active: activeCount,
        inactive: inactiveCount,
      },
    };
  }

  /**
   * Stream all users (for export)
   * Generator function for streaming large datasets
   */
  static async *streamUsers() {
    const users = await User.find({}).select('-password').lean().limit(1000);

    for (const user of users) {
      yield user;
    }
  }

  /**
   * Bulk create users
   * @param {Array<object>} usersData - Array of user data
   * @returns {Promise<object>}
   */
  static async bulkCreateUsers(usersData) {
    const results = [];
    const errors = [];

    for (const data of usersData) {
      try {
        const user = await this.createUser(data);
        results.push(user);
      } catch (error) {
        errors.push({ data, error: error.message });
      }
    }

    return { results, errors };
  }

  /**
   * Bulk delete users (with transaction)
   * @param {Array<string>} ids - User IDs to delete
   * @returns {Promise<object>}
   */
  static async bulkDeleteUsers(ids) {
    // Validate all IDs first
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw createValidationError([
        {
          field: 'ids',
          message: `Invalid user ID format: ${invalidIds.join(', ')}`,
        },
      ]);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results = { deleted: [], failed: [] };

      for (const id of ids) {
        try {
          // Check dependencies for each user
          const subordinates = await User.countDocuments({ reportingManagerId: id }).session(
            session
          );
          const isDeptHead = await Department.countDocuments({ headId: id }).session(session);

          if (subordinates > 0 || isDeptHead > 0) {
            results.failed.push({ id, reason: 'Has dependencies' });
            continue;
          }

          await User.deleteOne({ _id: id }).session(session);
          results.deleted.push(id);
        } catch (error) {
          results.failed.push({ id, reason: error.message });
        }
      }

      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default UserService;
