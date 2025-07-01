import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { TestProviders } from './TestProviders'

// Custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options })
}

// Export everything from testing-library/react
export * from '@testing-library/react'

// Override render method
export { renderWithProviders as render }
