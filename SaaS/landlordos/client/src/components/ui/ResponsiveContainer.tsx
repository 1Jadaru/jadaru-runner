import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md', 
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-6 lg:px-12'
};

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md'
}) => {
  const combinedClassName = [
    'mx-auto w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
