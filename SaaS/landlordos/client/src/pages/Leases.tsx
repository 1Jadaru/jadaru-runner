import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, FileText, Calendar, DollarSign, Edit, Trash2, MapPin, User, AlertCircle } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  type: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  terms?: string;
  createdAt: string;
  updatedAt: string;
  property: Property;
  tenant: Tenant;
  tenantName: string;
  propertyAddress: string;
  isActive: boolean;
  daysUntilExpiry: number;
  totalPayments: number;
}

const Leases: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    status: 'ACTIVE' as Lease['status'],
    terms: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  
  // Fetch leases
  const { data: leasesResponse, isLoading: leasesLoading, error } = useQuery<{ leases: Lease[] }>({
    queryKey: ['leases'],
    queryFn: () => apiService.getLeases(),
  });

  // Fetch properties for dropdown
  const { data: propertiesResponse } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => apiService.getProperties(),
  });

  // Fetch tenants for dropdown  
  const { data: tenantsResponse } = useQuery<{ tenants: Tenant[] }>({
    queryKey: ['tenants'],
    queryFn: () => apiService.getTenants(),
  });

  const leases = leasesResponse?.leases || [];
  const properties = propertiesResponse || [];
  const tenants = tenantsResponse?.tenants || [];

  const resetForm = () => {
    setFormData({
      propertyId: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      monthlyRent: 0,
      securityDeposit: 0,
      status: 'ACTIVE',
      terms: '',
    });
  };

  const createLeaseMutation = useMutation({
    mutationFn: (newLease: typeof formData) => apiService.createLease(newLease),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAddForm(false);
      resetForm();
    },
  });

  const updateLeaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) => 
      apiService.updateLease(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setShowEditForm(false);
      setEditingLease(null);
      resetForm();
    },
  });

  const deleteLeaseMutation = useMutation({
    mutationFn: (leaseId: string) => apiService.deleteLease(leaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingLease) {
        await updateLeaseMutation.mutateAsync({ 
          id: editingLease.id, 
          data: formData 
        });
      } else {
        await createLeaseMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving lease:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (lease: Lease) => {
    setEditingLease(lease);
    setFormData({
      propertyId: lease.property.id,
      tenantId: lease.tenant.id,
      startDate: lease.startDate.split('T')[0], // Convert to YYYY-MM-DD
      endDate: lease.endDate.split('T')[0],
      monthlyRent: lease.monthlyRent,
      securityDeposit: lease.securityDeposit,
      status: lease.status,
      terms: lease.terms || '',
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (leaseId: string) => {
    if (window.confirm('Are you sure you want to delete this lease?')) {
      await deleteLeaseMutation.mutateAsync(leaseId);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'TERMINATED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (leasesLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading leases</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leases</h1>
        <button
          onClick={() => {
            setShowAddForm(true);
            setShowEditForm(false);
            setEditingLease(null);
            resetForm();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lease
        </button>
      </div>

      {/* Add/Edit Lease Form */}
      {(showAddForm || showEditForm) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingLease ? 'Edit Lease' : 'Add New Lease'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property</label>
                <select
                  required
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}, {property.city}, {property.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tenant</label>
                <select
                  required
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName} ({tenant.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1500.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Security Deposit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1500.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Lease['status'] })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Additional Terms</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional lease terms or notes..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingLease(null);
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
                  ? (editingLease ? 'Updating...' : 'Creating...') 
                  : (editingLease ? 'Update Lease' : 'Create Lease')
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leases List */}
      {leases && leases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leases.map((lease) => (
            <div key={lease.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Lease Agreement
                      </h3>
                      <div className="flex items-center text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                        {lease.daysUntilExpiry <= 30 && lease.daysUntilExpiry > 0 && (
                          <span className="ml-2 inline-flex items-center text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expires in {lease.daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(lease)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(lease.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {lease.propertyAddress}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {lease.tenantName}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${lease.monthlyRent.toLocaleString()}/month
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                  </div>
                  
                  {lease.securityDeposit > 0 && (
                    <p className="text-sm text-gray-600">
                      Security Deposit: ${lease.securityDeposit.toLocaleString()}
                    </p>
                  )}
                  
                  {lease.terms && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      {lease.terms}
                    </p>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Created: {new Date(lease.createdAt).toLocaleDateString()}</span>
                    <span>{lease.totalPayments} payments</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leases</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first lease agreement.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowEditForm(false);
                  setEditingLease(null);
                  resetForm();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leases;
