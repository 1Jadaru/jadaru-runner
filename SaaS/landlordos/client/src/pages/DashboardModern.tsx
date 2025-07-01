import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  Building, Users, AlertCircle, TrendingUp, Calendar, Wrench, BarChart3, 
  Plus, Search, Settings, Zap, ChevronRight 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

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

const DashboardModern: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">      {/* Enhanced Header Section */}
      <div className="relative mb-8">
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl" style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
        }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-lg text-blue-100">
                Here's your property portfolio overview for {format(new Date(), 'MMMM yyyy')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <div className="text-center">
                  <div className="text-sm text-blue-100 mb-1">Net Income This Month</div>
                  <div className={`text-2xl font-bold ${(stats?.monthlyNetIncome || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ${stats?.monthlyNetIncome?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-blue-200 mt-1">
                    vs. ${((stats?.monthlyNetIncome || 0) * 0.85).toLocaleString()} last month
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Property
                </button>
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Properties Card */}
        <div className="rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-blue-100 mb-1">Total Properties</h3>
          <p className="text-2xl font-bold mb-2">{stats?.totalProperties || 0}</p>
          <div className="flex items-center text-xs font-medium text-green-300">
            <ChevronRight className="h-3 w-3 mr-1" />
            <span>+12% vs last month</span>
          </div>
        </div>

        {/* Occupancy Rate Card */}
        <div className="rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-green-100 mb-1">Occupancy Rate</h3>
          <p className="text-2xl font-bold mb-2">{stats?.occupancyRate || 0}%</p>
          <div className="flex items-center text-xs font-medium text-green-300">
            <ChevronRight className="h-3 w-3 mr-1" />
            <span>+5% vs last month</span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-purple-100 mb-1">Monthly Income</h3>
          <p className="text-2xl font-bold mb-2">${stats?.monthlyRentIncome?.toLocaleString() || 0}</p>
          <div className="flex items-center text-xs font-medium text-green-300">
            <ChevronRight className="h-3 w-3 mr-1" />
            <span>+8% vs last month</span>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-orange-100 mb-1">Pending Tasks</h3>
          <p className="text-2xl font-bold mb-2">{stats?.pendingMaintenanceTasks || 0}</p>
          <div className="flex items-center text-xs font-medium text-red-300">
            <ChevronRight className="h-3 w-3 mr-1" />
            <span>-3 vs last week</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}        <div className="bg-white rounded-3xl p-6 mb-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg text-white" style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
              }}>
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/properties')}
            className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Add Property</h3>
              <p className="text-sm text-gray-500 mt-1">Register a new property</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/tenants')}
            className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
          >
            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Add Tenant</h3>
              <p className="text-sm text-gray-500 mt-1">Register a new tenant</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/maintenance')}
            className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
          >
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Create Task</h3>
              <p className="text-sm text-gray-500 mt-1">Add maintenance task</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/expenses')}
            className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
          >
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">View Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Generate financial reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Financial Trends Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
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

        {/* Occupancy Status */}        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6 gap-3">
            <div className="p-2 rounded-lg text-white" style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            }}>
              <Building className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Occupancy Status</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#10b981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(stats?.occupancyRate || 0) * 3.14159} 314.159`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats?.occupancyRate || 0}%</div>
                  <div className="text-sm text-gray-500">Occupied</div>
                </div>
              </div>
            </div>
            
            <div className="w-full space-y-3">
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
      </div>

      {/* Enhanced Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6 gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {overview?.recentExpenses?.slice(0, 4).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-200 cursor-pointer group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">{expense.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {expense.property?.address || 'General'} • {format(new Date(expense.date), 'MMM dd')}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-600 ml-4">
                  -${expense.amount.toLocaleString()}
                </span>
              </div>
            )) || (
              <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6 gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="space-y-3">
            {overview?.upcomingReminders?.slice(0, 4).map((reminder) => (
              <div key={reminder.id} className="p-4 bg-yellow-50 rounded-xl border-l-4 border-orange-400 hover:shadow-md transition-all duration-200">
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
              </div>
            )) || (
              <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>No upcoming reminders</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center mb-6 gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
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
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.monthlyRentIncome && stats?.monthlyExpenses 
                      ? Math.min((stats.monthlyRentIncome / (stats.monthlyRentIncome + stats.monthlyExpenses)) * 100, 100)
                      : 0}%`
                  }}
                ></div>
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
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.monthlyRentIncome && stats?.monthlyExpenses 
                      ? Math.min((stats.monthlyExpenses / (stats.monthlyRentIncome + stats.monthlyExpenses)) * 100, 100)
                      : 0}%`
                  }}
                ></div>
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
      </div>

      {/* Enhanced Active Leases Section */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
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
          {overview?.activeLeases?.slice(0, 6).map((lease) => (
            <div 
              key={lease.id}
              className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
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
            </div>
          )) || (
            <div className="col-span-full text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No active leases</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
