import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Create placeholder mock functions for axios (will be overridden by individual tests)
const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
const mockAxiosPut = vi.fn();
const mockAxiosPatch = vi.fn();
const mockAxiosDelete = vi.fn();

// Create mock axios instance for tests that need it
const mockAxiosInstance = {
  get: mockAxiosGet,
  post: mockAxiosPost,
  put: mockAxiosPut,
  patch: mockAxiosPatch,
  delete: mockAxiosDelete,
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
  create: vi.fn(() => mockAxiosInstance),
};

// Note: Individual test files should mock axios themselves if they need to test axios integration
// This setup file focuses on mocking application-level services and contexts

// Initialize placeholder default behaviors for when tests don't override them
const setupAxiosDefaults = () => {
  // This function is now mainly for reference/documentation
  // Individual tests should set up their own axios mock responses
};

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children }: { children: React.ReactNode }) => children,
  Navigate: () => null,
}));

// Mock React Query
const mockQueryClient = {
  getQueryData: vi.fn(),
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
  clear: vi.fn(),
  mount: vi.fn(),
  unmount: vi.fn(),
  isFetching: vi.fn(() => 0),
  isMutating: vi.fn(() => 0),
  getDefaultOptions: vi.fn(() => ({})),
  setDefaultOptions: vi.fn(),
  setQueryDefaults: vi.fn(),
  getQueryDefaults: vi.fn(),
  setMutationDefaults: vi.fn(),
  getMutationDefaults: vi.fn(),
  getQueryCache: vi.fn(),
  getMutationCache: vi.fn(),
  refetchQueries: vi.fn(),
  cancelQueries: vi.fn(),
  removeQueries: vi.fn(),
  resetQueries: vi.fn(),
  fetchQuery: vi.fn(),
  prefetchQuery: vi.fn(),
  fetchInfiniteQuery: vi.fn(),
  prefetchInfiniteQuery: vi.fn(),
  ensureQueryData: vi.fn(),
  getQueriesData: vi.fn(),
  setQueriesData: vi.fn(),
  resumePausedMutations: vi.fn(),
};

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  
  return {
    ...actual,
    QueryClient: vi.fn(() => mockQueryClient),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    })),
    useQueryClient: vi.fn(() => mockQueryClient),
  }
});

// Mock Auth Service
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    verifyToken: vi.fn(),
    getStoredToken: vi.fn(),
    removeStoredToken: vi.fn(),
  },
}));

// Mock AuthContext 
vi.mock('@/contexts/AuthContext', () => {
  const mockAuth = {
    user: null,
    organization: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    updateUser: vi.fn(),
    hasPermission: vi.fn(),
    hasRole: vi.fn(),
    hasOrganization: vi.fn(),
  };

  return {
    useAuth: () => mockAuth,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock usePermissions hook
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    hasRole: vi.fn((role: string) => role === 'Administrator'),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
    hasAnyRole: vi.fn(() => true),
    canCreateProperties: vi.fn(() => true),
    canEditProperties: vi.fn(() => true),
    canDeleteProperties: vi.fn(() => true),
    canViewProperties: vi.fn(() => true),
    canCreateTenants: vi.fn(() => true),
    canEditTenants: vi.fn(() => true),
    canDeleteTenants: vi.fn(() => true),
    canViewTenants: vi.fn(() => true),
    canCreateLeases: vi.fn(() => true),
    canEditLeases: vi.fn(() => true),
    canDeleteLeases: vi.fn(() => true),
    canViewLeases: vi.fn(() => true),
    canManageUsers: vi.fn(() => true),
    canInviteUsers: vi.fn(() => false),
    canViewReports: vi.fn(() => true),
    canManageOrganization: vi.fn(() => true),
    isOrganizationAdmin: vi.fn(() => true),
    isLoading: false,
    user: null,
    permissions: ['READ_PROPERTIES', 'CREATE_PROPERTIES', 'UPDATE_PROPERTIES', 'DELETE_PROPERTIES'],
  }),
}));

// Export mock instances for use in tests
export { 
  mockAxiosInstance,
  mockAxiosGet,
  mockAxiosPost,
  mockAxiosPut,
  mockAxiosPatch,
  mockAxiosDelete,
  mockQueryClient,
  setupAxiosDefaults,
};

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
