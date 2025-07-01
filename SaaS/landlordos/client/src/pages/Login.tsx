import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('demo@landlordos.com'); // Pre-filled for demo
  const [password, setPassword] = useState('demo123'); // Pre-filled for demo
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password: '***' });
      await login(email, password);
      console.log('Login successful!');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        setError(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Unable to connect to server. Please check your connection.');
      } else {
        // Something else happened
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-10 w-10 text-white" />
              <span className="text-3xl font-bold">LandlordOS</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome back to the future of property management
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Manage your properties with enterprise-grade security and powerful analytics.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">Bank-grade security & encryption</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-blue-100">Real-time dashboard & analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-blue-100">Multi-tenant data isolation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">LandlordOS</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sign in to your account</h2>
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">Demo Account</span>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-center text-blue-200">
                  <p className="font-medium mb-2">Try our demo account:</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-mono">demo@landlordos.com</span></p>
                    <p><span className="font-mono">demo123</span></p>
                  </div>
                  <p className="text-xs text-blue-300 mt-2">
                    Pre-filled above for your convenience
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
