import { createContext, type ReactNode } from 'react'
import { vi } from 'vitest'

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
  tier?: 'FREE' | 'BASIC' | 'PREMIUM';
}

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@landlordos.co',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  tier: 'FREE',
  organization: {
    id: 'test-org-id',
    name: 'Test Organization',
    type: 'INDIVIDUAL',
    settings: {},
    createdAt: new Date().toISOString(),
  },
  userRoles: [
    {
      id: 'test-role-id',
      role: {
        id: 'admin-role-id',
        name: 'Administrator',
        level: 100,
        permissions: ['all'],
      },
      isActive: true,
      assignedAt: new Date().toISOString(),
    },
  ],
  permissions: [
    'READ_DASHBOARD',
    'READ_PROPERTIES',
    'CREATE_PROPERTIES',
    'UPDATE_PROPERTIES',
    'DELETE_PROPERTIES',
    'READ_TENANTS',
    'CREATE_TENANTS',
    'UPDATE_TENANTS',
    'DELETE_TENANTS',
    'READ_LEASES',
    'CREATE_LEASES',
    'UPDATE_LEASES',
    'DELETE_LEASES',
    'MANAGE_ORGANIZATION',
  ],
  assignedPropertyIds: ['prop-1', 'prop-2'],
}

// Mock auth context value
export const mockAuthContextValue = {
  user: null,
  loading: false,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockImplementation(() => {}),
  refreshToken: vi.fn().mockResolvedValue(undefined),
  hasPermission: vi.fn().mockReturnValue(true),
  hasRole: vi.fn().mockReturnValue(true),
  getHighestRole: vi.fn().mockReturnValue(mockUser.userRoles[0].role),
  canAccessProperty: vi.fn().mockReturnValue(true),
}

// Create mock context
export const MockAuthContext = createContext(mockAuthContextValue)

// Mock AuthProvider component
export function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthContext.Provider value={mockAuthContextValue}>
      {children}
    </MockAuthContext.Provider>
  )
}
