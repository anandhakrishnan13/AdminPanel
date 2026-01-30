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
import { Loader2, Eye, EyeOff } from "lucide-react";
import type { UserStatus, Permission, User, Role, Department } from "@/types";
import { userService } from "@/services/api.service";

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

// Static role/department data matching backend
const rolesData: Role[] = [
  {
    name: "Super Admin",
    code: "SUPER_ADMIN",
    level: 1,
    description: "Full system access with all permissions",
    canAssignRoles: ["ADMIN", "HOD", "MANAGER", "EMPLOYEE"],
  },
  {
    name: "Admin",
    code: "ADMIN",
    level: 2,
    description: "Administrative access as granted by Super Admin",
    canAssignRoles: ["HOD", "MANAGER", "EMPLOYEE"],
  },
  {
    name: "Head of Department",
    code: "HOD",
    level: 3,
    description: "Department-level access",
    canAssignRoles: ["MANAGER", "EMPLOYEE"],
  },
  {
    name: "Manager",
    code: "MANAGER",
    level: 4,
    description: "Team management access",
    canAssignRoles: ["EMPLOYEE"],
  },
  {
    name: "Employee",
    code: "EMPLOYEE",
    level: 5,
    description: "Basic employee access",
    canAssignRoles: [],
  },
];

const departmentsData: Department[] = [
  { name: "Engineering", code: "ENG", description: "Software Development and Engineering" },
  { name: "Human Resources", code: "HR", description: "Human Resources and Recruitment" },
  { name: "Finance", code: "FIN", description: "Finance and Accounting" },
  { name: "Marketing", code: "MKT", description: "Marketing and Communications" },
  { name: "Operations", code: "OPS", description: "Operations and Logistics" },
];

const statusOptions = [
  { label: "Active", value: "active" as UserStatus },
  { label: "Inactive", value: "inactive" as UserStatus },
];

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  department: Department | null;
  role: Role;
  reportingManagerId: string | null;
  status: UserStatus;
  permissions: string[];
  reportCode?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User | null;
  mode: "create" | "edit";
  isSubmitting?: boolean;
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

export function UserModal({ isOpen, onClose, onSubmit, user, mode, isSubmitting = false }: UserModalProps): React.ReactNode {
  const [formData, setFormData] = React.useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    department: null,
    role: rolesData[4], // Default to Employee
    reportingManagerId: null,
    status: "active",
    permissions: [],
    reportCode: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormData, string>>>({});
  const [availableManagers, setAvailableManagers] = React.useState<User[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  // Fetch available managers (all users for reporting manager dropdown)
  React.useEffect(() => {
    if (isOpen) {
      const fetchManagers = async (): Promise<void> => {
        try {
          setIsLoadingManagers(true);
          const response = await userService.getUsers({ limit: 100 });
          setAvailableManagers(response.data || []);
        } catch (error) {
          console.error("Failed to fetch managers:", error);
        } finally {
          setIsLoadingManagers(false);
        }
      };
      fetchManagers();
    }
  }, [isOpen]);

  // Initialize form data when modal opens or user changes
  React.useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          department: user.department,
          role: user.role,
          reportingManagerId: user.reportingManagerId,
          status: user.status,
          permissions: user.permissions,
          reportCode: user.reportCode || "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          department: null,
          role: rolesData[4],
          reportingManagerId: null,
          status: "active",
          permissions: [],
          reportCode: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const selectedPermissions = React.useMemo(() => new Set(formData.permissions), [formData.permissions]);

  const handleInputChange = (field: keyof UserFormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (roleCode: string): void => {
    const selectedRole = rolesData.find((r) => r.code === roleCode);
    if (selectedRole) {
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    }
  };

  const handleDepartmentChange = (deptCode: string): void => {
    if (deptCode === "none") {
      setFormData((prev) => ({ ...prev, department: null }));
    } else {
      const selectedDept = departmentsData.find((d) => d.code === deptCode);
      if (selectedDept) {
        setFormData((prev) => ({ ...prev, department: selectedDept }));
      }
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
    if (mode === "create" && !formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.reportCode?.trim()) {
      newErrors.reportCode = "Report code is required";
    } else if (!/^[A-Z0-9]+$/.test(formData.reportCode)) {
      newErrors.reportCode = "Report code must be alphanumeric uppercase";
    } else if (formData.reportCode.length > 8) {
      newErrors.reportCode = "Report code must be max 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
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

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {mode === "edit" && <span className="text-muted-foreground">(leave blank to keep current)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder={mode === "create" ? "Enter password (min 6 characters)" : "Enter new password (optional)"}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department?.code || "none"}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Department</SelectItem>
                      {departmentsData.map((dept) => (
                        <SelectItem key={dept.code} value={dept.code}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role.code} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesData.map((role) => (
                        <SelectItem key={role.code} value={role.code}>
                          {role.name} (Level {role.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reporting Manager */}
                <div className="space-y-2">
                  <Label htmlFor="reportingManager">Reporting Manager</Label>
                  <Select
                    value={formData.reportingManagerId || "none"}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, reportingManagerId: value === "none" ? null : value }))}
                    disabled={isLoadingManagers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingManagers ? "Loading..." : "Select manager"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {availableManagers.map((manager) => {
                        const managerId = manager._id || manager.id || "";
                        return (
                          <SelectItem key={managerId} value={managerId}>
                            {manager.name} ({manager.role.name})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as UserStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Report Code */}
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
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>{mode === "create" ? "Create User" : "Save Changes"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserModal;
