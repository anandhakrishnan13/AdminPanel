/**
 * Auth Service
 * Business logic for authentication and authorization
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../models/schemas/user.schema.js';
import { createValidationError, createUnauthorizedError } from '../middlewares/error.middleware.js';

export class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<object>} User object with token (when JWT is implemented)
   */
  static async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw createValidationError([
        { field: 'credentials', message: 'Email and password are required' },
      ]);
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw createUnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw createUnauthorizedError('Account is inactive. Please contact administrator.');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createUnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    // TODO: Generate JWT token here when JWT is implemented
    // const token = generateJWT(userObject);

    return {
      user: userObject,
      // token, // TODO: Add when JWT is implemented
    };
  }

  /**
   * Change user password (with old password verification)
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>}
   */
  static async changePassword(userId, oldPassword, newPassword) {
    // Validate input
    if (!oldPassword || !newPassword) {
      throw createValidationError([
        { field: 'passwords', message: 'Old password and new password are required' },
      ]);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw createValidationError([
        { field: 'newPassword', message: 'New password must be at least 6 characters' },
      ]);
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createValidationError([{ field: 'userId', message: 'Invalid user ID format' }]);
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find user with password
      const user = await User.findById(userId).select('+password').session(session);

      if (!user) {
        throw createUnauthorizedError('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isOldPasswordValid) {
        throw createUnauthorizedError('Current password is incorrect');
      }

      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);

      if (isSamePassword) {
        throw createValidationError([
          { field: 'newPassword', message: 'New password must be different from current password' },
        ]);
      }

      // Update password (hashing happens in pre-save hook)
      user.password = newPassword;
      await user.save({ session });

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
   * Verify user credentials (without updating last login)
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<object>} User object
   */
  static async verifyCredentials(email, password) {
    // Validate input
    if (!email || !password) {
      throw createValidationError([
        { field: 'credentials', message: 'Email and password are required' },
      ]);
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw createUnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw createUnauthorizedError('Account is inactive');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createUnauthorizedError('Invalid email or password');
    }

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<object>}
   */
  static async getProfile(userId) {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createValidationError([{ field: 'userId', message: 'Invalid user ID format' }]);
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('roleId', 'name code level')
      .populate('departmentId', 'name code')
      .populate('reportingManagerId', 'name email')
      .lean();

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    return user;
  }

  /**
   * Update user profile (name and avatar only - not password)
   * @param {string} userId - User ID
   * @param {object} data - Update data (name, avatar)
   * @returns {Promise<object>}
   */
  static async updateProfile(userId, data) {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createValidationError([{ field: 'userId', message: 'Invalid user ID format' }]);
    }

    // Only allow name and avatar updates
    const allowedFields = ['name', 'avatar'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // Update user
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('roleId', 'name code level')
      .populate('departmentId', 'name code')
      .populate('reportingManagerId', 'name email')
      .lean();

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    return user;
  }

  /**
   * Logout user
   * TODO: Implement token blacklisting when JWT is implemented
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  static async logout(userId) {
    // TODO: Add token to blacklist when JWT is implemented
    // For now, just return true
    return true;
  }

  // ===========================================
  // TODO: Future JWT-related methods
  // ===========================================

  /**
   * Validate JWT token (to be implemented)
   * @param {string} token - JWT token
   * @returns {Promise<object>}
   */
  static async validateToken(token) {
    // TODO: Implement JWT validation
    throw new Error('JWT validation not yet implemented');
  }

  /**
   * Generate password reset token (to be implemented)
   * @param {string} email - User email
   * @returns {Promise<string>}
   */
  static async generateResetToken(email) {
    // TODO: Implement password reset token generation
    throw new Error('Password reset not yet implemented');
  }

  /**
   * Reset password with token (to be implemented)
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>}
   */
  static async resetPassword(token, newPassword) {
    // TODO: Implement password reset with token
    throw new Error('Password reset not yet implemented');
  }

  /**
   * Verify email with token (to be implemented)
   * @param {string} token - Verification token
   * @returns {Promise<boolean>}
   */
  static async verifyEmail(token) {
    // TODO: Implement email verification
    throw new Error('Email verification not yet implemented');
  }
}

export default AuthService;
