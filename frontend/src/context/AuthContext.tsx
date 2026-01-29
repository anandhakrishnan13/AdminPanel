import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { User, LoginCredentials } from '@/types';

// Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider Component
export const AuthProvider = ({ children }: AuthProviderProps): ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = useMemo(() => user !== null, [user]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock login for demo - replace with actual API call
      if (credentials.email === "superadmin@company.com" && credentials.password === "password123") {
        const mockUser: User = {
          id: "user_1",
          name: "John Super Admin",
          email: "superadmin@company.com",
          role: "SUPER_ADMIN",
          roleId: "role_1",
          departmentId: null,
          reportingManagerId: null,
          status: "active",
          lastLogin: new Date().toISOString(),
          permissions: ["*"],
          avatar: null,
          reportCode: "SA7X9K2M",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    // TODO: Clear tokens, redirect, etc.
  }, []);

  const updateUser = useCallback((updates: Partial<User>): void => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  }), [user, isAuthenticated, isLoading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
