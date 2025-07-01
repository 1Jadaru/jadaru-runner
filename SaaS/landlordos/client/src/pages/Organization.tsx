import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { PermissionGuard, RoleDisplay, OrganizationDisplay } from '../components/auth/PermissionGuard';
import { useActionPermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield, 
  Activity,
  Mail,
  Edit,
  Trash2,
  Building
} from 'lucide-react';

interface OrganizationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  userRoles: Array<{
    id: string;
    role: {
      id: string;
      name: string;
      level: number;
    };
    isActive: boolean;
  }>;
  assignedPropertyIds?: string[];
}

interface Role {
  id: string;
  name: string;
  level: number;
  permissions: string[];
}

const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { canInviteUsers, canManageRoles, canManageOrganization, canViewAuditLogs } = useActionPermissions();
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
  });

  // Fetch organization users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['organization-users'],
    queryFn: organizationService.getUsers,
    enabled: !!user,
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ['organization-roles'],
    queryFn: organizationService.getRoles,
    enabled: !!user,
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: organizationService.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
      setShowInviteForm(false);
      setInviteFormData({ email: '', firstName: '', lastName: '', roleId: '' });
    },
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: organizationService.removeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFormData.roleId) return;
    
    inviteUserMutation.mutate(inviteFormData);
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user from the organization?')) {
      removeUserMutation.mutate(userId);
    }
  };

  if (usersLoading) {
    return <LoadingSpinner />;
  }

  const users: OrganizationUser[] = usersData?.users || [];
  const roles: Role[] = rolesData?.roles || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your team members, roles, and organization settings.
          </p>
        </div>
        <PermissionGuard permission={['INVITE_USERS']}>
          <button
            onClick={() => setShowInviteForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </button>
        </PermissionGuard>
      </div>

      {/* Organization Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Organization Information
          </h3>
          <OrganizationDisplay className="mb-4" />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {user?.organization?.type.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Team Members
          </h3>
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.userRoles.filter(ur => ur.isActive).map(userRole => (
                        <span
                          key={userRole.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2"
                        >
                          {userRole.role.name}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <PermissionGuard permission={['MANAGE_ROLES']}>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Edit className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission={['DELETE_USERS']}>
                        {member.id !== user?.id && (
                          <button 
                            onClick={() => handleRemoveUser(member.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite New User</h3>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={inviteFormData.email}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={inviteFormData.firstName}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={inviteFormData.lastName}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    required
                    value={inviteFormData.roleId}
                    onChange={(e) => setInviteFormData({ ...inviteFormData, roleId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteUserMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {inviteUserMutation.isPending ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;
