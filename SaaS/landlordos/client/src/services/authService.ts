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

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export const dashboardService = {
  async getOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  async getFinancialSummary(year?: number) {
    const response = await api.get('/dashboard/financial-summary', {
      params: { year },
    });
    return response.data;
  },
};

export const propertyService = {
  async getProperties(params?: { page?: number; limit?: number; search?: string }) {
    const response = await api.get('/properties', { params });
    return response.data;
  },

  async getProperty(id: string) {
    const response = await api.get(`/properties/${id}`);
    return response.data;
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
};

export const expenseService = {
  async getExpenses(params?: { page?: number; limit?: number; category?: string; propertyId?: string }) {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  async createExpense(expenseData: any) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
};

export const reminderService = {
  async getReminders(completed = false) {
    const response = await api.get('/reminders', { 
      params: { completed: completed.toString() } 
    });
    return response.data;
  },

  async createReminder(reminderData: any) {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  },

  async completeReminder(id: string) {
    const response = await api.patch(`/reminders/${id}/complete`);
    return response.data;
  },
};

// Organization management service
export const organizationService = {
  // Organization operations
  async getOrganization() {
    const response = await api.get('/organization');
    return response.data;
  },

  async updateOrganization(organizationData: {
    name?: string;
    type?: string;
    settings?: Record<string, any>;
  }) {
    const response = await api.put('/organization', organizationData);
    return response.data;
  },

  // User management
  async getUsers() {
    const response = await api.get('/organization/users');
    return response.data;
  },

  async inviteUser(inviteData: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    propertyIds?: string[];
  }) {
    const response = await api.post('/organization/users/invite', inviteData);
    return response.data;
  },

  async updateUserRole(userId: string, roleData: {
    roleId: string;
    propertyIds?: string[];
  }) {
    const response = await api.put(`/organization/users/${userId}/role`, roleData);
    return response.data;
  },

  async removeUser(userId: string) {
    const response = await api.delete(`/organization/users/${userId}`);
    return response.data;
  },

  // Role management
  async getRoles() {
    const response = await api.get('/organization/roles');
    return response.data;
  },

  // Assignment management
  async getAssignments() {
    const response = await api.get('/organization/assignments');
    return response.data;
  },

  async updateAssignments(userId: string, propertyIds: string[]) {
    const response = await api.put(`/organization/assignments/${userId}`, {
      propertyIds,
    });
    return response.data;
  },

  // Audit logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/organization/audit-logs', { params });
    return response.data;
  },
};

export default api;
