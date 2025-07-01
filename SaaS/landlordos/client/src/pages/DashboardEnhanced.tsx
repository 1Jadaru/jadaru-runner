import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { EnhancedMetricCard, QuickActionCard, ProgressRing } from '../components/ui/EnhancedCards';
import { GlassMorphismCard, FloatingElement } from '../components/ui/GlassMorphism';
import { Building, Users, AlertCircle, TrendingUp, Calendar, Wrench, BarChart3, Plus, Search, Settings, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DashboardOverview {
  overview: {
    totalProperties: number;
    activeLeases: number;
    occupancyRate: number;
    monthlyRentIncome: number;
    monthlyExpenses: number;
    monthlyNetIncome: number;
    yearlyExpenses: number;
    pendingMaintenanceTasks: number;
  };
  upcomingReminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    property?: {
      address: string;
    };
  }>;
  recentExpenses: Array<{
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    property?: {
      address: string;
    };
  }>;
  performanceData: Array<{
    id: string;
    address: string;
    city: string;
    monthlyRent: number;
    monthlyExpenses: number;
    netIncome: number;
    profitMargin: string;
  }>;
  activeLeases: Array<{
    id: string;
    propertyAddress: string;
    tenantName: string;
    monthlyRent: number;
    endDate: string;
  }>;
}

interface FinancialSummary {
  year: number;
  monthlyData: Array<{
    month: number;
    monthName: string;
    income: number;
    expenses: number;
    netIncome: number;
  }>;
  totals: {
    income: number;
    expenses: number;
    netIncome: number;
  };
}

const DashboardEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiService.getDashboardOverview(),
  });

  const { data: financialSummary, isLoading: financialLoading } = useQuery<FinancialSummary>({
    queryKey: ['financial-summary', new Date().getFullYear()],
    queryFn: () => apiService.getFinancialSummary(new Date().getFullYear()),
  });

  if (overviewLoading) return <LoadingSpinner />;
  if (overviewError) return <div className="text-red-600">Error loading dashboard data</div>;

  const stats = overview?.overview;
  const chartData = financialSummary?.monthlyData || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header Section with Glassmorphism */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl"></div>
        <div className="absolute inset-0 opacity-20 rounded-3xl bg-gradient-to-r from-blue-400 to-purple-400"></div>
        
        <GlassMorphismCard className="p-8 m-0 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <FloatingElement delay={0.1}>
              <div className="text-white">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl lg:text-4xl font-bold mb-2"
                >
                  Welcome back, {user?.firstName}! 👋
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-white/80"
                >
                  Here's your property portfolio overview for {format(new Date(), 'MMMM yyyy')}
                </motion.p>
              </div>
            </FloatingElement>

            <FloatingElement delay={0.3} direction="right">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-center">
                    <div className="text-sm text-white/70 mb-1">Net Income This Month</div>
                    <div className={`text-2xl font-bold ${(stats?.monthlyNetIncome || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      ${stats?.monthlyNetIncome?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      vs. ${((stats?.monthlyNetIncome || 0) * 0.85).toLocaleString()} last month
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Property
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </motion.button>
                </div>
              </div>
            </FloatingElement>
          </div>
        </GlassMorphismCard>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FloatingElement delay={0.1}>
          <EnhancedMetricCard
            title="Total Properties"
            value={stats?.totalProperties || 0}
            icon={<Building className="h-6 w-6" />}
            colorScheme="blue"
            change={{
              value: 12,
              type: 'increase',
              period: 'vs last month'
            }}
          />
        </FloatingElement>

        <FloatingElement delay={0.2}>
          <EnhancedMetricCard
            title="Occupancy Rate"
            value={`${stats?.occupancyRate || 0}%`}
            icon={<Users className="h-6 w-6" />}
            colorScheme="green"
            change={{
              value: 5,
              type: 'increase',
              period: 'vs last month'
            }}
          />
        </FloatingElement>

        <FloatingElement delay={0.3}>
          <EnhancedMetricCard
            title="Monthly Income"
            value={`$${stats?.monthlyRentIncome?.toLocaleString() || 0}`}
            icon={<TrendingUp className="h-6 w-6" />}
            colorScheme="purple"
            showPrivacy={true}
            change={{
              value: 8,
              type: 'increase',
              period: 'vs last month'
            }}
          />
        </FloatingElement>

        <FloatingElement delay={0.4}>
          <EnhancedMetricCard
            title="Pending Tasks"
            value={stats?.pendingMaintenanceTasks || 0}
            icon={<Wrench className="h-6 w-6" />}
            colorScheme="orange"
            change={{
              value: 3,
              type: 'decrease',
              period: 'vs last week'
            }}
          />
        </FloatingElement>
      </div>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {showQuickActions && (
          <FloatingElement delay={0.5}>
            <GlassMorphismCard className="p-6 mb-8 bg-white/70">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  icon={<Plus className="h-5 w-5" />}
                  title="Add Property"
                  description="Register a new property"
                  onClick={() => console.log('Add property')}
                  color="bg-blue-100 text-blue-600"
                />
                <QuickActionCard
                  icon={<Users className="h-5 w-5" />}
                  title="Add Tenant"
                  description="Register a new tenant"
                  onClick={() => console.log('Add tenant')}
                  color="bg-green-100 text-green-600"
                />
                <QuickActionCard
                  icon={<Wrench className="h-5 w-5" />}
                  title="Create Task"
                  description="Add maintenance task"
                  onClick={() => console.log('Create task')}
                  color="bg-orange-100 text-orange-600"
                />
                <QuickActionCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="View Reports"
                  description="Generate financial reports"
                  onClick={() => console.log('View reports')}
                  color="bg-purple-100 text-purple-600"
                />
              </div>
            </GlassMorphismCard>
          </FloatingElement>
        )}
      </AnimatePresence>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <FloatingElement delay={0.6}>
          <GlassMorphismCard className="xl:col-span-2 bg-white/80">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Financial Trends</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{new Date().getFullYear()}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Expenses</span>
                  </div>
                </div>
              </div>
              {!financialLoading && chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="monthName" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        name="Income"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#10B981' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={3} 
                        name="Expenses"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#EF4444' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netIncome" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        name="Net Income"
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl">
                  {financialLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading chart data...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p>No financial data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassMorphismCard>
        </FloatingElement>

        <FloatingElement delay={0.7}>
          <GlassMorphismCard className="bg-white/80">
            <div className="p-8">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Occupancy Status</h3>
              </div>
              
              <div className="flex flex-col items-center">
                <ProgressRing 
                  progress={stats?.occupancyRate || 0} 
                  size={140} 
                  strokeWidth={10}
                  color="#10B981"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats?.occupancyRate || 0}%</div>
                    <div className="text-sm text-gray-500">Occupied</div>
                  </div>
                </ProgressRing>
                
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Occupied Units</span>
                    <span className="font-semibold">{Math.round((stats?.occupancyRate || 0) * (stats?.totalProperties || 0) / 100)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vacant Units</span>
                    <span className="font-semibold">{(stats?.totalProperties || 0) - Math.round((stats?.occupancyRate || 0) * (stats?.totalProperties || 0) / 100)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium text-gray-700">Total Properties</span>
                    <span className="font-bold text-lg">{stats?.totalProperties || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassMorphismCard>
        </FloatingElement>
      </div>

      {/* Enhanced Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <FloatingElement delay={0.8}>
          <GlassMorphismCard className="bg-white/80">
            <div className="p-6">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Monthly Income</span>
                    <span className="text-lg font-bold text-green-600">
                      ${stats?.monthlyRentIncome?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${stats?.monthlyRentIncome && stats?.monthlyExpenses 
                          ? Math.min((stats.monthlyRentIncome / (stats.monthlyRentIncome + stats.monthlyExpenses)) * 100, 100)
                          : 0}%`
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Monthly Expenses</span>
                    <span className="text-lg font-bold text-red-600">
                      ${stats?.monthlyExpenses?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${stats?.monthlyRentIncome && stats?.monthlyExpenses 
                          ? Math.min((stats.monthlyExpenses / (stats.monthlyRentIncome + stats.monthlyExpenses)) * 100, 100)
                          : 0}%`
                      }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Net Income</span>
                    <span className={`text-xl font-bold ${(stats?.monthlyNetIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${stats?.monthlyNetIncome?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassMorphismCard>
        </FloatingElement>

        <FloatingElement delay={0.9}>
          <GlassMorphismCard className="bg-white/80">
            <div className="p-6">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {overview?.recentExpenses?.slice(0, 4).map((expense, index) => (
                  <motion.div 
                    key={expense.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">{expense.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {expense.property?.address || 'General'} • {format(new Date(expense.date), 'MMM dd')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-red-600 ml-4">
                      -${expense.amount.toLocaleString()}
                    </span>
                  </motion.div>
                )) || (
                  <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </GlassMorphismCard>
        </FloatingElement>

        <FloatingElement delay={1.0}>
          <GlassMorphismCard className="bg-white/80">
            <div className="p-6">
              <div className="flex items-center mb-6 gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
              </div>
              <div className="space-y-3">
                {overview?.upcomingReminders?.slice(0, 4).map((reminder, index) => (
                  <motion.div 
                    key={reminder.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-orange-400 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {reminder.property?.address || 'General'} • {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ml-4 ${
                        reminder.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        reminder.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.priority}
                      </span>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                    <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p>No upcoming reminders</p>
                  </div>
                )}
              </div>
            </div>
          </GlassMorphismCard>
        </FloatingElement>
      </div>

      {/* Enhanced Active Leases Section */}
      <FloatingElement delay={1.1}>
        <GlassMorphismCard className="bg-white/80">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Active Leases</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {overview?.activeLeases?.length || 0} active leases
                </span>
                <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lease
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview?.activeLeases?.slice(0, 6).map((lease, index) => (
                <motion.div 
                  key={lease.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">{lease.tenantName}</p>
                      <p className="text-xs text-gray-600 mt-1">{lease.propertyAddress}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        ${lease.monthlyRent.toLocaleString()}
                      </span>
                      <div className="text-xs font-medium text-blue-600">/month</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Expires {format(new Date(lease.endDate), 'MMM dd, yyyy')}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </motion.div>
              )) || (
                <div className="col-span-full text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p>No active leases</p>
                </div>
              )}
            </div>
          </div>
        </GlassMorphismCard>
      </FloatingElement>
    </div>
  );
};

export default DashboardEnhanced;
