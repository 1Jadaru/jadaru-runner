import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import * as authService from '@/services/authService'
import { mockUser } from '@/test/test-utils'

// Mock the auth service
vi.mock('@/services/authService', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getStoredToken: vi.fn(),
  removeStoredToken: vi.fn(),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('provides initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('loads user on mount when token exists', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles login successfully', async () => {
    const loginData = { email: 'test@landlordos.co', password: 'password123' }
    const loginResponse = { user: mockUser, token: 'new-token' }

    vi.mocked(authService.login).mockResolvedValue(loginResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.login(loginData.email, loginData.password)

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(authService.login).toHaveBeenCalledWith(loginData)
  })

  it('handles login error', async () => {
    const loginError = new Error('Invalid credentials')
    vi.mocked(authService.login).mockRejectedValue(loginError)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await expect(
      result.current.login('test@landlordos.co', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials')

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles logout', async () => {
    // First login
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    // Then logout
    await result.current.logout()

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(authService.logout).toHaveBeenCalled()
  })

  it('checks permissions correctly', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    expect(result.current.hasPermission('READ_PROPERTIES')).toBe(true)
    expect(result.current.hasPermission('INVALID_PERMISSION')).toBe(false)
  })

  it('checks roles correctly', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    expect(result.current.hasRole('Administrator')).toBe(true)
    expect(result.current.hasRole('Invalid Role')).toBe(false)
  })

  it('handles organization check correctly', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    expect(result.current.hasOrganization()).toBe(true)
    expect(result.current.getOrganization()).toEqual(mockUser.organization)
  })

  it('handles missing user data gracefully', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.hasPermission('READ_PROPERTIES')).toBe(false)
    expect(result.current.hasRole('Administrator')).toBe(false)
    expect(result.current.hasOrganization()).toBe(false)
    expect(result.current.getOrganization()).toBeNull()
  })

  it('handles user update', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    const updatedUser = { ...mockUser, firstName: 'Updated' }
    result.current.updateUser(updatedUser)

    expect(result.current.user?.firstName).toBe('Updated')
  })

  it('refreshes user data', async () => {
    vi.mocked(authService.getStoredToken).mockReturnValue('mock-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    const updatedUser = { ...mockUser, firstName: 'Refreshed' }
    vi.mocked(authService.getCurrentUser).mockResolvedValue(updatedUser)

    await result.current.refreshUser()

    expect(result.current.user?.firstName).toBe('Refreshed')
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(2)
  })
})
