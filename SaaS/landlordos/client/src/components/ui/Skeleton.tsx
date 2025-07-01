import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="ml-4 flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 bg-white/20" />
            <Skeleton className="h-5 w-48 bg-white/10" />
          </div>
          <Skeleton className="w-32 h-12 rounded-xl bg-white/20" />
        </div>
      </div>
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="ml-4 w-0 flex-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
