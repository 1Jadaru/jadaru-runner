# Frontend Testing Implementation Guide

## Quick Start

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:pages         # Page component tests
npm run test:contexts      # Context provider tests

# Development mode
npm run test:watch         # Watch mode for development
npm run test:ui            # Interactive test UI

# Coverage and CI
npm run test:coverage      # Generate coverage report
npm run test:ci            # CI-optimized test run
```

### Test Structure

```
src/test/
├── setup.ts                 # Test environment configuration
├── test-utils.tsx           # Custom render functions and mocks
├── mocks/                   # Mock data and services
└── __tests__/               # Test files
    ├── components/          # Component unit tests
    ├── hooks/               # Custom hook tests
    ├── pages/               # Page component tests
    ├── services/            # API service tests
    ├── contexts/            # Context provider tests
    ├── utils/               # Utility function tests
    └── integration/         # Integration tests
```

## Test Categories Implemented

### ✅ Authentication Tests
- **Login Component** (`Login.test.tsx`)
  - Form validation
  - Success/error handling
  - Loading states
  - Keyboard navigation
  - Password visibility toggle

- **AuthContext** (`AuthContext.test.tsx`)
  - Authentication state management
  - Login/logout flows
  - Permission checking
  - Role verification
  - Token persistence

### ✅ Page Component Tests
- **Properties Page** (`Properties.test.tsx`)
  - CRUD operations
  - Search and filtering
  - Permission-based UI
  - Loading/error states
  - Form validation

### ✅ Service Layer Tests
- **API Service** (`apiService.test.ts`)
  - HTTP request handling
  - Error handling (401, 403, 404, 500)
  - Request/response interceptors
  - Authentication headers
  - Network error handling

### ✅ Integration Tests
- **Authentication Flow** (`auth-flow.test.tsx`)
  - Complete login to dashboard flow
  - Authentication persistence
  - Error handling
  - Logout functionality

## Mock Data and Utilities

### Test Utilities (`test-utils.tsx`)
- Custom render function with all providers
- Mock user data
- Mock organization data
- Mock properties, tenants, leases
- Provider wrapper for testing

### Environment Setup (`setup.ts`)
- JSDOM configuration
- Global mocks (ResizeObserver, IntersectionObserver)
- localStorage/sessionStorage mocks
- window.matchMedia mock
- React Testing Library extensions

## Writing New Tests

### Component Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import YourComponent from '@/components/YourComponent'

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)
    
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Service Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { yourService } from '@/services/yourService'

vi.mock('axios', () => ({
  default: {
    create: () => mockAxios,
  },
}))

describe('YourService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    mockAxios.get.mockResolvedValue({ data: mockData })
    
    const result = await yourService.getData()
    
    expect(mockAxios.get).toHaveBeenCalledWith('/endpoint')
    expect(result).toEqual(mockData)
  })
})
```

## Coverage Requirements

### Current Coverage Goals
- **Statements**: 80% minimum
- **Branches**: 75% minimum  
- **Functions**: 80% minimum
- **Lines**: 80% minimum

### Coverage Exclusions
- Test files (`*.test.ts`, `*.test.tsx`)
- Configuration files (`*.config.*`)
- Type declarations (`*.d.ts`)
- Development utilities

## Continuous Integration

### GitHub Actions Workflow
The project includes a comprehensive CI/CD pipeline:

1. **Code Quality**: ESLint, TypeScript checks
2. **Unit Tests**: Component and service tests
3. **Integration Tests**: User workflow tests
4. **Build Verification**: Successful build generation
5. **Security Audit**: Dependency vulnerability checks
6. **Accessibility Testing**: WCAG compliance checks

### Quality Gates
- All tests must pass
- Code coverage above thresholds
- No ESLint errors
- TypeScript compilation success
- No high/critical security vulnerabilities

## Test Data Management

### Mock Data Strategy
- Realistic but anonymized data
- Consistent relationships between entities
- Edge cases and error scenarios
- Performance testing datasets

### Mock Service Responses
```typescript
// Example mock responses
const mockSuccessResponse = { data: { user: mockUser } }
const mockErrorResponse = { 
  response: { 
    status: 400, 
    data: { message: 'Validation error' } 
  } 
}
```

## Accessibility Testing

### Automated Checks
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios
- ARIA attributes
- Focus management

### Manual Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader announces content correctly
- [ ] Color is not the only way to convey information
- [ ] Text has sufficient contrast
- [ ] Form fields have proper labels

## Performance Testing

### Bundle Size Monitoring
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/
```

### Component Performance
- Render time measurement
- Memory usage monitoring
- Large dataset handling
- Re-render optimization

## Debugging Tests

### Common Issues and Solutions

1. **Tests failing in CI but passing locally**
   ```bash
   # Run tests in same environment as CI
   npm run test:ci
   ```

2. **Mock not working correctly**
   ```typescript
   // Ensure mocks are cleared between tests
   beforeEach(() => {
     vi.clearAllMocks()
   })
   ```

3. **Async operation not completing**
   ```typescript
   // Use waitFor for async operations
   await waitFor(() => {
     expect(screen.getByText('Updated')).toBeInTheDocument()
   })
   ```

### Debug Commands
```bash
# Run specific test file
npx vitest run src/test/__tests__/components/Login.test.tsx

# Run tests in debug mode
npx vitest --inspect-brk

# View test coverage for specific files
npx vitest run --coverage --reporter=html
```

## Test Maintenance

### Regular Tasks
- [ ] Update mock data when API changes
- [ ] Review and update test assertions
- [ ] Remove obsolete tests
- [ ] Add tests for new features
- [ ] Monitor and fix flaky tests

### Review Checklist
- [ ] Tests cover happy path and error cases
- [ ] Mock data reflects real API responses
- [ ] Accessibility requirements tested
- [ ] Performance impact considered
- [ ] Documentation updated

## Future Enhancements

### Planned Additions
- [ ] Visual regression testing with Percy/Chromatic
- [ ] Cross-browser testing with BrowserStack
- [ ] Mobile device testing
- [ ] Load testing with k6
- [ ] Contract testing with Pact

### Tools to Evaluate
- [ ] Storybook for component documentation
- [ ] MSW for more realistic API mocking
- [ ] Playwright for E2E testing
- [ ] Jest Image Snapshot for visual testing

## Getting Help

### Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Team Guidelines
- Write tests before or alongside feature development
- Test user behavior, not implementation details
- Keep tests simple and focused
- Use descriptive test names
- Review test coverage in PRs

This comprehensive test implementation provides a solid foundation for maintaining high code quality and preventing regressions in the LandlordOS frontend application.
