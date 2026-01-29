// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface ApiMeta {
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
  total?: number;
}

// ===================
// RBAC Types
// ===================

export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'active' | 'inactive';

export interface Role {
  id: string;
  name: string;
  code: RoleCode;
  level: number;
  description: string;
  canAssignRoles: RoleCode[];
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headId: string | null;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  children: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleCode;
  roleId: string;
  departmentId: string | null;
  reportingManagerId: string | null;
  status: UserStatus;
  lastLogin: string | null;
  permissions: string[];
  avatar: string | null;
  reportCode: string; // Unique alphanumeric report code
  createdAt: string;
  updatedAt: string;
}

// ===================
// Form Types
// ===================

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  role: RoleCode;
  reportingManagerId: string;
  status: UserStatus;
  permissions: string[];
}

export interface UpdateUserFormData extends Partial<Omit<CreateUserFormData, 'password'>> {
  password?: string;
}

// ===================
// Navigation Types
// ===================

export interface NavItem {
  id: string;
  title: string;
  icon?: string;
  path: string;
  permission: string;
  children?: NavSubItem[];
}

export interface NavSubItem {
  id: string;
  title: string;
  path: string;
  permission: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ===================
// Table Types
// ===================

export interface UserTableRow {
  id: string;
  name: string;
  email: string;
  role: RoleCode;
  lastLogin: string | null;
  status: UserStatus;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

// ===================
// Auth Context Types
// ===================

export interface AuthUser extends User {
  // Additional auth-specific fields if needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}
