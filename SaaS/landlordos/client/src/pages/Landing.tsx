import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, BarChart3, Users, CreditCard, CheckCircle, Star, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Manage multiple properties with ease. Track rentals, maintenance, and tenant information.',
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Advanced dashboard with real-time charts and performance metrics for informed decisions.',
    },
    {
      icon: Users,
      title: 'Tenant Management',
      description: 'Complete tenant lifecycle management with lease tracking and communication tools.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with multi-tenant data isolation and encrypted communications.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 3 properties',
        'Basic tenant management',
        'Essential reporting',
        'Community support',
      ],
      limitations: ['Contains ads'],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Basic',
      price: '$19',
      period: 'per month',
      description: 'For growing landlords',
      features: [
        'Up to 15 properties',
        'Advanced analytics',
        'Priority support',
        'No advertisements',
        'Email notifications',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Premium',
      price: '$49',
      period: 'per month',
      description: 'For property management companies',
      features: [
        'Unlimited properties',
        'Advanced integrations',
        'Custom reporting',
        'Phone support',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">LandlordOS</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Modern Property
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Streamline your rental business with our comprehensive platform. 
              Manage properties, tenants, and finances with enterprise-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Bank-grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>14-day Free Trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No Setup Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to manage properties
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for modern property management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all hover:transform hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose your plan
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Start free and scale as your business grows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all hover:transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold px-4 py-1 rounded-full text-center mb-6">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations?.map((limitation, limitIndex) => (
                    <li key={limitIndex} className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-yellow-300">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">LandlordOS</span>
            </div>
            <p className="text-gray-400">
              © 2025 LandlordOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
