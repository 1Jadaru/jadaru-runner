import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, ArrowDown,
  Eye, EyeOff
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  isLoading?: boolean;
  showPrivacy?: boolean;
}

const colorSchemes = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-100 text-blue-600',
    change: 'text-blue-100',
    shimmer: 'from-blue-400 to-blue-500'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-100 text-green-600',
    change: 'text-green-100',
    shimmer: 'from-green-400 to-green-500'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-100 text-purple-600',
    change: 'text-purple-100',
    shimmer: 'from-purple-400 to-purple-500'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-100 text-orange-600',
    change: 'text-orange-100',
    shimmer: 'from-orange-400 to-orange-500'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    icon: 'bg-red-100 text-red-600',
    change: 'text-red-100',
    shimmer: 'from-red-400 to-red-500'
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    icon: 'bg-indigo-100 text-indigo-600',
    change: 'text-indigo-100',
    shimmer: 'from-indigo-400 to-indigo-500'
  }
};

export const EnhancedMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  colorScheme,
  isLoading = false,
  showPrivacy = false
}) => {
  const [isPrivate, setIsPrivate] = useState(showPrivacy);
  const colors = colorSchemes[colorScheme];

  const getChangeIcon = () => {
    if (!change) return null;
    if (change.type === 'increase') return <ArrowUp className="h-3 w-3" />;
    if (change.type === 'decrease') return <ArrowDown className="h-3 w-3" />;
    return null;
  };

  const getChangeColor = () => {
    if (!change) return '';
    if (change.type === 'increase') return 'text-green-300';
    if (change.type === 'decrease') return 'text-red-300';
    return 'text-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-r ${colors.shimmer} animate-pulse`}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors.icon} shadow-lg`}>
              {icon}
            </div>
            {showPrivacy && (
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-8 bg-white/20 rounded animate-pulse"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className="text-2xl font-bold">
                    {isPrivate ? '••••••' : value}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {change && !isPrivate && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center text-xs font-medium ${getChangeColor()}`}
              >
                {getChangeIcon()}
                <span className="ml-1">
                  {Math.abs(change.value)}% {change.period}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

export const QuickActionCard: React.FC<QuickActionProps> = ({
  icon,
  title,
  description,
  onClick,
  color
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group"
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
