import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

interface Organization {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'ENTERPRISE';
  settings?: Record<string, any>;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

interface UserRole {
  id: string;
  role: Role;
  isActive: boolean;
  assignedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  organization: Organization;
  userRoles: UserRole[];
  assignedPropertyIds?: string[];
  permissions: string[];
  // Legacy field for backwards compatibility
  tier?: 'FREE' | 'BASIC' | 'PREMIUM';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  getHighestRole: () => Role | null;
  canAccessProperty: (propertyId: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {        try {
          const userData = await authService.getProfile();
          // Ensure user has required arrays initialized
          const safeUser = {
            ...userData.user,
            permissions: userData.user.permissions || [],
            userRoles: userData.user.userRoles || [],
            assignedPropertyIds: userData.user.assignedPropertyIds || []
          };
          setUser(safeUser);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      // Ensure user has required arrays initialized
      const safeUser = {
        ...response.user,
        permissions: response.user.permissions || [],
        userRoles: response.user.userRoles || [],
        assignedPropertyIds: response.user.assignedPropertyIds || []
      };
      setUser(safeUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      // Ensure user has required arrays initialized
      const safeUser = {
        ...response.user,
        permissions: response.user.permissions || [],
        userRoles: response.user.userRoles || [],
        assignedPropertyIds: response.user.assignedPropertyIds || []
      };
      setUser(safeUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('token', response.token);
      // If the response includes updated user data, ensure it's safe
      if (response.user) {
        const safeUser = {
          ...response.user,
          permissions: response.user.permissions || [],
          userRoles: response.user.userRoles || [],
          assignedPropertyIds: response.user.assignedPropertyIds || []
        };
        setUser(safeUser);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };
  // Permission checking utilities
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user || !user.userRoles || !Array.isArray(user.userRoles)) return false;
    return user.userRoles.some(userRole => 
      userRole.isActive && userRole.role.name === roleName
    );
  };

  const getHighestRole = (): Role | null => {
    if (!user || !user.userRoles || !Array.isArray(user.userRoles) || !user.userRoles.length) return null;
    
    const activeRoles = user.userRoles
      .filter(userRole => userRole.isActive)
      .map(userRole => userRole.role);
    
    if (!activeRoles.length) return null;
    
    // Return role with highest level
    return activeRoles.reduce((highest, current) => 
      current.level > highest.level ? current : highest
    );
  };
  const canAccessProperty = (propertyId: string): boolean => {
    if (!user) return false;
    if (!propertyId) return false;
    
    // If user has no property restrictions, they can access all properties
    if (!user.assignedPropertyIds || !Array.isArray(user.assignedPropertyIds) || user.assignedPropertyIds.length === 0) {
      return true;
    }
    
    // Check if user is assigned to this specific property
    return user.assignedPropertyIds.includes(propertyId);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    getHighestRole,
    canAccessProperty,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export type { User, AuthContextType };
