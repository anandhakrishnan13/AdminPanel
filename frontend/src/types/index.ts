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

// Embedded Role (in User document)
export interface Role {
  name: string;
  code: RoleCode;
  level: number;
  description: string;
  canAssignRoles: RoleCode[];
}

// Embedded Department (in User document)
export interface Department {
  name: string;
  code: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  children: Permission[];
}

export interface User {
  _id?: string; // MongoDB ID
  id?: string; // For compatibility
  name: string;
  email: string;
  role: Role; // Embedded role object
  department: Department | null; // Embedded department object
  reportingManagerId: string | null;
  status: UserStatus;
  lastLogin: string | null;
  permissions: string[];
  avatar: string | null;
  reportCode?: string; // Unique alphanumeric report code
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
  department: Department | null;
  role: Role;
  reportingManagerId: string;
  status: UserStatus;
  permissions: string[];
  reportCode?: string;
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
  role: Role;
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
