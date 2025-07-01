import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS, type Permission, type RoleName } from '../../constants/permissions';

interface PermissionGuardProps {
  permission?: Permission | Permission[];
  role?: RoleName | RoleName[];
  propertyId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Permission-based conditional rendering component
 * Only renders children if user has the required permissions/roles
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  propertyId,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasRole, canAccessProperty } = useAuth();

  // Check permission requirements
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const hasRequiredPermission = permissions.some(perm => hasPermission(PERMISSIONS[perm]));
    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  // Check role requirements
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = roles.some(roleName => hasRole(roleName));
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check property access requirements
  if (propertyId && !canAccessProperty(propertyId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleDisplayProps {
  className?: string;
}

/**
 * Component to display user's highest role
 */
export const RoleDisplay: React.FC<RoleDisplayProps> = ({ className = '' }) => {
  const { getHighestRole } = useAuth();
  const role = getHighestRole();

  if (!role) return null;

  const roleColors = {
    OWNER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    COORDINATOR: 'bg-green-100 text-green-800',
    VIEWER: 'bg-gray-100 text-gray-800',
  };

  const colorClass = roleColors[role.name as keyof typeof roleColors] || roleColors.VIEWER;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {role.name}
    </span>
  );
};

interface OrganizationDisplayProps {
  className?: string;
}

/**
 * Component to display organization information
 */
export const OrganizationDisplay: React.FC<OrganizationDisplayProps> = ({ className = '' }) => {
  const { user } = useAuth();

  if (!user?.organization) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">
          {user.organization.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.organization.name}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {user.organization.type.toLowerCase()} Account
        </p>
      </div>
    </div>
  );
};
