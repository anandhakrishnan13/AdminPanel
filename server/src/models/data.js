/**
 * Dummy Data for Admin Application
 * Contains roles, permissions, departments, and users
 */

// ===================
// ROLE HIERARCHY
// ===================
// Level 1: Super Admin (all access)
// Level 2: Admin (access granted by Super Admin)
// Level 3: Head of Department (access for their department)
// Level 4: Manager (access granted by superior)
// Level 5: Employee (access granted by superior)

export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  HOD: 3,
  MANAGER: 4,
  EMPLOYEE: 5,
};

export const roles = [
  {
    id: 'role_1',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    level: 1,
    description: 'Full system access with all permissions',
    canAssignRoles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_2',
    name: 'Admin',
    code: 'ADMIN',
    level: 2,
    description: 'Administrative access as granted by Super Admin',
    canAssignRoles: ['HOD', 'MANAGER', 'EMPLOYEE'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_3',
    name: 'Head of Department',
    code: 'HOD',
    level: 3,
    description: 'Department-level access',
    canAssignRoles: ['MANAGER', 'EMPLOYEE'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_4',
    name: 'Manager',
    code: 'MANAGER',
    level: 4,
    description: 'Team management access',
    canAssignRoles: ['EMPLOYEE'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role_5',
    name: 'Employee',
    code: 'EMPLOYEE',
    level: 5,
    description: 'Basic employee access',
    canAssignRoles: [],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ===================
// DEPARTMENTS
// ===================

export const departments = [
  {
    id: 'dept_1',
    name: 'Engineering',
    code: 'ENG',
    description: 'Software Development and Engineering',
    headId: 'user_3', // HOD
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept_2',
    name: 'Human Resources',
    code: 'HR',
    description: 'Human Resources and Recruitment',
    headId: 'user_6',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept_3',
    name: 'Finance',
    code: 'FIN',
    description: 'Finance and Accounting',
    headId: 'user_7',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept_4',
    name: 'Marketing',
    code: 'MKT',
    description: 'Marketing and Communications',
    headId: 'user_8',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept_5',
    name: 'Operations',
    code: 'OPS',
    description: 'Operations and Support',
    headId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ===================
// NESTED PERMISSIONS
// ===================
// Structure: Main Permission -> Sub Permission -> Sub-Sub Permission
// Access to sub-permission requires access to parent permission

export const permissions = [
  {
    id: 'perm_dashboard',
    name: 'Dashboard',
    code: 'dashboard',
    description: 'Dashboard access',
    children: [
      {
        id: 'perm_dashboard_view',
        name: 'View Dashboard',
        code: 'dashboard.view',
        description: 'View dashboard and analytics',
        children: [],
      },
      {
        id: 'perm_dashboard_analytics',
        name: 'Analytics',
        code: 'dashboard.analytics',
        description: 'View detailed analytics',
        children: [
          {
            id: 'perm_dashboard_analytics_export',
            name: 'Export Analytics',
            code: 'dashboard.analytics.export',
            description: 'Export analytics data',
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'perm_users',
    name: 'User Management',
    code: 'users',
    description: 'User management access',
    children: [
      {
        id: 'perm_users_view',
        name: 'View Users',
        code: 'users.view',
        description: 'View user list',
        children: [],
      },
      {
        id: 'perm_users_create',
        name: 'Create Users',
        code: 'users.create',
        description: 'Create new users',
        children: [],
      },
      {
        id: 'perm_users_edit',
        name: 'Edit Users',
        code: 'users.edit',
        description: 'Edit user details',
        children: [
          {
            id: 'perm_users_edit_role',
            name: 'Change Role',
            code: 'users.edit.role',
            description: 'Change user role',
            children: [],
          },
          {
            id: 'perm_users_edit_permissions',
            name: 'Manage Permissions',
            code: 'users.edit.permissions',
            description: 'Manage user permissions',
            children: [],
          },
        ],
      },
      {
        id: 'perm_users_delete',
        name: 'Delete Users',
        code: 'users.delete',
        description: 'Delete users',
        children: [],
      },
    ],
  },
  {
    id: 'perm_departments',
    name: 'Department Management',
    code: 'departments',
    description: 'Department management access',
    children: [
      {
        id: 'perm_departments_view',
        name: 'View Departments',
        code: 'departments.view',
        description: 'View department list',
        children: [],
      },
      {
        id: 'perm_departments_create',
        name: 'Create Departments',
        code: 'departments.create',
        description: 'Create new departments',
        children: [],
      },
      {
        id: 'perm_departments_edit',
        name: 'Edit Departments',
        code: 'departments.edit',
        description: 'Edit department details',
        children: [],
      },
      {
        id: 'perm_departments_delete',
        name: 'Delete Departments',
        code: 'departments.delete',
        description: 'Delete departments',
        children: [],
      },
    ],
  },
  {
    id: 'perm_roles',
    name: 'Role Management',
    code: 'roles',
    description: 'Role and permission management',
    children: [
      {
        id: 'perm_roles_view',
        name: 'View Roles',
        code: 'roles.view',
        description: 'View role list',
        children: [],
      },
      {
        id: 'perm_roles_create',
        name: 'Create Roles',
        code: 'roles.create',
        description: 'Create custom roles',
        children: [],
      },
      {
        id: 'perm_roles_edit',
        name: 'Edit Roles',
        code: 'roles.edit',
        description: 'Edit role permissions',
        children: [],
      },
    ],
  },
  {
    id: 'perm_reports',
    name: 'Reports',
    code: 'reports',
    description: 'Reporting access',
    children: [
      {
        id: 'perm_reports_view',
        name: 'View Reports',
        code: 'reports.view',
        description: 'View reports',
        children: [],
      },
      {
        id: 'perm_reports_generate',
        name: 'Generate Reports',
        code: 'reports.generate',
        description: 'Generate new reports',
        children: [
          {
            id: 'perm_reports_generate_financial',
            name: 'Financial Reports',
            code: 'reports.generate.financial',
            description: 'Generate financial reports',
            children: [],
          },
          {
            id: 'perm_reports_generate_hr',
            name: 'HR Reports',
            code: 'reports.generate.hr',
            description: 'Generate HR reports',
            children: [],
          },
          {
            id: 'perm_reports_generate_operational',
            name: 'Operational Reports',
            code: 'reports.generate.operational',
            description: 'Generate operational reports',
            children: [],
          },
        ],
      },
      {
        id: 'perm_reports_export',
        name: 'Export Reports',
        code: 'reports.export',
        description: 'Export reports to various formats',
        children: [],
      },
    ],
  },
  {
    id: 'perm_settings',
    name: 'Settings',
    code: 'settings',
    description: 'System settings access',
    children: [
      {
        id: 'perm_settings_general',
        name: 'General Settings',
        code: 'settings.general',
        description: 'General system settings',
        children: [],
      },
      {
        id: 'perm_settings_security',
        name: 'Security Settings',
        code: 'settings.security',
        description: 'Security and authentication settings',
        children: [
          {
            id: 'perm_settings_security_password',
            name: 'Password Policies',
            code: 'settings.security.password',
            description: 'Configure password policies',
            children: [],
          },
          {
            id: 'perm_settings_security_2fa',
            name: 'Two-Factor Auth',
            code: 'settings.security.2fa',
            description: 'Configure 2FA settings',
            children: [],
          },
        ],
      },
      {
        id: 'perm_settings_notifications',
        name: 'Notifications',
        code: 'settings.notifications',
        description: 'Notification settings',
        children: [],
      },
      {
        id: 'perm_settings_integrations',
        name: 'Integrations',
        code: 'settings.integrations',
        description: 'Third-party integrations',
        children: [],
      },
    ],
  },
  {
    id: 'perm_audit',
    name: 'Audit Logs',
    code: 'audit',
    description: 'Audit log access',
    children: [
      {
        id: 'perm_audit_view',
        name: 'View Audit Logs',
        code: 'audit.view',
        description: 'View audit logs',
        children: [],
      },
      {
        id: 'perm_audit_export',
        name: 'Export Audit Logs',
        code: 'audit.export',
        description: 'Export audit logs',
        children: [],
      },
    ],
  },
];

// ===================
// USERS
// ===================
// Status: 'active' | 'inactive'

export const users = [
  // Super Admin
  {
    id: 'user_1',
    name: 'John Super Admin',
    email: 'superadmin@company.com',
    password: 'password123', // Will be hashed by bcrypt during seeding
    role: {
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      level: 1,
      description: 'Full system access with all permissions',
      canAssignRoles: ['ADMIN', 'HOD', 'MANAGER', 'EMPLOYEE'],
    },
    department: null, // Super Admin is not bound to department
    reportingManagerId: null,
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    permissions: ['*'], // All permissions
    avatar: null,
    reportCode: 'SA7X9K2M', // Unique alphanumeric report code
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  // Admin
  {
    id: 'user_2',
    name: 'Jane Admin',
    email: 'admin@company.com',
    password: 'password123',
    role: {
      name: 'Admin',
      code: 'ADMIN',
      level: 2,
      description: 'Administrative access as granted by Super Admin',
      canAssignRoles: ['HOD', 'MANAGER', 'EMPLOYEE'],
    },
    department: null,
    reportingManagerId: 'user_1',
    reportCode: 'AD3K8L1P',
    status: 'active',
    lastLogin: '2024-01-15T09:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'dashboard.analytics',
      'users',
      'users.view',
      'users.create',
      'users.edit',
      'users.edit.role',
      'departments',
      'departments.view',
      'departments.edit',
      'reports',
      'reports.view',
      'reports.generate',
      'settings',
      'settings.general',
      'audit',
      'audit.view',
    ],
    avatar: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  // HOD - Engineering
  {
    id: 'user_3',
    name: 'Robert Engineering Head',
    email: 'hod.engineering@company.com',
    password: 'password123',
    role: {
      name: 'Head of Department',
      code: 'HOD',
      level: 3,
      description: 'Department-level access',
      canAssignRoles: ['MANAGER', 'EMPLOYEE'],
    },
    department: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Software Development and Engineering',
    },
    reportingManagerId: 'user_2',
    reportCode: 'HE5R2N4K',
    status: 'active',
    lastLogin: '2024-01-14T16:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'users',
      'users.view',
      'users.create',
      'users.edit',
      'departments',
      'departments.view',
      'reports',
      'reports.view',
      'reports.generate',
      'reports.generate.operational',
    ],
    avatar: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  // Manager - Engineering
  {
    id: 'user_4',
    name: 'Sarah Tech Manager',
    email: 'manager.tech@company.com',
    password: 'password123',
    role: {
      name: 'Manager',
      code: 'MANAGER',
      level: 4,
      description: 'Team management access',
      canAssignRoles: ['EMPLOYEE'],
    },
    department: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Software Development and Engineering',
    },
    reportingManagerId: 'user_3',
    reportCode: 'MT6P9L2W',
    status: 'active',
    lastLogin: '2024-01-15T08:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'users',
      'users.view',
      'reports',
      'reports.view',
    ],
    avatar: null,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  // Employee - Engineering
  {
    id: 'user_5',
    name: 'Mike Developer',
    email: 'mike.dev@company.com',
    password: 'password123',
    role: {
      name: 'Employee',
      code: 'EMPLOYEE',
      level: 5,
      description: 'Basic employee access',
      canAssignRoles: [],
    },
    department: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Software Development and Engineering',
    },
    reportingManagerId: 'user_4',
    reportCode: 'EM3D8V5Q',
    status: 'active',
    lastLogin: '2024-01-15T07:30:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
    ],
    avatar: null,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T07:30:00Z',
  },
  // HOD - HR
  {
    id: 'user_6',
    name: 'Lisa HR Head',
    email: 'hod.hr@company.com',
    password: 'password123',
    role: {
      name: 'Head of Department',
      code: 'HOD',
      level: 3,
      description: 'Department-level access',
      canAssignRoles: ['MANAGER', 'EMPLOYEE'],
    },
    department: {
      name: 'Human Resources',
      code: 'HR',
      description: 'Human Resources and Recruitment',
    },
    reportingManagerId: 'user_2',
    reportCode: 'HH7K1M9N',
    status: 'active',
    lastLogin: '2024-01-13T14:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'users',
      'users.view',
      'users.create',
      'users.edit',
      'departments',
      'departments.view',
      'reports',
      'reports.view',
      'reports.generate',
      'reports.generate.hr',
    ],
    avatar: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
  },
  // HOD - Finance
  {
    id: 'user_7',
    name: 'David Finance Head',
    email: 'hod.finance@company.com',
    password: 'password123',
    role: {
      name: 'Head of Department',
      code: 'HOD',
      level: 3,
      description: 'Department-level access',
      canAssignRoles: ['MANAGER', 'EMPLOYEE'],
    },
    department: {
      name: 'Finance',
      code: 'FIN',
      description: 'Finance and Accounting',
    },
    reportingManagerId: 'user_2',
    reportCode: 'HF4X6T8Z',
    status: 'inactive',
    lastLogin: '2024-01-10T12:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'dashboard.analytics',
      'users',
      'users.view',
      'departments',
      'departments.view',
      'reports',
      'reports.view',
      'reports.generate',
      'reports.generate.financial',
      'reports.export',
    ],
    avatar: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
  },
  // HOD - Marketing
  {
    id: 'user_8',
    name: 'Emma Marketing Head',
    email: 'hod.marketing@company.com',
    password: 'password123',
    role: {
      name: 'Head of Department',
      code: 'HOD',
      level: 3,
      description: 'Department-level access',
      canAssignRoles: ['MANAGER', 'EMPLOYEE'],
    },
    department: {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and Communications',
    },
    reportingManagerId: 'user_1',
    reportCode: 'HM2Y5R7L',
    status: 'active',
    lastLogin: '2024-01-15T11:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'dashboard.analytics',
      'dashboard.analytics.export',
      'users',
      'users.view',
      'users.create',
      'departments',
      'departments.view',
      'reports',
      'reports.view',
    ],
    avatar: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  // Manager - Marketing
  {
    id: 'user_9',
    name: 'Alex Campaign Manager',
    email: 'manager.campaign@company.com',
    password: 'password123',
    role: {
      name: 'Manager',
      code: 'MANAGER',
      level: 4,
      description: 'Team management access',
      canAssignRoles: ['EMPLOYEE'],
    },
    department: {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and Communications',
    },
    reportingManagerId: 'user_8',
    reportCode: 'MM1Z4S6B',
    status: 'active',
    lastLogin: '2024-01-14T09:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
      'users',
      'users.view',
    ],
    avatar: null,
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
  },
  // Employee - Marketing
  {
    id: 'user_10',
    name: 'Chris Content Writer',
    email: 'chris.content@company.com',
    password: 'password123',
    role: {
      name: 'Employee',
      code: 'EMPLOYEE',
      level: 5,
      description: 'Basic employee access',
      canAssignRoles: [],
    },
    department: {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and Communications',
    },
    reportingManagerId: 'user_9',
    reportCode: 'EC9Q3W7H',
    status: 'inactive',
    lastLogin: '2024-01-01T10:00:00Z',
    permissions: [
      'dashboard',
      'dashboard.view',
    ],
    avatar: null,
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

// ===================
// SIDEBAR NAVIGATION
// ===================

export const sidebarNavigation = [
  {
    id: 'nav_dashboard',
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permission: 'dashboard',
    children: [],
  },
  {
    id: 'nav_users',
    title: 'User Management',
    icon: 'Users',
    path: '/users',
    permission: 'users',
    children: [
      {
        id: 'nav_users_list',
        title: 'All Users',
        path: '/users',
        permission: 'users.view',
      },
      {
        id: 'nav_users_create',
        title: 'Add User',
        path: '/users/create',
        permission: 'users.create',
      },
    ],
  },
  {
    id: 'nav_departments',
    title: 'Departments',
    icon: 'Building2',
    path: '/departments',
    permission: 'departments',
    children: [
      {
        id: 'nav_departments_list',
        title: 'All Departments',
        path: '/departments',
        permission: 'departments.view',
      },
      {
        id: 'nav_departments_create',
        title: 'Add Department',
        path: '/departments/create',
        permission: 'departments.create',
      },
    ],
  },
  {
    id: 'nav_roles',
    title: 'Roles & Permissions',
    icon: 'Shield',
    path: '/roles',
    permission: 'roles',
    children: [
      {
        id: 'nav_roles_list',
        title: 'All Roles',
        path: '/roles',
        permission: 'roles.view',
      },
      {
        id: 'nav_roles_create',
        title: 'Create Role',
        path: '/roles/create',
        permission: 'roles.create',
      },
    ],
  },
  {
    id: 'nav_reports',
    title: 'Reports',
    icon: 'FileText',
    path: '/reports',
    permission: 'reports',
    children: [
      {
        id: 'nav_reports_view',
        title: 'View Reports',
        path: '/reports',
        permission: 'reports.view',
      },
      {
        id: 'nav_reports_generate',
        title: 'Generate Report',
        path: '/reports/generate',
        permission: 'reports.generate',
      },
    ],
  },
  {
    id: 'nav_settings',
    title: 'Settings',
    icon: 'Settings',
    path: '/settings',
    permission: 'settings',
    children: [
      {
        id: 'nav_settings_general',
        title: 'General',
        path: '/settings/general',
        permission: 'settings.general',
      },
      {
        id: 'nav_settings_security',
        title: 'Security',
        path: '/settings/security',
        permission: 'settings.security',
      },
      {
        id: 'nav_settings_notifications',
        title: 'Notifications',
        path: '/settings/notifications',
        permission: 'settings.notifications',
      },
      {
        id: 'nav_settings_integrations',
        title: 'Integrations',
        path: '/settings/integrations',
        permission: 'settings.integrations',
      },
    ],
  },
  {
    id: 'nav_audit',
    title: 'Audit Logs',
    icon: 'ClipboardList',
    path: '/audit',
    permission: 'audit',
    children: [],
  },
];

// ===================
// HELPER FUNCTIONS
// ===================

/**
 * Get all permission codes flattened
 */
export const getAllPermissionCodes = (perms = permissions, prefix = '') => {
  const codes = [];
  for (const perm of perms) {
    codes.push(perm.code);
    if (perm.children && perm.children.length > 0) {
      codes.push(...getAllPermissionCodes(perm.children));
    }
  }
  return codes;
};

/**
 * Check if user has permission (respects hierarchy)
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Direct permission check
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check parent permission (e.g., 'users' grants access to 'users.view')
  const parts = requiredPermission.split('.');
  let parentPerm = '';
  for (let i = 0; i < parts.length - 1; i++) {
    parentPerm = parentPerm ? `${parentPerm}.${parts[i]}` : parts[i];
    if (userPermissions.includes(parentPerm)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get role by code
 */
export const getRoleByCode = (code) => {
  return roles.find(r => r.code === code) || null;
};

/**
 * Get department by ID
 */
export const getDepartmentById = (id) => {
  return departments.find(d => d.id === id) || null;
};

/**
 * Get user by ID
 */
export const getUserById = (id) => {
  return users.find(u => u.id === id) || null;
};

/**
 * Get users by department
 */
export const getUsersByDepartment = (departmentId) => {
  return users.filter(u => u.departmentId === departmentId);
};

/**
 * Get subordinates of a user
 */
export const getSubordinates = (managerId) => {
  return users.filter(u => u.reportingManagerId === managerId);
};

/**
 * Check if user can manage another user based on role hierarchy
 */
export const canManageUser = (managerRole, targetRole) => {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];
  return managerLevel < targetLevel;
};

export default {
  roles,
  departments,
  permissions,
  users,
  sidebarNavigation,
  ROLE_HIERARCHY,
  getAllPermissionCodes,
  hasPermission,
  getRoleByCode,
  getDepartmentById,
  getUserById,
  getUsersByDepartment,
  getSubordinates,
  canManageUser,
};
