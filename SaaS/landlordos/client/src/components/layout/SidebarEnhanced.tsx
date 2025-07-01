import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Building, Users, FileText, CreditCard, Wrench, 
  Bell, Settings, ChevronLeft, ChevronRight, Zap, Star,
  Target, TrendingUp, Calendar, AlertCircle, Search
} from 'lucide-react';
import { GlassMorphismCard } from '../ui/GlassMorphism';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  isNew?: boolean;
  isPremium?: boolean;
}

interface SidebarEnhancedProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarEnhanced: React.FC<SidebarEnhancedProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainNavItems: NavItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      path: '/properties', 
      label: 'Properties', 
      icon: <Building className="h-5 w-5" />,
      badge: 12
    },
    { 
      path: '/tenants', 
      label: 'Tenants', 
      icon: <Users className="h-5 w-5" />,
      badge: 8
    },
    { 
      path: '/leases', 
      label: 'Leases', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      path: '/expenses', 
      label: 'Expenses', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      path: '/maintenance', 
      label: 'Maintenance', 
      icon: <Wrench className="h-5 w-5" />,
      badge: 3
    },
    { 
      path: '/reminders', 
      label: 'Reminders', 
      icon: <Bell className="h-5 w-5" />,
      badge: 5
    },
  ];

  const quickActions: NavItem[] = [
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: <TrendingUp className="h-5 w-5" />,
      isNew: true,
      isPremium: true
    },
    { 
      path: '/goals', 
      label: 'Goals', 
      icon: <Target className="h-5 w-5" />,
      isNew: true
    },
    { 
      path: '/automation', 
      label: 'Automation', 
      icon: <Zap className="h-5 w-5" />,
      isPremium: true
    },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const NavItemComponent: React.FC<{ item: NavItem; isQuickAction?: boolean }> = ({ 
    item, 
    isQuickAction = false 
  }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => 
        `group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isQuickAction ? 'text-sm' : ''}`
      }
      onMouseEnter={() => setHoveredItem(item.path)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className="relative">
        {item.icon}
        {item.badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 flex-1 overflow-hidden"
          >
            <span className="font-medium truncate">{item.label}</span>
            {item.isNew && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                New
              </span>
            )}
            {item.isPremium && (
              <Star className="h-3 w-3 text-yellow-500" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {isCollapsed && hoveredItem === item.path && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute left-full ml-2 z-50"
        >
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl">
            {item.label}
            {item.badge && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </NavLink>
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white border-r border-gray-200 flex flex-col relative"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">LandlordOS</h1>
                  <p className="text-xs text-gray-500">Property Management</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 text-sm"
          >
            <Search className="h-4 w-4" />
            <span>Search (⌘K)</span>
          </motion.button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Main
              </motion.h3>
            )}
          </AnimatePresence>
          
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 space-y-1">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Quick Actions
              </motion.h3>
            )}
          </AnimatePresence>
          
          {quickActions.map((item) => (
            <NavItemComponent key={item.path} item={item} isQuickAction />
          ))}
        </div>

        {/* Upgrade Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <GlassMorphismCard className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upgrade to Pro</h4>
                <p className="text-xs text-gray-600 mb-3">
                  Unlock advanced analytics, automation, and premium features
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                >
                  Upgrade Now
                </motion.button>
              </div>
            </GlassMorphismCard>
          </motion.div>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <NavItemComponent 
          item={{ 
            path: '/settings', 
            label: 'Settings', 
            icon: <Settings className="h-5 w-5" /> 
          }} 
        />
      </div>
    </motion.div>
  );
};

export default SidebarEnhanced;
