import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '@/hooks/usePermissions'
import { AuthProvider } from '@/contexts/AuthContext'
import { mockUser } from '@/test/test-utils'
import * as authService from '@/services/authService'

// Mock the auth service
vi.mock('@/services/authService', () => ({
  getStoredToken: vi.fn(),
  getCurrentUser: vi.fn(),
}))

describe('usePermissions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('returns permissions for authenticated user', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.hasPermission('READ_PROPERTIES')).toBe(true)
    expect(result.current.hasPermission('INVALID_PERMISSION')).toBe(false)
  })

  it('returns false for unauthenticated user', () => {
    vi.mocked(authService.getStoredToken).mockReturnValue(null)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.hasPermission('READ_PROPERTIES')).toBe(false)
    expect(result.current.hasRole('Administrator')).toBe(false)
  })

  it('checks multiple permissions correctly', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(
      result.current.hasAnyPermission(['READ_PROPERTIES', 'CREATE_PROPERTIES'])
    ).toBe(true)

    expect(
      result.current.hasAllPermissions(['READ_PROPERTIES', 'CREATE_PROPERTIES'])
    ).toBe(true)

    expect(
      result.current.hasAllPermissions(['READ_PROPERTIES', 'INVALID_PERMISSION'])
    ).toBe(false)
  })

  it('checks role-based permissions', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.hasRole('Administrator')).toBe(true)
    expect(result.current.hasRole('Viewer')).toBe(false)
  })

  it('handles loading state correctly', () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.hasPermission('READ_PROPERTIES')).toBe(false)
  })

  it('provides utility functions for common permission checks', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.canCreateProperties()).toBe(true)
    expect(result.current.canEditProperties()).toBe(true)
    expect(result.current.canDeleteProperties()).toBe(true)
    expect(result.current.canManageOrganization()).toBe(true)
    expect(result.current.canViewAuditLogs()).toBe(false) // Not in mock permissions
  })

  it('handles organization-specific permissions', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePermissions(), { wrapper })

    expect(result.current.isOrganizationAdmin()).toBe(true)
    expect(result.current.canInviteUsers()).toBe(false) // Not in mock permissions
  })
})
