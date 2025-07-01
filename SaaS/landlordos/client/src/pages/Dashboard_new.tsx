import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building, Users, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  activeLeases: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingMaintenance: number;
  upcomingRentDue: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return response.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName}! Here's an overview of your properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Properties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalProperties || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Leases
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.activeLeases || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Income
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats?.monthlyIncome?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Expenses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats?.monthlyExpenses?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Pending Maintenance</h3>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {stats?.pendingMaintenance || 0} maintenance request(s) pending
              </p>
              <div className="mt-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  View All Requests
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Upcoming Rent</h3>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {stats?.upcomingRentDue || 0} rent payment(s) due this week
              </p>
              <div className="mt-3">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  View Upcoming Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-5">
            <div className="text-sm text-gray-500">
              No recent activity to display. Start by adding your first property!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
