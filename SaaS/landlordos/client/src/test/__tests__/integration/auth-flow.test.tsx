import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import App from '@/App'
import * as authService from '@/services/authService'
import * as apiService from '@/services/apiService'

// Mock services
vi.mock('@/services/authService')
vi.mock('@/services/apiService')

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth state
    vi.mocked(authService.getStoredToken).mockReturnValue(null)
  })

  it('completes full login to dashboard flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful login
    const mockUser = {
      id: 'user-1',
      email: 'test@landlordos.co',
      firstName: 'Test',
      lastName: 'User',
      organization: { id: 'org-1', name: 'Test Org' },
      permissions: ['READ_DASHBOARD', 'READ_PROPERTIES'],
    }
    
    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      token: 'test-token',
    })
    
    vi.mocked(apiService.getDashboardOverview).mockResolvedValue({
      totalProperties: 5,
      totalTenants: 8,
      monthlyRevenue: 15000,
    })

    render(<App />)

    // Should start at login page
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()

    // Fill and submit login form
    await user.type(screen.getByLabelText(/email/i), 'test@landlordos.co')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should navigate to dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })

    // Dashboard should show user data
    expect(screen.getByText(/5/)).toBeInTheDocument() // Total properties
    expect(screen.getByText(/8/)).toBeInTheDocument() // Total tenants
  })

  it('handles authentication errors gracefully', async () => {
    const user = userEvent.setup()
    
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid email or password')
    )

    render(<App />)

    await user.type(screen.getByLabelText(/email/i), 'test@landlordos.co')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })

    // Should remain on login page
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('persists authentication across page refresh', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@landlordos.co',
      firstName: 'Test',
      lastName: 'User',
      organization: { id: 'org-1', name: 'Test Org' },
      permissions: ['READ_DASHBOARD'],
    }

    // Mock existing token
    vi.mocked(authService.getStoredToken).mockReturnValue('existing-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    render(<App />)

    // Should automatically load user and navigate to dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })
  })

  it('logs out user and redirects to login', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: 'user-1',
      email: 'test@landlordos.co',
      firstName: 'Test',
      lastName: 'User',
      organization: { id: 'org-1', name: 'Test Org' },
      permissions: ['READ_DASHBOARD'],
    }

    // Start with authenticated user
    vi.mocked(authService.getStoredToken).mockReturnValue('existing-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })

    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    })
  })
})
