import React from 'react'
import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@landlordos.co',
  firstName: 'Test',
  lastName: 'User',
  phone: '555-0123',
  avatar: null,
  tier: 'FREE' as const,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  organizationId: 'test-org-id',
  organization: {
    id: 'test-org-id',
    name: 'Test Organization',
    type: 'INDIVIDUAL_LANDLORD' as const,
    settings: null,
    createdAt: new Date().toISOString(),
  },
  userRoles: [
    {
      id: 'test-role-id',
      role: {
        id: 'admin-role-id',
        name: 'Administrator',
        permissions: ['all'],
      },
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

export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  type: 'INDIVIDUAL_LANDLORD' as const,
  settings: null,
  createdAt: new Date().toISOString(),
}

export const mockProperty = {
  id: 'prop-1',
  address: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  type: 'RESIDENTIAL' as const,
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1200,
  monthlyRent: 1500,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  organizationId: 'test-org-id',
}

export const mockTenant = {
  id: 'tenant-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-0123',
  emergencyContact: 'Jane Doe - 555-0124',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  organizationId: 'test-org-id',
}

export const mockLease = {
  id: 'lease-1',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  monthlyRent: 1500,
  securityDeposit: 1500,
  status: 'ACTIVE' as const,
  terms: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  propertyId: 'prop-1',
  tenantId: 'tenant-1',
  property: mockProperty,
  tenant: mockTenant,
}

// Mock auth context value
export const mockAuthContextValue = {
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
  isInOrganization: vi.fn(() => true),
  updateUser: vi.fn(),
  refreshUser: vi.fn(),
  canManageProperty: vi.fn(() => true),
  canViewFinancials: vi.fn(() => true),
  canManageUsers: vi.fn(() => true),
}

// Create test wrapper with all providers
interface TestProvidersProps {
  children: React.ReactNode
}

function TestProviders({ children }: TestProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <div data-testid="mock-auth-provider">
          {children}
        </div>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options })
}

// Export everything from testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }
