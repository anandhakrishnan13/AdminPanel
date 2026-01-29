import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserModal, type UserFormData } from "@/components/UserModal";
import type { RoleCode, UserStatus, User } from "@/types";
import { formatRelativeTime } from "@/utils";
import { useAuth } from "@/context";

// Generate unique alphanumeric report code
const generateReportCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Dummy user data with reportCode
const initialUsers: User[] = [
  { id: "user_1", name: "John Super Admin", email: "superadmin@company.com", role: "SUPER_ADMIN", roleId: "role_1", departmentId: null, reportingManagerId: null, status: "active", lastLogin: "2024-01-15T10:30:00Z", permissions: ["*"], avatar: null, reportCode: "SA7X9K2M", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-15T10:30:00Z" },
  { id: "user_2", name: "Jane Admin", email: "admin@company.com", role: "ADMIN", roleId: "role_2", departmentId: null, reportingManagerId: "user_1", status: "active", lastLogin: "2024-01-15T09:00:00Z", permissions: ["dashboard", "users", "users.view", "users.create"], avatar: null, reportCode: "AD3K8L1P", createdAt: "2024-01-02T00:00:00Z", updatedAt: "2024-01-15T09:00:00Z" },
  { id: "user_3", name: "Robert Engineering Head", email: "hod.engineering@company.com", role: "HOD", roleId: "role_3", departmentId: "dept_1", reportingManagerId: "user_2", status: "active", lastLogin: "2024-01-14T16:00:00Z", permissions: ["dashboard", "users", "users.view"], avatar: null, reportCode: "EH5N2W8Q", createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-14T16:00:00Z" },
  { id: "user_4", name: "Sarah Tech Manager", email: "manager.tech@company.com", role: "MANAGER", roleId: "role_4", departmentId: "dept_1", reportingManagerId: "user_3", status: "active", lastLogin: "2024-01-15T08:00:00Z", permissions: ["dashboard", "dashboard.view"], avatar: null, reportCode: "TM9R4Y6J", createdAt: "2024-01-04T00:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "user_5", name: "Mike Developer", email: "mike.dev@company.com", role: "EMPLOYEE", roleId: "role_5", departmentId: "dept_1", reportingManagerId: "user_4", status: "active", lastLogin: "2024-01-15T07:30:00Z", permissions: ["dashboard"], avatar: null, reportCode: "DV2T7H3F", createdAt: "2024-01-05T00:00:00Z", updatedAt: "2024-01-15T07:30:00Z" },
  { id: "user_6", name: "Lisa HR Head", email: "hod.hr@company.com", role: "HOD", roleId: "role_3", departmentId: "dept_2", reportingManagerId: "user_2", status: "active", lastLogin: "2024-01-13T14:00:00Z", permissions: ["dashboard", "users"], avatar: null, reportCode: "HR8C1M5Z", createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-13T14:00:00Z" },
  { id: "user_7", name: "David Finance Head", email: "hod.finance@company.com", role: "HOD", roleId: "role_3", departmentId: "dept_3", reportingManagerId: "user_2", status: "inactive", lastLogin: "2024-01-10T12:00:00Z", permissions: ["dashboard", "reports"], avatar: null, reportCode: "FH4P9S2B", createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-10T12:00:00Z" },
  { id: "user_8", name: "Emma Marketing Head", email: "hod.marketing@company.com", role: "HOD", roleId: "role_3", departmentId: "dept_4", reportingManagerId: "user_1", status: "active", lastLogin: "2024-01-15T11:00:00Z", permissions: ["dashboard", "dashboard.analytics"], avatar: null, reportCode: "MH6L3K8N", createdAt: "2024-01-03T00:00:00Z", updatedAt: "2024-01-15T11:00:00Z" },
  { id: "user_9", name: "Alex Campaign Manager", email: "manager.campaign@company.com", role: "MANAGER", roleId: "role_4", departmentId: "dept_4", reportingManagerId: "user_8", status: "active", lastLogin: "2024-01-14T09:00:00Z", permissions: ["dashboard"], avatar: null, reportCode: "CM1W7V4D", createdAt: "2024-01-06T00:00:00Z", updatedAt: "2024-01-14T09:00:00Z" },
  { id: "user_10", name: "Chris Content Writer", email: "chris.content@company.com", role: "EMPLOYEE", roleId: "role_5", departmentId: "dept_4", reportingManagerId: "user_9", status: "inactive", lastLogin: "2024-01-01T10:00:00Z", permissions: [], avatar: null, reportCode: "CW5X2G9R", createdAt: "2024-01-07T00:00:00Z", updatedAt: "2024-01-01T10:00:00Z" },
];

// Role configuration using map-friendly object
const roleConfig: Record<RoleCode, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  SUPER_ADMIN: { label: "Super Admin", variant: "default" },
  ADMIN: { label: "Admin", variant: "secondary" },
  HOD: { label: "Head of Dept", variant: "outline" },
  MANAGER: { label: "Manager", variant: "outline" },
  EMPLOYEE: { label: "Employee", variant: "outline" },
};

// Table columns for DRY rendering
const tableColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "lastLogin", label: "Last Login" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
] as const;

// Filter options
const filterOptions = {
  roles: [
    { value: "all", label: "All Roles" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "HOD", label: "Head of Dept" },
    { value: "MANAGER", label: "Manager" },
    { value: "EMPLOYEE", label: "Employee" },
  ],
  statuses: [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
};

export function Users(): React.ReactNode {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Hide current logged-in user from the list
      if (currentUser && user.id === currentUser.id) {
        return false;
      }
      
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter, currentUser]);

  const handleOpenCreateModal = (): void => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User): void => {
    // Prevent self-edit - redirect to settings
    if (currentUser && user.id === currentUser.id) {
      navigate("/settings");
      return;
    }
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = (data: UserFormData): void => {
    if (modalMode === "create") {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        roleId: `role_${data.role.toLowerCase()}`,
        departmentId: data.departmentId,
        reportingManagerId: data.reportingManagerId,
        status: data.status,
        lastLogin: null,
        permissions: data.permissions,
        avatar: null,
        reportCode: data.reportCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
    } else if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: data.name,
                email: data.email,
                role: data.role,
                departmentId: data.departmentId,
                reportingManagerId: data.reportingManagerId,
                status: data.status,
                permissions: data.permissions,
                reportCode: data.reportCode,
                updatedAt: new Date().toISOString(),
              }
            : u
        )
      );
    }
  };

  const handleDeleteUser = (userId: string): void => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const formatLastLogin = (lastLogin: string | null): string => {
    if (!lastLogin) return "Never";
    return formatRelativeTime(lastLogin);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users and their permissions</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.roles.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.statuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleConfig[user.role].variant}>
                          {roleConfig[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatLastLogin(user.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* User Modal (Create/Edit) */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}

export default Users;
