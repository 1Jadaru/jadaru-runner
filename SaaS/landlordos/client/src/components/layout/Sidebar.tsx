import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Crown,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissionBasedNavigation } from '../../hooks/usePermissions';
import { RoleDisplay, OrganizationDisplay } from '../auth/PermissionGuard';

const Sidebar: React.FC = () => {
  const { user, loading } = useAuth();
  const navigation = usePermissionBasedNavigation();

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200/50 pt-16 overflow-y-auto lg:block hidden shadow-lg">
        <div className="px-4 py-6">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200/50 pt-16 overflow-y-auto lg:block hidden shadow-lg">
      <div className="px-4 py-6">
        {/* Organization and Role Display */}
        {user?.organization && (
          <div className="mb-6 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
            <OrganizationDisplay className="mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Your Role:</span>
              <RoleDisplay />
            </div>
          </div>
        )}

        {/* Legacy Tier Banner for backwards compatibility */}
        {user?.tier === 'FREE' && (
          <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Free Plan</span>
            </div>
            <p className="text-xs text-blue-600 mb-2">
              Upgrade to unlock more features and remove ads
            </p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs py-1.5 px-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all">
              Upgrade Now
            </button>
          </div>
        )}

        {user?.tier === 'BASIC' && (
          <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-800">Basic Plan</span>
            </div>
            <p className="text-xs text-blue-600">
              Ad-free experience with advanced features
            </p>
          </div>
        )}

        {user?.tier === 'PREMIUM' && (
          <div className="mb-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-yellow-700" />
              <span className="text-sm font-medium text-yellow-800">Premium Plan</span>
            </div>
            <p className="text-xs text-yellow-600">
              Full access to all enterprise features
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : item.color
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Properties</span>
              <span className="font-medium text-gray-900">2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tenants</span>
              <span className="font-medium text-gray-900">2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Income</span>
              <span className="font-medium text-green-600">$2,700</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
