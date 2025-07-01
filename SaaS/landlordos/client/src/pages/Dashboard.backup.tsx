import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiService.getDashboardOverview(),
  });

  if (overviewLoading) return <LoadingSpinner />;
  if (overviewError) return <div className="text-red-600">Error loading dashboard data</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p>Dashboard content goes here...</p>
      </div>
    </div>
  );
};

export default Dashboard;
