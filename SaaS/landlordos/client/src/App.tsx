import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardModern from './pages/DashboardModern';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Expenses from './pages/Expenses';
import Maintenance from './pages/Maintenance';
import Reminders from './pages/Reminders';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { MockAd, UpgradePrompt } from './components/ads/AdSense';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/landing" replace />;
  }
  
  return children;
};

// Main Layout Component
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="flex pt-16"> {/* Add top padding for fixed navbar */}
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Show upgrade prompt for free users */}
            {user?.tier === 'FREE' && (
              <div className="mb-6">
                <UpgradePrompt />
              </div>
            )}
            
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 min-w-0">
                {children}
              </div>
              
              {/* Sidebar ad for free users - only on desktop */}
              {user?.tier === 'FREE' && (
                <div className="hidden xl:block w-80 flex-shrink-0">
                  <div className="sticky top-8">
                    <MockAd type="sidebar" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Banner ad for free users */}
            {user?.tier === 'FREE' && (
              <div className="mt-8">
                <MockAd type="banner" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardModern />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardModern />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/properties" element={
                <ProtectedRoute>
                  <Layout>
                    <Properties />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/tenants" element={
                <ProtectedRoute>
                  <Layout>
                    <Tenants />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/leases" element={
                <ProtectedRoute>
                  <Layout>
                    <Leases />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Layout>
                    <Expenses />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/maintenance" element={
                <ProtectedRoute>
                  <Layout>
                    <Maintenance />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/reminders" element={
                <ProtectedRoute>
                  <Layout>
                    <Reminders />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
