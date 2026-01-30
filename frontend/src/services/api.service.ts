/**
 * User API Service
 * API calls for user management
 */

import { api } from '@/lib/api';
import type { User, LoginCredentials, UserStatus } from '@/types';

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    total?: number;
  };
}

export interface UserStats {
  total: number;
  byRole: {
    superAdmin: number;
    admin: number;
    hod: number;
    manager: number;
    employee: number;
  };
  byStatus: {
    active: number;
    inactive: number;
  };
}

// User API Service
export const userService = {
  /**
   * Get all users (paginated)
   */
  async getUsers(params?: {
    cursor?: string;
    limit?: number;
    role?: string;
    status?: UserStatus;
    search?: string;
    departmentCode?: string;
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.departmentCode) queryParams.append('departmentCode', params.departmentCode);

    const query = queryParams.toString();
    const endpoint = query ? `/users?${query}` : '/users';
    
    return api.get<PaginatedResponse<User>>(endpoint);
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>(`/users/${id}`);
  },

  /**
   * Create new user
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/users', userData);
  },

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return api.put<ApiResponse<User>>(`/users/${id}`, userData);
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return api.get<ApiResponse<UserStats>>('/users/stats');
  },
};

// Auth API Service
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/auth/login', credentials);
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return api.post<ApiResponse<{ message: string }>>('/auth/logout');
  },

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return api.put<ApiResponse<{ message: string }>>(`/auth/change-password`, {
      userId,
      oldPassword,
      newPassword,
    });
  },
};

export default { userService, authService };
