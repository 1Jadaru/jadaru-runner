import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to DOM APIs', () => {
    expect(typeof document).toBe('object')
    expect(typeof window).toBe('object')
  })
})
