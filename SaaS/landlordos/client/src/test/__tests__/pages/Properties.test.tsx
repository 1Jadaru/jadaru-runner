import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockProperty, mockUser } from '@/test/test-utils'
import Properties from '@/pages/Properties'
import * as apiService from '@/services/apiService'

// Mock the API service
vi.mock('@/services/apiService', () => ({
  getProperties: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
}))

// Mock react-query
const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => mockUseQuery(),
  useMutation: () => mockUseMutation(),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}))

describe('Properties Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default successful query response
    mockUseQuery.mockReturnValue({
      data: [mockProperty],
      isLoading: false,
      error: null,
    })
    
    // Default mutation response
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    })
  })

  it('renders properties list correctly', async () => {
    render(<Properties />)

    expect(screen.getByRole('heading', { name: /properties/i })).toBeInTheDocument()
    expect(screen.getByText(mockProperty.address)).toBeInTheDocument()
    expect(screen.getByText(`$${mockProperty.monthlyRent}`)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<Properties />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    const errorMessage = 'Failed to load properties'
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    })

    render(<Properties />)

    expect(screen.getByText(/error/i)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('shows empty state when no properties', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<Properties />)

    expect(screen.getByText(/no properties found/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add your first property/i })).toBeInTheDocument()
  })

  it('opens create property modal', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    const addButton = screen.getByRole('button', { name: /add property/i })
    await user.click(addButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /add new property/i })).toBeInTheDocument()
  })

  it('handles property creation', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    })

    render(<Properties />)

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add property/i })
    await user.click(addButton)

    // Fill out form
    await user.type(screen.getByLabelText(/address/i), '456 New Street')
    await user.type(screen.getByLabelText(/city/i), 'New City')
    await user.type(screen.getByLabelText(/state/i), 'NY')
    await user.type(screen.getByLabelText(/zip code/i), '54321')
    await user.type(screen.getByLabelText(/monthly rent/i), '2000')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save property/i })
    await user.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith({
      address: '456 New Street',
      city: 'New City',
      state: 'NY',
      zipCode: '54321',
      monthlyRent: 2000,
      type: 'RESIDENTIAL',
      isActive: true,
    })
  })

  it('validates required fields in create form', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add property/i })
    await user.click(addButton)

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save property/i })
    await user.click(submitButton)

    expect(screen.getByText(/address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/monthly rent is required/i)).toBeInTheDocument()
  })

  it('opens edit property modal', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    const editButton = screen.getByLabelText(/edit property/i)
    await user.click(editButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /edit property/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockProperty.address)).toBeInTheDocument()
  })

  it('handles property deletion with confirmation', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    })

    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(<Properties />)

    const deleteButton = screen.getByLabelText(/delete property/i)
    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to delete')
    )
    expect(mockMutate).toHaveBeenCalledWith(mockProperty.id)
  })

  it('cancels property deletion when not confirmed', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    })

    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false)

    render(<Properties />)

    const deleteButton = screen.getByLabelText(/delete property/i)
    await user.click(deleteButton)

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('filters properties by search term', async () => {
    const user = userEvent.setup()
    const properties = [
      { ...mockProperty, id: '1', address: '123 Main St' },
      { ...mockProperty, id: '2', address: '456 Oak Ave' },
    ]

    mockUseQuery.mockReturnValue({
      data: properties,
      isLoading: false,
      error: null,
    })

    render(<Properties />)

    const searchInput = screen.getByPlaceholderText(/search properties/i)
    await user.type(searchInput, 'Main')

    // Should show only the matching property
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
    expect(screen.queryByText('456 Oak Ave')).not.toBeInTheDocument()
  })

  it('sorts properties by different criteria', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    const sortSelect = screen.getByLabelText(/sort by/i)
    await user.selectOptions(sortSelect, 'rent-high')

    // Should trigger re-sorting of properties
    expect(sortSelect).toHaveValue('rent-high')
  })

  it('shows property details in expanded view', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    const viewButton = screen.getByLabelText(/view property details/i)
    await user.click(viewButton)

    expect(screen.getByText(`${mockProperty.bedrooms} bed`)).toBeInTheDocument()
    expect(screen.getByText(`${mockProperty.bathrooms} bath`)).toBeInTheDocument()
    expect(screen.getByText(`${mockProperty.squareFootage} sq ft`)).toBeInTheDocument()
  })

  it('handles permission-based UI rendering', () => {
    // Test when user doesn't have create permission
    const limitedUser = {
      ...mockUser,
      permissions: ['READ_PROPERTIES'], // No CREATE_PROPERTIES
    }

    render(<Properties />, { 
      initialEntries: ['/properties'],
      user: limitedUser 
    })

    expect(screen.queryByRole('button', { name: /add property/i })).not.toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Properties />)

    // Tab through interactive elements
    await user.tab()
    expect(screen.getByPlaceholderText(/search properties/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/sort by/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: /add property/i })).toHaveFocus()
  })

  it('shows loading state for mutations', async () => {
    const user = userEvent.setup()
    
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isLoading: true,
      error: null,
    })

    render(<Properties />)

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add property/i })
    await user.click(addButton)

    const submitButton = screen.getByRole('button', { name: /saving/i })
    expect(submitButton).toBeDisabled()
  })
})
