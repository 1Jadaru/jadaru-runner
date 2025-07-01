import { vi } from 'vitest'
import { mockUser, mockOrganization, mockProperty, mockTenant, mockLease } from './mock-data'

// Mock Auth Service
export const mockAuthService = {
  login: vi.fn().mockResolvedValue({
    user: mockUser,
    token: 'mock-token',
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  getStoredToken: vi.fn().mockReturnValue('mock-token'),
  setStoredToken: vi.fn(),
  removeStoredToken: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(mockUser),
  register: vi.fn().mockResolvedValue({
    user: mockUser,
    token: 'mock-token',
  }),
}

// Mock API Service
export const mockApiService = {
  // Properties
  getProperties: vi.fn().mockResolvedValue([mockProperty]),
  createProperty: vi.fn().mockResolvedValue(mockProperty),
  updateProperty: vi.fn().mockResolvedValue(mockProperty),
  deleteProperty: vi.fn().mockResolvedValue({ message: 'Property deleted' }),
  getProperty: vi.fn().mockResolvedValue(mockProperty),
  
  // Tenants
  getTenants: vi.fn().mockResolvedValue([mockTenant]),
  createTenant: vi.fn().mockResolvedValue(mockTenant),
  updateTenant: vi.fn().mockResolvedValue(mockTenant),
  deleteTenant: vi.fn().mockResolvedValue({ message: 'Tenant deleted' }),
  getTenant: vi.fn().mockResolvedValue(mockTenant),
  
  // Leases
  getLeases: vi.fn().mockResolvedValue([mockLease]),
  createLease: vi.fn().mockResolvedValue(mockLease),
  updateLease: vi.fn().mockResolvedValue(mockLease),
  deleteLease: vi.fn().mockResolvedValue({ message: 'Lease deleted' }),
  getLease: vi.fn().mockResolvedValue(mockLease),
  
  // Dashboard
  getDashboardOverview: vi.fn().mockResolvedValue({
    totalProperties: 5,
    totalTenants: 8,
    totalRent: 12000,
    occupancyRate: 85,
    recentActivities: [
      {
        id: '1',
        type: 'LEASE_SIGNED',
        description: 'New lease signed for 123 Main St',
        timestamp: new Date().toISOString(),
      },
    ],
  }),
  getRecentActivities: vi.fn().mockResolvedValue([
    {
      id: '1',
      type: 'LEASE_SIGNED',
      description: 'New lease signed for 123 Main St',
      timestamp: new Date().toISOString(),
    },
  ]),
  
  // Organization
  getOrganization: vi.fn().mockResolvedValue(mockOrganization),
  updateOrganization: vi.fn().mockResolvedValue(mockOrganization),
}

// Mock React Query hooks
export const mockUseQuery = vi.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
})

export const mockUseMutation = vi.fn().mockReturnValue({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isLoading: false,
  isError: false,
  error: null,
  data: undefined,
})

export const mockQueryClient = {
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
  removeQueries: vi.fn(),
  clear: vi.fn(),
}

// Mock Router hooks
export const mockUseNavigate = vi.fn()
export const mockUseLocation = vi.fn().mockReturnValue({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
})
export const mockUseParams = vi.fn().mockReturnValue({})

// Mock Auth Context
export const mockUseAuth = vi.fn().mockReturnValue({
  user: mockUser,
  isLoading: false,
  isAuthenticated: true,
  login: mockAuthService.login,
  register: mockAuthService.register,
  logout: mockAuthService.logout,
  refreshToken: vi.fn().mockResolvedValue(undefined),
  hasPermission: vi.fn().mockImplementation((permission: string) => {
    const validPermissions = [
      'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 
      'DELETE_PROPERTIES', 'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 
      'DELETE_TENANTS', 'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 
      'DELETE_LEASES', 'MANAGE_ORGANIZATION'
    ]
    return validPermissions.includes(permission)
  }),
  hasRole: vi.fn().mockImplementation((role: string) => {
    return role === 'Administrator'
  }),
  hasOrganization: vi.fn().mockReturnValue(true),
  getHighestRole: vi.fn().mockReturnValue(mockUser.userRoles[0]?.role || null),
  canAccessProperty: vi.fn().mockReturnValue(true),
})

// Mock usePermissions hook
export const mockUsePermissions = vi.fn().mockReturnValue({
  hasPermission: vi.fn().mockImplementation((permission: string) => {
    // Mock implementation: return true for valid permissions, false for invalid ones
    const validPermissions = [
      'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 
      'DELETE_PROPERTIES', 'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 
      'DELETE_TENANTS', 'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 
      'DELETE_LEASES', 'MANAGE_ORGANIZATION'
    ]
    return validPermissions.includes(permission)
  }),
  hasRole: vi.fn().mockImplementation((role: string) => {
    return role === 'Administrator'
  }),
  hasAnyPermission: vi.fn().mockImplementation((permissions: string[]) => {
    const validPermissions = [
      'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 
      'DELETE_PROPERTIES', 'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 
      'DELETE_TENANTS', 'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 
      'DELETE_LEASES', 'MANAGE_ORGANIZATION'
    ]
    return permissions.some(permission => validPermissions.includes(permission))
  }),
  hasAllPermissions: vi.fn().mockImplementation((permissions: string[]) => {
    const validPermissions = [
      'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 
      'DELETE_PROPERTIES', 'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 
      'DELETE_TENANTS', 'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 
      'DELETE_LEASES', 'MANAGE_ORGANIZATION'
    ]
    return permissions.every(permission => validPermissions.includes(permission))
  }),
  // Utility functions for common permission checks
  canCreateProperties: vi.fn(() => true),
  canEditProperties: vi.fn(() => true),
  canDeleteProperties: vi.fn(() => true),
  canManageTenants: vi.fn(() => true),
  canManageLeases: vi.fn(() => true),
  isOrganizationAdmin: vi.fn(() => true),
  canInviteUsers: vi.fn(() => false), // Not in mock permissions
  canManageProperty: vi.fn().mockReturnValue(true),
  canViewFinancials: vi.fn().mockReturnValue(true),
  canManageUsers: vi.fn().mockReturnValue(true),
  isLoading: false,
})

export const resetAllMocks = () => {
  vi.clearAllMocks()
  // Reset specific mock return values to defaults
  mockUseAuth.mockReturnValue({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: mockAuthService.login,
    register: mockAuthService.register,
    logout: mockAuthService.logout,
    refreshToken: vi.fn().mockResolvedValue(undefined),
    hasPermission: vi.fn().mockImplementation((permission: string) => {
      const validPermissions = [
        'READ_DASHBOARD', 'READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 
        'DELETE_PROPERTIES', 'READ_TENANTS', 'CREATE_TENANTS', 'UPDATE_TENANTS', 
        'DELETE_TENANTS', 'READ_LEASES', 'CREATE_LEASES', 'UPDATE_LEASES', 
        'DELETE_LEASES', 'MANAGE_ORGANIZATION'
      ]
      return validPermissions.includes(permission)
    }),
    hasRole: vi.fn().mockImplementation((role: string) => {
      return role === 'Administrator'
    }),
    hasOrganization: vi.fn().mockReturnValue(true),
    getHighestRole: vi.fn().mockReturnValue(mockUser.userRoles[0]?.role || null),
    canAccessProperty: vi.fn().mockReturnValue(true),
  })
}
