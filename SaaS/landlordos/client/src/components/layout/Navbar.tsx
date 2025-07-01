import { useAuth } from '../../contexts/AuthContext';
import { Building2, LogOut, User, Crown, Shield, Star, Settings, Bell } from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'BASIC':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'BASIC':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LandlordOS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(user?.tier || 'FREE')}`}>
                  {getTierIcon(user?.tier || 'FREE')}
                  <span className="ml-1">{user?.tier || 'FREE'}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.email}
                    </div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user?.tier || 'FREE')}`}>
                        {getTierIcon(user?.tier || 'FREE')}
                        <span className="ml-1">{user?.tier || 'FREE'} Plan</span>
                      </span>
                    </div>
                  </div>
                  
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </button>
                  
                  {user?.tier === 'FREE' && (
                    <button className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                      <Crown className="h-4 w-4 mr-3" />
                      Upgrade Plan
                    </button>
                  )}
                  
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
