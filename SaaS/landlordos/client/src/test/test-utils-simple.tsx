import React from 'react'
import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Simple test wrapper without complex dependencies
interface TestProvidersProps {
  children: React.ReactNode
}

function TestProviders({ children }: TestProvidersProps) {
  return (
    <MemoryRouter>
      <div data-testid="test-wrapper">
        {children}
      </div>
    </MemoryRouter>
  )
}

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options })
}

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
}

// Export everything from testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }
