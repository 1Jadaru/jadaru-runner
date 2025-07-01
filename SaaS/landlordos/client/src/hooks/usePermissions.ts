import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../constants/permissions';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  Wrench, 
  Bell,
  UserCog
} from 'lucide-react';

/**
 * Hook for permission-based navigation items
 */
export const usePermissionBasedNavigation = () => {
  const { hasPermission, loading } = useAuth();

  // If still loading user data, return empty navigation
  if (loading) {
    return [];
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      permission: PERMISSIONS.READ_DASHBOARD,
      show: hasPermission(PERMISSIONS.READ_DASHBOARD),
    },
    {
      name: 'Properties',
      href: '/properties',
      icon: Building2,
      color: 'text-green-600',
      permission: PERMISSIONS.READ_PROPERTIES,
      show: hasPermission(PERMISSIONS.READ_PROPERTIES),
    },
    {
      name: 'Tenants',
      href: '/tenants',
      icon: Users,
      color: 'text-purple-600',
      permission: PERMISSIONS.READ_TENANTS,
      show: hasPermission(PERMISSIONS.READ_TENANTS),
    },
    {
      name: 'Leases',
      href: '/leases',
      icon: FileText,
      color: 'text-orange-600',
      permission: PERMISSIONS.READ_LEASES,
      show: hasPermission(PERMISSIONS.READ_LEASES),
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: DollarSign,
      color: 'text-red-600',
      permission: PERMISSIONS.READ_EXPENSES,
      show: hasPermission(PERMISSIONS.READ_EXPENSES),
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: Wrench,
      color: 'text-yellow-600',
      permission: PERMISSIONS.READ_MAINTENANCE,
      show: hasPermission(PERMISSIONS.READ_MAINTENANCE),
    },
    {
      name: 'Reminders',
      href: '/reminders',
      icon: Bell,
      color: 'text-pink-600',
      permission: PERMISSIONS.READ_REMINDERS,
      show: hasPermission(PERMISSIONS.READ_REMINDERS),
    },
    {
      name: 'Team',
      href: '/organization',
      icon: UserCog,
      color: 'text-indigo-600',
      permission: PERMISSIONS.READ_USERS,
      show: hasPermission(PERMISSIONS.READ_USERS) || hasPermission(PERMISSIONS.MANAGE_ORGANIZATION),
    },
  ].filter(item => item.show);

  return navigationItems;
};

/**
 * Hook for checking if user can perform actions
 */
export const useActionPermissions = () => {
  const { hasPermission, loading } = useAuth();

  // If still loading, return false for all permissions
  if (loading) {
    return {
      canInviteUsers: false,
      canManageRoles: false,
      canManageOrganization: false,
      canViewAuditLogs: false,
      canCreateProperties: false,
      canUpdateProperties: false,
      canDeleteProperties: false,
      canCreateTenants: false,
      canUpdateTenants: false,
      canDeleteTenants: false,
      canCreateLeases: false,
      canUpdateLeases: false,
      canDeleteLeases: false,
      canCreateExpenses: false,
      canUpdateExpenses: false,
      canDeleteExpenses: false,
      canCreateMaintenance: false,
      canUpdateMaintenance: false,
      canDeleteMaintenance: false,
    };
  }

  return {
    canCreateProperty: hasPermission(PERMISSIONS.CREATE_PROPERTIES),
    canEditProperty: hasPermission(PERMISSIONS.UPDATE_PROPERTIES),
    canDeleteProperty: hasPermission(PERMISSIONS.DELETE_PROPERTIES),
    
    canCreateTenant: hasPermission(PERMISSIONS.CREATE_TENANTS),
    canEditTenant: hasPermission(PERMISSIONS.UPDATE_TENANTS),
    canDeleteTenant: hasPermission(PERMISSIONS.DELETE_TENANTS),
    
    canCreateLease: hasPermission(PERMISSIONS.CREATE_LEASES),
    canEditLease: hasPermission(PERMISSIONS.UPDATE_LEASES),
    canDeleteLease: hasPermission(PERMISSIONS.DELETE_LEASES),
    
    canCreateExpense: hasPermission(PERMISSIONS.CREATE_EXPENSES),
    canEditExpense: hasPermission(PERMISSIONS.UPDATE_EXPENSES),
    canDeleteExpense: hasPermission(PERMISSIONS.DELETE_EXPENSES),
    
    canCreateMaintenance: hasPermission(PERMISSIONS.CREATE_MAINTENANCE),
    canEditMaintenance: hasPermission(PERMISSIONS.UPDATE_MAINTENANCE),
    canDeleteMaintenance: hasPermission(PERMISSIONS.DELETE_MAINTENANCE),
    
    canInviteUsers: hasPermission(PERMISSIONS.INVITE_USERS),
    canManageRoles: hasPermission(PERMISSIONS.MANAGE_ROLES),
    canManageOrganization: hasPermission(PERMISSIONS.MANAGE_ORGANIZATION),
    canViewAuditLogs: hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
  };
};
