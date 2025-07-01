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

  async getFinancialSummary(year?: number) {
    const response = await api.get('/dashboard/financial-summary', {
      params: year ? { year } : {}
    });
    return response.data;
  },

  // Properties
  async getProperties() {
    const response = await api.get('/properties');
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

  // Tenants
  async getTenants() {
    const response = await api.get('/tenants');
    return response.data;
  },

  async createTenant(tenantData: any) {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },

  async updateTenant(id: string, tenantData: any) {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  async deleteTenant(id: string) {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },

  // Leases
  async getLeases() {
    const response = await api.get('/leases');
    return response.data;
  },

  async createLease(leaseData: any) {
    const response = await api.post('/leases', leaseData);
    return response.data;
  },

  async updateLease(id: string, leaseData: any) {
    const response = await api.put(`/leases/${id}`, leaseData);
    return response.data;
  },

  async deleteLease(id: string) {
    const response = await api.delete(`/leases/${id}`);
    return response.data;
  },

  // Expenses
  async getExpenses() {
    const response = await api.get('/expenses');
    return response.data;
  },

  async createExpense(expenseData: any) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  async updateExpense(id: string, expenseData: any) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  async deleteExpense(id: string) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Maintenance
  async getMaintenanceRequests() {
    const response = await api.get('/maintenance');
    return response.data;
  },

  async createMaintenanceRequest(maintenanceData: any) {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },

  async updateMaintenanceRequest(id: string, maintenanceData: any) {
    const response = await api.put(`/maintenance/${id}`, maintenanceData);
    return response.data;
  },

  async deleteMaintenanceRequest(id: string) {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },

  // Reminders
  async getReminders() {
    const response = await api.get('/reminders');
    return response.data;
  },

  async createReminder(reminderData: any) {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  },

  async updateReminder(id: string, reminderData: any) {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  },

  async deleteReminder(id: string) {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },

  // Recent Activities
  async getRecentActivities() {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },

  // Organization
  async getOrganization() {
    const response = await api.get('/organization');
    return response.data;
  },

  async updateOrganization(updateData: any) {
    const response = await api.put('/organization', updateData);
    return response.data;
  },
};
