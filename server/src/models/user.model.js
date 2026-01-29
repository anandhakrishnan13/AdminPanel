/**
 * User Model
 * Defines user data structure and database operations
 */

import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with actual database)
const users = new Map();

// User schema/structure reference
const userSchema = {
  id: 'string (UUID)',
  email: 'string',
  name: 'string',
  password: 'string (hashed)',
  role: 'string (admin|user|moderator)',
  avatar: 'string|null',
  createdAt: 'Date',
  updatedAt: 'Date',
};

/**
 * Initialize with seed data
 */
const seedData = [
  { id: '1', email: 'admin@example.com', name: 'Admin User', password: 'hashed', role: 'admin' },
  { id: '2', email: 'user@example.com', name: 'Regular User', password: 'hashed', role: 'user' },
  { id: '3', email: 'mod@example.com', name: 'Moderator', password: 'hashed', role: 'moderator' },
];

seedData.forEach(user => {
  users.set(user.id, {
    ...user,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

/**
 * User Model class
 * Implements repository pattern for data access
 */
export class UserModel {
  /**
   * Find all users with optional filters
   * @param {object} options - Query options
   * @returns {Promise<Array>}
   */
  static async findAll(options = {}) {
    const { cursor, limit = 20, role, search } = options;
    
    let result = Array.from(users.values());
    
    // Apply filters
    if (role) {
      result = result.filter(user => user.role === role);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply cursor pagination
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = result.findIndex(user => user.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }
    
    // Fetch one extra to determine hasMore
    const paginatedResult = result.slice(startIndex, startIndex + limit + 1);
    
    return paginatedResult;
  }
  
  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    return users.get(id) || null;
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    return Array.from(users.values()).find(user => user.email === email) || null;
  }
  
  /**
   * Create new user
   * @param {object} data - User data
   * @returns {Promise<object>}
   */
  static async create(data) {
    const id = uuidv4();
    const now = new Date();
    
    const user = {
      id,
      email: data.email,
      name: data.name,
      password: data.password, // Should be hashed
      role: data.role || 'user',
      avatar: data.avatar || null,
      createdAt: now,
      updatedAt: now,
    };
    
    users.set(id, user);
    return user;
  }
  
  /**
   * Update user
   * @param {string} id - User ID
   * @param {object} data - Update data
   * @returns {Promise<object|null>}
   */
  static async update(id, data) {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...data,
      id, // Prevent ID change
      createdAt: user.createdAt, // Prevent createdAt change
      updatedAt: new Date(),
    };
    
    users.set(id, updatedUser);
    return updatedUser;
  }
  
  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    return users.delete(id);
  }
  
  /**
   * Count users with optional filters
   * @param {object} filters - Count filters
   * @returns {Promise<number>}
   */
  static async count(filters = {}) {
    let result = Array.from(users.values());
    
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    return result.length;
  }
  
  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} excludeId - User ID to exclude
   * @returns {Promise<boolean>}
   */
  static async emailExists(email, excludeId = null) {
    const user = await this.findByEmail(email);
    if (!user) return false;
    if (excludeId && user.id === excludeId) return false;
    return true;
  }
  
  /**
   * Get lean user object (without sensitive data)
   * @param {object} user - Full user object
   * @returns {object}
   */
  static toLean(user) {
    if (!user) return null;
    const { password, ...leanUser } = user;
    return leanUser;
  }
}

export default UserModel;
