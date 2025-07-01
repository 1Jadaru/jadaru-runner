import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

function SimpleComponent() {
  return <div data-testid="simple">Hello World</div>
}

describe('Simple React Test', () => {
  it('should render a simple component', () => {
    render(<SimpleComponent />)
    expect(screen.getByTestId('simple')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
