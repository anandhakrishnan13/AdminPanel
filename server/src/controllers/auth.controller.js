/**
 * Auth Controller
 * Handles authentication-related requests
 */

import { User } from '../models/schemas/user.schema.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import { createValidationError } from '../middlewares/error.middleware.js';

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw createValidationError([
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' },
      ]);
    }

    // Find user by email (include password for verification)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('reportingManagerId', 'name email')
      .lean();

    return sendSuccess(res, userResponse, 200);
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error.message || 'Login failed', error.status || 500);
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // In a real app, you would invalidate the token here
    return sendSuccess(res, { message: 'Logout successful' }, 200);
  } catch (error) {
    return sendError(res, 'Logout failed', 500);
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !oldPassword || !newPassword) {
      throw createValidationError([
        { field: 'userId', message: 'User ID is required' },
        { field: 'oldPassword', message: 'Old password is required' },
        { field: 'newPassword', message: 'New password is required' },
      ]);
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid old password', 401);
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, { message: 'Password changed successfully' }, 200);
  } catch (error) {
    return sendError(res, error.message || 'Password change failed', error.status || 500);
  }
};
