import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RoleCode, UserStatus, Permission, User } from "@/types";

// Permission data
const permissionsData: Permission[] = [
  {
    id: "perm_dashboard",
    name: "Dashboard",
    code: "dashboard",
    description: "Dashboard access",
    children: [
      { id: "perm_dashboard_view", name: "View Dashboard", code: "dashboard.view", description: "View dashboard", children: [] },
      {
        id: "perm_dashboard_analytics",
        name: "Analytics",
        code: "dashboard.analytics",
        description: "View analytics",
        children: [
          { id: "perm_dashboard_analytics_export", name: "Export Analytics", code: "dashboard.analytics.export", description: "Export", children: [] },
        ],
      },
    ],
  },
  {
    id: "perm_users",
    name: "User Management",
    code: "users",
    description: "User management access",
    children: [
      { id: "perm_users_view", name: "View Users", code: "users.view", description: "View users", children: [] },
      { id: "perm_users_create", name: "Create Users", code: "users.create", description: "Create users", children: [] },
      {
        id: "perm_users_edit",
        name: "Edit Users",
        code: "users.edit",
        description: "Edit users",
        children: [
          { id: "perm_users_edit_role", name: "Change Role", code: "users.edit.role", description: "Change role", children: [] },
          { id: "perm_users_edit_permissions", name: "Manage Permissions", code: "users.edit.permissions", description: "Manage permissions", children: [] },
        ],
      },
      { id: "perm_users_delete", name: "Delete Users", code: "users.delete", description: "Delete users", children: [] },
    ],
  },
  {
    id: "perm_reports",
    name: "Reports",
    code: "reports",
    description: "Reporting access",
    children: [
      { id: "perm_reports_view", name: "View Reports", code: "reports.view", description: "View", children: [] },
      {
        id: "perm_reports_generate",
        name: "Generate Reports",
        code: "reports.generate",
        description: "Generate",
        children: [
          { id: "perm_reports_generate_financial", name: "Financial Reports", code: "reports.generate.financial", description: "Financial", children: [] },
          { id: "perm_reports_generate_hr", name: "HR Reports", code: "reports.generate.hr", description: "HR", children: [] },
        ],
      },
      { id: "perm_reports_export", name: "Export Reports", code: "reports.export", description: "Export", children: [] },
    ],
  },
];

// Dropdown options
const dropdownOptions = {
  departments: [
    { label: "Engineering", value: "dept_1" },
    { label: "Human Resources", value: "dept_2" },
    { label: "Finance", value: "dept_3" },
    { label: "Marketing", value: "dept_4" },
    { label: "Operations", value: "dept_5" },
  ],
  roles: [
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Admin", value: "ADMIN" },
    { label: "Head of Department", value: "HOD" },
    { label: "Manager", value: "MANAGER" },
    { label: "Employee", value: "EMPLOYEE" },
  ],
  statuses: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ],
  managers: [
    { label: "John Super Admin", value: "user_1" },
    { label: "Jane Admin", value: "user_2" },
    { label: "Robert Engineering Head", value: "user_3" },
    { label: "Sarah Tech Manager", value: "user_4" },
    { label: "Lisa HR Head", value: "user_6" },
  ],
};

// Form field definitions for DRY rendering
const formFields = [
  { id: "name", label: "Full Name", type: "text", placeholder: "Enter full name" },
  { id: "email", label: "Email Address", type: "email", placeholder: "Enter email address" },
  { id: "password", label: "Password", type: "password", placeholder: "Enter password (min 8 characters)" },
] as const;

const selectFields = [
  { id: "departmentId", label: "Department", options: dropdownOptions.departments, placeholder: "Select department" },
  { id: "role", label: "Role", options: dropdownOptions.roles, placeholder: "Select role" },
  { id: "reportingManagerId", label: "Reporting Manager", options: dropdownOptions.managers, placeholder: "Select manager" },
  { id: "status", label: "Status", options: dropdownOptions.statuses, placeholder: "Select status" },
] as const;

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  role: RoleCode;
  reportingManagerId: string;
  status: UserStatus;
  permissions: string[];
  reportCode: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null; // If provided, it's edit mode
  mode: "create" | "edit";
}

interface PermissionItemProps {
  permission: Permission;
  selectedPermissions: Set<string>;
  onToggle: (code: string) => void;
  depth?: number;
}

const PermissionItem = ({
  permission,
  selectedPermissions,
  onToggle,
  depth = 0,
}: PermissionItemProps): React.ReactNode => {
  const isSelected = selectedPermissions.has(permission.code);
  const hasChildren = permission.children.length > 0;

  // Check parent permission for nested items
  const parentCode = permission.code.split(".").slice(0, -1).join(".");
  const isParentSelected = parentCode ? selectedPermissions.has(parentCode) : true;
  const isEnabled = isParentSelected;

  return (
    <div className={depth > 0 ? "ml-6 mt-2" : ""}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={permission.id}
          checked={isSelected}
          onCheckedChange={() => onToggle(permission.code)}
          disabled={!isEnabled}
        />
        <label
          htmlFor={permission.id}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            !isEnabled ? "opacity-50" : ""
          }`}
        >
          {permission.name}
        </label>
        {depth === 0 && hasChildren && (
          <span className="text-xs text-muted-foreground">
            ({permission.children.length} sub-permissions)
          </span>
        )}
      </div>
      {hasChildren && isSelected && (
        <div className="border-l border-border pl-2 mt-2">
          {permission.children.map((child) => (
            <PermissionItem
              key={child.id}
              permission={child}
              selectedPermissions={selectedPermissions}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function UserModal({ isOpen, onClose, onSubmit, user, mode }: UserModalProps): React.ReactNode {
  const initialFormData: UserFormData = React.useMemo(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    departmentId: user?.departmentId ?? "",
    role: user?.role ?? "EMPLOYEE",
    reportingManagerId: user?.reportingManagerId ?? "",
    status: user?.status ?? "active",
    permissions: user?.permissions ?? [],
    reportCode: user?.reportCode ?? "",
  }), [user]);

  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormData, string>>>({});

  // Reset form when modal opens or user changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen, initialFormData]);

  const selectedPermissions = React.useMemo(() => new Set(formData.permissions), [formData.permissions]);

  const handleInputChange = (field: keyof UserFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionToggle = (code: string): void => {
    setFormData((prev) => {
      const newPermissions = new Set(prev.permissions);

      if (newPermissions.has(code)) {
        // Remove permission and all children
        newPermissions.delete(code);
        prev.permissions.forEach((p) => {
          if (p.startsWith(code + ".")) {
            newPermissions.delete(p);
          }
        });
      } else {
        // Add permission and parent permissions
        newPermissions.add(code);
        const parts = code.split(".");
        for (let i = 1; i < parts.length; i++) {
          const parentCode = parts.slice(0, i).join(".");
          newPermissions.add(parentCode);
        }
      }

      return { ...prev, permissions: Array.from(newPermissions) };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (mode === "create" && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.departmentId) newErrors.departmentId = "Department is required";
    if (!formData.reportingManagerId) newErrors.reportingManagerId = "Reporting manager is required";
    if (!formData.reportCode.trim()) {
      newErrors.reportCode = "Report code is required";
    } else if (!/^[A-Z0-9]+$/.test(formData.reportCode)) {
      newErrors.reportCode = "Report code must be alphanumeric uppercase";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full md:max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6">
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system with role-based permissions"
              : "Update user details and permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
              {/* Left Column - User Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  User Details
                </h3>

              {/* Text input fields using map */}
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof UserFormData] as string}
                    onChange={(e) => handleInputChange(field.id as keyof UserFormData, e.target.value)}
                    className={errors[field.id as keyof UserFormData] ? "border-destructive" : ""}
                  />
                  {errors[field.id as keyof UserFormData] && (
                    <p className="text-sm text-destructive">{errors[field.id as keyof UserFormData]}</p>
                  )}
                </div>
              ))}

              {/* Select fields using map */}
              {selectFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Select
                    value={formData[field.id as keyof UserFormData] as string}
                    onValueChange={(value) => handleInputChange(field.id as keyof UserFormData, value)}
                  >
                    <SelectTrigger className={errors[field.id as keyof UserFormData] ? "border-destructive" : ""}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.id as keyof UserFormData] && (
                    <p className="text-sm text-destructive">{errors[field.id as keyof UserFormData]}</p>
                  )}
                </div>
              ))}

              {/* Report Code - Manual assignment */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="reportCode">Report Code</Label>
                <Input
                  id="reportCode"
                  value={formData.reportCode}
                  onChange={(e) => handleInputChange("reportCode", e.target.value.toUpperCase())}
                  placeholder="e.g., SA7X9K2M"
                  className={`font-mono ${errors.reportCode ? "border-destructive" : ""}`}
                  maxLength={8}
                />
                {errors.reportCode && (
                  <p className="text-sm text-destructive">{errors.reportCode}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Unique identifier for reports. Must be 8 alphanumeric characters (uppercase).
                </p>
              </div>
            </div>

            {/* Right Column - Permissions */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Permissions
                </h3>
                <span className="text-xs text-muted-foreground">
                  {formData.permissions.length} selected
                </span>
              </div>

              <div className="flex-1 rounded-lg border bg-card p-4">
                <ScrollArea className="h-full">
                  <p className="text-xs text-muted-foreground mb-4">
                    Select main permissions to enable sub-permissions. Child permissions require parent permission.
                  </p>

                  <div className="space-y-4">
                    {permissionsData.map((permission) => (
                      <PermissionItem
                        key={permission.id}
                        permission={permission}
                        selectedPermissions={selectedPermissions}
                        onToggle={handlePermissionToggle}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          </ScrollArea>

          <DialogFooter className="px-4 md:px-6 pb-4 md:pb-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {mode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
