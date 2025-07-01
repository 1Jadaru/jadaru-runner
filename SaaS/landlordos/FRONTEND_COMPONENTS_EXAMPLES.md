# Frontend Components Examples

This file contains examples of key React components for the LandlordOS frontend.

## Directory Structure
```
client/src/
├── components/
│   ├── ui/
│   │   ├── LoadingSpinner.tsx
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── forms/
│       ├── PropertyForm.tsx
│       └── LoginForm.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Properties.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── apiService.ts
│   └── authService.ts
├── hooks/
│   └── useAuth.ts
└── types/
    └── index.ts
```

## Key Components

### 1. AuthContext.tsx
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData.user);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. apiService.ts
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getDashboardOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Properties
  async getProperties() {
    const response = await api.get('/properties');
    return response.data.properties;
  },

  async createProperty(propertyData: any) {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  async updateProperty(id: string, propertyData: any) {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  async deleteProperty(id: string) {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  async getProperty(id: string) {
    const response = await api.get(`/properties/${id}`);
    return response.data.property;
  },

  // Tenants
  async getTenants() {
    const response = await api.get('/tenants');
    return response.data.tenants;
  },

  async createTenant(tenantData: any) {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },

  // Leases
  async getLeases() {
    const response = await api.get('/leases');
    return response.data.leases;
  },

  async createLease(leaseData: any) {
    const response = await api.post('/leases', leaseData);
    return response.data;
  },

  // Expenses
  async getExpenses() {
    const response = await api.get('/expenses');
    return response.data.expenses;
  },

  async createExpense(expenseData: any) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Maintenance
  async getMaintenanceTasks() {
    const response = await api.get('/maintenance');
    return response.data.tasks;
  },

  async createMaintenanceTask(taskData: any) {
    const response = await api.post('/maintenance', taskData);
    return response.data;
  },
};
```

### 3. Dashboard.tsx
```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building, Users, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  activeLeases: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingMaintenance: number;
  upcomingRentDue: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName}! Here's an overview of your properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Properties"
          value={stats?.totalProperties || 0}
          icon={Building}
          color="text-blue-600"
        />
        <StatsCard
          title="Active Leases"
          value={stats?.activeLeases || 0}
          icon={Users}
          color="text-green-600"
        />
        <StatsCard
          title="Monthly Income"
          value={`$${(stats?.monthlyIncome || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-emerald-600"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${(stats?.monthlyExpenses || 0).toLocaleString()}`}
          icon={TrendingDown}
          color="text-red-600"
        />
      </div>

      {/* Additional dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingTasks />
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const RecentActivity: React.FC = () => (
  <div className="bg-white shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
      <div className="mt-5">
        <div className="text-sm text-gray-500">No recent activity</div>
      </div>
    </div>
  </div>
);

const UpcomingTasks: React.FC = () => (
  <div className="bg-white shadow rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Tasks</h3>
      <div className="mt-5">
        <div className="text-sm text-gray-500">No upcoming tasks</div>
      </div>
    </div>
  </div>
);

export default Dashboard;
```

### 4. Properties.tsx (Corrected Version)
```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, Building, MapPin, Edit, Trash2 } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'SINGLE_FAMILY' | 'DUPLEX' | 'CONDO' | 'TOWNHOUSE' | 'APARTMENT' | 'OTHER';
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  purchasePrice?: number;
  currentValue?: number;
  mortgage?: number;
  createdAt: string;
  updatedAt: string;
}

const Properties: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'SINGLE_FAMILY' as Property['type'],
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    purchasePrice: 0,
    currentValue: 0,
    mortgage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const { data: properties, isLoading: propertiesLoading, error } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => apiService.getProperties(),
  });

  const createPropertyMutation = useMutation({
    mutationFn: (newProperty: typeof formData) => apiService.createProperty(newProperty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowAddForm(false);
      setFormData({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'SINGLE_FAMILY' as Property['type'],
        bedrooms: 0,
        bathrooms: 0,
        squareFeet: 0,
        purchasePrice: 0,
        currentValue: 0,
        mortgage: 0,
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => apiService.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createPropertyMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deletePropertyMutation.mutateAsync(propertyId);
    }
  };

  if (propertiesLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading properties</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </button>
      </div>

      {showAddForm && (
        <PropertyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => setShowAddForm(false)}
          isLoading={isLoading}
        />
      )}

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddProperty={() => setShowAddForm(true)} />
      )}
    </div>
  );
};

// Property Form Component
interface PropertyFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Property</h2>
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Address"
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Main Street"
        />
        <FormField
          label="City"
          type="text"
          required
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          placeholder="City"
        />
        <FormField
          label="State"
          type="text"
          required
          maxLength={2}
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
          placeholder="CA"
        />
        <FormField
          label="Zip Code"
          type="text"
          required
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          placeholder="12345"
        />
        {/* Add more form fields as needed */}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Property'}
        </button>
      </div>
    </form>
  </div>
);

// Form Field Component
interface FormFieldProps {
  label: string;
  type: string;
  required?: boolean;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  type, 
  required, 
  value, 
  onChange, 
  placeholder,
  maxLength 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      required={required}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
    />
  </div>
);

// Property Card Component
interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete }) => (
  <div className="bg-white shadow rounded-lg">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Building className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{property.address}</h3>
            <p className="text-sm text-gray-500">{property.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-blue-600">
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(property.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          {property.city}, {property.state} {property.zipCode}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {property.bedrooms && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {property.bathrooms} bath
            </span>
          )}
          {property.squareFeet && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {property.squareFeet} sq ft
            </span>
          )}
        </div>
        {property.currentValue && (
          <p className="mt-3 text-sm text-gray-600">Value: ${property.currentValue.toLocaleString()}</p>
        )}
      </div>
    </div>
  </div>
);

// Empty State Component
interface EmptyStateProps {
  onAddProperty: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProperty }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="text-center">
      <Building className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by adding your first property.</p>
      <div className="mt-6">
        <button
          onClick={onAddProperty}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </button>
      </div>
    </div>
  </div>
);

export default Properties;
```

### 5. Main App.tsx
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Login from './pages/Login';
import Register from './pages/Register';
import LoadingSpinner from './components/ui/LoadingSpinner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default App;
```

This covers the essential frontend components needed to recreate the LandlordOS application. Each component follows React best practices and integrates with the backend API we've built.
