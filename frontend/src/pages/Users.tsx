import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
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
import type { UserStatus, User } from "@/types";
import { formatRelativeTime } from "@/utils";
import { useAuth } from "@/context";
import { userService } from "@/services/api.service";
import { useToast } from "@/hooks/use-toast";

// Role configuration using map-friendly object
const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
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
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Fetch users from backend
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params: { role?: string; status?: UserStatus; search?: string } = {};
      
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter as UserStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await userService.getUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, toast]);

  // Load users on mount and when filters change
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Hide current logged-in user from the list
      const userId = user._id || user.id;
      const currentUserId = currentUser?._id || currentUser?.id;
      if (currentUserId && userId === currentUserId) {
        return false;
      }
      return true;
    });
  }, [users, currentUser]);

  const handleOpenCreateModal = (): void => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User): void => {
    // Prevent self-edit - redirect to settings
    const userId = user._id || user.id;
    const currentUserId = currentUser?._id || currentUser?.id;
    if (currentUserId && userId === currentUserId) {
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

  const handleSubmit = async (data: UserFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      if (modalMode === "create") {
        await userService.createUser(data);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      } else if (selectedUser) {
        const userId = selectedUser._id || selectedUser.id;
        if (userId) {
          await userService.updateUser(userId, data);
          toast({
            title: "Success",
            description: "User updated successfully",
          });
        }
      }

      handleCloseModal();
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to save user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userId = user._id || user.id || "";
                    return (
                      <TableRow key={userId}>
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
                          <Badge variant={roleConfig[user.role.code].variant}>
                            {roleConfig[user.role.code].label}
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
                              onClick={() => handleDeleteUser(userId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default Users;
