import type { ReactNode, FormEvent } from 'react';
import { useState, useMemo } from 'react';
import { Modal, Button, Input, Select, Checkbox, Badge } from '@/common';
import type { RoleCode, UserStatus, Permission, CreateUserFormData } from '@/types';

// Permission data (should come from API/context in real app)
const permissionsData: Permission[] = [
  {
    id: 'perm_dashboard',
    name: 'Dashboard',
    code: 'dashboard',
    description: 'Dashboard access',
    children: [
      { id: 'perm_dashboard_view', name: 'View Dashboard', code: 'dashboard.view', description: 'View dashboard', children: [] },
      { 
        id: 'perm_dashboard_analytics', 
        name: 'Analytics', 
        code: 'dashboard.analytics', 
        description: 'View analytics',
        children: [
          { id: 'perm_dashboard_analytics_export', name: 'Export Analytics', code: 'dashboard.analytics.export', description: 'Export', children: [] },
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
      { id: 'perm_users_view', name: 'View Users', code: 'users.view', description: 'View users', children: [] },
      { id: 'perm_users_create', name: 'Create Users', code: 'users.create', description: 'Create users', children: [] },
      { 
        id: 'perm_users_edit', 
        name: 'Edit Users', 
        code: 'users.edit', 
        description: 'Edit users',
        children: [
          { id: 'perm_users_edit_role', name: 'Change Role', code: 'users.edit.role', description: 'Change role', children: [] },
          { id: 'perm_users_edit_permissions', name: 'Manage Permissions', code: 'users.edit.permissions', description: 'Manage permissions', children: [] },
        ],
      },
      { id: 'perm_users_delete', name: 'Delete Users', code: 'users.delete', description: 'Delete users', children: [] },
    ],
  },
  {
    id: 'perm_departments',
    name: 'Department Management',
    code: 'departments',
    description: 'Department management',
    children: [
      { id: 'perm_departments_view', name: 'View Departments', code: 'departments.view', description: 'View', children: [] },
      { id: 'perm_departments_create', name: 'Create Departments', code: 'departments.create', description: 'Create', children: [] },
      { id: 'perm_departments_edit', name: 'Edit Departments', code: 'departments.edit', description: 'Edit', children: [] },
      { id: 'perm_departments_delete', name: 'Delete Departments', code: 'departments.delete', description: 'Delete', children: [] },
    ],
  },
  {
    id: 'perm_reports',
    name: 'Reports',
    code: 'reports',
    description: 'Reporting access',
    children: [
      { id: 'perm_reports_view', name: 'View Reports', code: 'reports.view', description: 'View', children: [] },
      { 
        id: 'perm_reports_generate', 
        name: 'Generate Reports', 
        code: 'reports.generate', 
        description: 'Generate',
        children: [
          { id: 'perm_reports_generate_financial', name: 'Financial Reports', code: 'reports.generate.financial', description: 'Financial', children: [] },
          { id: 'perm_reports_generate_hr', name: 'HR Reports', code: 'reports.generate.hr', description: 'HR', children: [] },
        ],
      },
      { id: 'perm_reports_export', name: 'Export Reports', code: 'reports.export', description: 'Export', children: [] },
    ],
  },
  {
    id: 'perm_settings',
    name: 'Settings',
    code: 'settings',
    description: 'System settings',
    children: [
      { id: 'perm_settings_general', name: 'General Settings', code: 'settings.general', description: 'General', children: [] },
      { 
        id: 'perm_settings_security', 
        name: 'Security Settings', 
        code: 'settings.security', 
        description: 'Security',
        children: [
          { id: 'perm_settings_security_password', name: 'Password Policies', code: 'settings.security.password', description: 'Password', children: [] },
          { id: 'perm_settings_security_2fa', name: 'Two-Factor Auth', code: 'settings.security.2fa', description: '2FA', children: [] },
        ],
      },
    ],
  },
  {
    id: 'perm_audit',
    name: 'Audit Logs',
    code: 'audit',
    description: 'Audit log access',
    children: [
      { id: 'perm_audit_view', name: 'View Audit Logs', code: 'audit.view', description: 'View', children: [] },
      { id: 'perm_audit_export', name: 'Export Audit Logs', code: 'audit.export', description: 'Export', children: [] },
    ],
  },
];

// Dummy data for dropdowns
const departmentOptions = [
  { label: 'Engineering', value: 'dept_1' },
  { label: 'Human Resources', value: 'dept_2' },
  { label: 'Finance', value: 'dept_3' },
  { label: 'Marketing', value: 'dept_4' },
  { label: 'Operations', value: 'dept_5' },
];

const roleOptions = [
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Head of Department', value: 'HOD' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Employee', value: 'EMPLOYEE' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const managerOptions = [
  { label: 'John Super Admin', value: 'user_1' },
  { label: 'Jane Admin', value: 'user_2' },
  { label: 'Robert Engineering Head', value: 'user_3' },
  { label: 'Sarah Tech Manager', value: 'user_4' },
  { label: 'Lisa HR Head', value: 'user_6' },
];

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => void;
}

interface PermissionItemProps {
  permission: Permission;
  selectedPermissions: Set<string>;
  onToggle: (code: string) => void;
  depth?: number;
  parentEnabled?: boolean;
}

const PermissionItem = ({ 
  permission, 
  selectedPermissions, 
  onToggle, 
  depth = 0,
  parentEnabled = true,
}: PermissionItemProps): ReactNode => {
  const isSelected = selectedPermissions.has(permission.code);
  const hasChildren = permission.children.length > 0;
  
  // Check if parent permission is selected (for nested permissions)
  const parentCode = permission.code.split('.').slice(0, -1).join('.');
  const isParentSelected = parentCode ? selectedPermissions.has(parentCode) : true;
  const isEnabled = parentEnabled && isParentSelected;

  return (
    <div className={depth > 0 ? 'ml-6 mt-1' : ''}>
      <div className="flex items-center gap-2 py-1">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(permission.code)}
          disabled={!isEnabled}
          label={permission.name}
          description={depth === 0 ? permission.description : undefined}
        />
        {depth === 0 && hasChildren && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {permission.children.length}
          </Badge>
        )}
      </div>
      {hasChildren && isSelected && (
        <div className="border-l border-border pl-2 mt-1">
          {permission.children.map((child) => (
            <PermissionItem
              key={child.id}
              permission={child}
              selectedPermissions={selectedPermissions}
              onToggle={onToggle}
              depth={depth + 1}
              parentEnabled={isEnabled && isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CreateUserModal = ({ isOpen, onClose, onSubmit }: CreateUserModalProps): ReactNode => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    password: '',
    departmentId: '',
    role: 'EMPLOYEE',
    reportingManagerId: '',
    status: 'active',
    permissions: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});
  const selectedPermissions = useMemo(() => new Set(formData.permissions), [formData.permissions]);

  const handleInputChange = (field: keyof CreateUserFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionToggle = (code: string): void => {
    setFormData(prev => {
      const newPermissions = new Set(prev.permissions);
      
      if (newPermissions.has(code)) {
        // Remove permission and all children
        newPermissions.delete(code);
        // Remove all child permissions
        prev.permissions.forEach(p => {
          if (p.startsWith(code + '.')) {
            newPermissions.delete(p);
          }
        });
      } else {
        // Add permission
        newPermissions.add(code);
        // Add parent permissions if not present
        const parts = code.split('.');
        for (let i = 1; i < parts.length; i++) {
          const parentCode = parts.slice(0, i).join('.');
          newPermissions.add(parentCode);
        }
      }
      
      return { ...prev, permissions: Array.from(newPermissions) };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    if (!formData.reportingManagerId) {
      newErrors.reportingManagerId = 'Reporting manager is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        departmentId: '',
        role: 'EMPLOYEE',
        reportingManagerId: '',
        status: 'active',
        permissions: [],
      });
    }
  };

  const handleClose = (): void => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User"
      description="Add a new user to the system with role-based permissions"
      size="full"
    >
      <form onSubmit={handleSubmit}>
        {/* Masonry Layout: Left - User Details, Right - Permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - User Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              User Details
            </h3>
            
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
            />
            
            <Select
              label="Department"
              options={departmentOptions}
              placeholder="Select department"
              value={formData.departmentId}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              error={errors.departmentId}
            />
            
            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as RoleCode)}
            />
            
            <Select
              label="Reporting Manager"
              options={managerOptions}
              placeholder="Select reporting manager"
              value={formData.reportingManagerId}
              onChange={(e) => handleInputChange('reportingManagerId', e.target.value)}
              error={errors.reportingManagerId}
            />
            
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as UserStatus)}
            />
          </div>

          {/* Right Column - Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Permissions
              </h3>
              <Badge variant="outline">
                {formData.permissions.length} selected
              </Badge>
            </div>
            
            <div className="rounded-lg border bg-card p-4 max-h-[500px] overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-4">
                Select main permissions to enable sub-permissions. Child permissions require parent permission to be enabled.
              </p>
              
              <div className="space-y-3">
                {permissionsData.map((permission) => (
                  <PermissionItem
                    key={permission.id}
                    permission={permission}
                    selectedPermissions={selectedPermissions}
                    onToggle={handlePermissionToggle}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
