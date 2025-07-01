import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import Login from '@/pages/Login'
import * as authService from '@/services/authService'

// Mock the auth service
vi.mock('@/services/authService', () => ({
  login: vi.fn(),
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByRole('heading', { name: /sign in to landlordos/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Try to submit without filling fields
    await user.click(submitButton)
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    const mockLoginResponse = {
      user: {
        id: 'user-1',
        email: 'test@landlordos.co',
        firstName: 'Test',
        lastName: 'User',
        organization: { id: 'org-1', name: 'Test Org' },
        permissions: ['READ_DASHBOARD'],
      },
      token: 'mock-token',
    }
    
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@landlordos.co')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@landlordos.co',
        password: 'password123',
      })
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles login errors', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid email or password'
    
    vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@landlordos.co')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed response
    vi.mocked(authService.login).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@landlordos.co')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('navigates to register page when clicking sign up link', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    await user.click(signUpLink)
    
    expect(signUpLink).toHaveAttribute('href', '/register')
  })

  it('handles remember me checkbox', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i)
    
    expect(rememberMeCheckbox).not.toBeChecked()
    
    await user.click(rememberMeCheckbox)
    
    expect(rememberMeCheckbox).toBeChecked()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    // Tab through form elements
    await user.tab()
    expect(screen.getByLabelText(/email address/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByLabelText(/password/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus()
  })

  it('shows password toggle button', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByLabelText(/toggle password visibility/i)
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
