import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';
import { Plus, User, Mail, Phone, Edit, Trash2, MapPin, Users } from 'lucide-react';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
  currentProperty?: {
    address: string;
    city: string;
    state: string;
  };
  currentRent?: number;
  isActive: boolean;
}

const Tenants: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const { data: tenantsResponse, isLoading: tenantsLoading, error } = useQuery<{ tenants: Tenant[] }>({
    queryKey: ['tenants'],
    queryFn: () => apiService.getTenants(),
  });

  const tenants = tenantsResponse?.tenants || [];

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
    });
  };

  const createTenantMutation = useMutation({
    mutationFn: (newTenant: typeof formData) => apiService.createTenant(newTenant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAddForm(false);
      resetForm();
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) => 
      apiService.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setShowEditForm(false);
      setEditingTenant(null);
      resetForm();
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (tenantId: string) => apiService.deleteTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTenant) {
        await updateTenantMutation.mutateAsync({ 
          id: editingTenant.id, 
          data: formData 
        });
      } else {
        await createTenantMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      emergencyContact: tenant.emergencyContact || '',
      emergencyPhone: tenant.emergencyPhone || '',
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      await deleteTenantMutation.mutateAsync(tenantId);
    }
  };

  if (tenantsLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading tenants</div>;
  return (
    <div className="space-y-6">
      {/* Organization Info */}
      {user && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.organization.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.userRoles.map(ur => ur.role.name).join(', ')}
                  {user.assignedPropertyIds && user.assignedPropertyIds.length > 0 && 
                    ` • ${user.assignedPropertyIds.length} assigned properties`
                  }
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {user.organization.type}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <PermissionGuard permission={PERMISSIONS.CREATE_TENANTS}>
          <button
            onClick={() => {
              setShowAddForm(true);
              setShowEditForm(false);
              setEditingTenant(null);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </button>
        </PermissionGuard>
      </div>      {/* Add/Edit Tenant Form */}
      {(showAddForm || showEditForm) && (
        <PermissionGuard permission={editingTenant ? PERMISSIONS.UPDATE_TENANTS : PERMISSIONS.CREATE_TENANTS}>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingTenant(null);
                  resetForm();
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {isLoading 
                  ? (editingTenant ? 'Updating...' : 'Creating...') 
                  : (editingTenant ? 'Update Tenant' : 'Create Tenant')
                }
              </button>            </div>
          </form>
        </div>
        </PermissionGuard>
      )}

      {/* Tenants List */}
      {tenants && tenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {tenant.firstName} {tenant.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tenant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>                  <div className="flex space-x-2">
                    <PermissionGuard permission={PERMISSIONS.UPDATE_TENANTS}>
                      <button 
                        onClick={() => handleEdit(tenant)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.DELETE_TENANTS}>
                      <button 
                        onClick={() => handleDelete(tenant.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {tenant.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {tenant.phone}
                  </div>
                  {tenant.currentProperty && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tenant.currentProperty.address}, {tenant.currentProperty.city}, {tenant.currentProperty.state}
                    </div>
                  )}
                  {tenant.currentRent && (
                    <p className="text-sm text-gray-600">
                      Rent: ${tenant.currentRent.toLocaleString()}/month
                    </p>
                  )}
                  {tenant.emergencyContact && (
                    <p className="text-sm text-gray-500">
                      Emergency: {tenant.emergencyContact} {tenant.emergencyPhone && `(${tenant.emergencyPhone})`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first tenant.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowEditForm(false);
                  setEditingTenant(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
