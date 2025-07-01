import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CardSkeleton } from '../components/ui/Skeleton';
import { PermissionGuard } from '../components/auth/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';
import { Plus, Building, MapPin, Edit, Trash2, Users } from 'lucide-react';

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
  const { hasPermission, user, canAccessProperty } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
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
  const queryClient = useQueryClient();const { data: propertiesData, isLoading: propertiesLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => apiService.getProperties(),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');// Safely extract properties array from API response
  const properties: Property[] = useMemo(() => {
    if (!propertiesData) return [];
    // The API returns { properties: Property[], total: number, page: number, totalPages: number }
    if (propertiesData && typeof propertiesData === 'object' && 'properties' in propertiesData) {
      const data = propertiesData as { properties: Property[] };
      return Array.isArray(data.properties) ? data.properties : [];
    }
    // Fallback in case API returns array directly
    if (Array.isArray(propertiesData)) return propertiesData;
    return [];
  }, [propertiesData]);  // Filter properties based on search, type, and user permissions/assignments
  const filteredProperties = properties.filter((property: Property) => {
    try {
      // Check if user can access this property (based on assignments and permissions)
      if (!canAccessProperty(property.id)) {
        return false;
      }

      const matchesSearch = property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || property.type === filterType;
      return matchesSearch && matchesType;
    } catch (error) {
      console.error('Error filtering property:', property, error);
      return false;
    }
  });

  const resetForm = () => {
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
  };const createPropertyMutation = useMutation({
    mutationFn: (newProperty: typeof formData) => apiService.createProperty(newProperty),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowAddForm(false);      resetForm();
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) => 
      apiService.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowEditForm(false);
      setEditingProperty(null);
      resetForm();
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
      if (editingProperty) {
        await updatePropertyMutation.mutateAsync({ 
          id: editingProperty.id, 
          data: formData 
        });
      } else {
        await createPropertyMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      type: property.type,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      squareFeet: property.squareFeet || 0,
      purchasePrice: property.purchasePrice || 0,
      currentValue: property.currentValue || 0,
      mortgage: property.mortgage || 0,
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deletePropertyMutation.mutateAsync(propertyId);
    }
  };

  if (propertiesLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="h-8 w-64 mb-2 bg-white/20 rounded animate-pulse"></div>
              <div className="h-5 w-48 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="w-36 h-12 bg-white/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="h-12 w-full max-w-md bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-600">Error loading properties</div>;  return (
    <div className="space-y-8">
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

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Portfolio</h1>
            <p className="mt-2 text-blue-100 text-lg">
              Manage and track your real estate investments
            </p>
          </div>          <div className="mt-6 sm:mt-0">
            <PermissionGuard permission={PERMISSIONS.CREATE_PROPERTIES}>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowEditForm(false);
                  setEditingProperty(null);
                  resetForm();
                }}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center transition-all duration-200 border border-white/20"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Property
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by address or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="ALL">All Property Types</option>
              <option value="SINGLE_FAMILY">Single Family</option>
              <option value="DUPLEX">Duplex</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="APARTMENT">Apartment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        {filteredProperties.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProperties.length} of {properties?.length || 0} properties
          </div>
        )}
      </div>      {/* Add/Edit Property Form */}
      {(showAddForm || showEditForm) && (
        <PermissionGuard permission={editingProperty ? PERMISSIONS.UPDATE_PROPERTIES : PERMISSIONS.CREATE_PROPERTIES}>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Property['type'] })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SINGLE_FAMILY">Single Family</option>
                  <option value="DUPLEX">Duplex</option>
                  <option value="CONDO">Condo</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Square Feet</label>
                <input
                  type="number"
                  min="0"
                  value={formData.squareFeet}
                  onChange={(e) => setFormData({ ...formData, squareFeet: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Value</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mortgage Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.mortgage}
                  onChange={(e) => setFormData({ ...formData, mortgage: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingProperty(null);
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
                  ? (editingProperty ? 'Updating...' : 'Creating...') 
                  : (editingProperty ? 'Update Property' : 'Create Property')
                }
              </button>            </div>
          </form>
        </div>
        </PermissionGuard>
      )}{/* Properties Grid */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{property.address}</h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {property.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>                  <div className="flex items-center space-x-2 ml-2">
                    <PermissionGuard permission={PERMISSIONS.UPDATE_PROPERTIES}>
                      <button 
                        onClick={() => handleEdit(property)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.DELETE_PROPERTIES}>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{property.city}, {property.state} {property.zipCode}</span>
                  </div>
                    <div className="flex flex-wrap gap-2">
                    {property.bedrooms && property.bedrooms > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🛏️ {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {property.bathrooms && property.bathrooms > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                        🚿 {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                      </span>
                    )}
                    {property.squareFeet && property.squareFeet > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        📐 {property.squareFeet.toLocaleString()} sq ft
                      </span>
                    )}
                  </div>
                  
                  {(property.currentValue || property.purchasePrice) && (
                    <div className="pt-3 border-t border-gray-100">
                      {property.currentValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Value:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${property.currentValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {property.purchasePrice && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Purchase Price:</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${property.purchasePrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {property.currentValue && property.purchasePrice && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Equity Gain:</span>
                          <span className={`text-sm font-bold ${
                            property.currentValue - property.purchasePrice >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ${Math.abs(property.currentValue - property.purchasePrice).toLocaleString()}
                            {property.currentValue - property.purchasePrice >= 0 ? ' 📈' : ' 📉'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 && properties && properties.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any properties matching your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('ALL');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Start building your property portfolio by adding your first investment property.
          </p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setShowEditForm(false);
              setEditingProperty(null);
              resetForm();
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Property
          </button>
        </div>
      )}
    </div>
  );
};

export default Properties;
