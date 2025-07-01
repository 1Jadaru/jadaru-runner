import React from 'react';
import { motion } from 'framer-motion';

interface GlassMorphismCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
}

export const GlassMorphismCard: React.FC<GlassMorphismCardProps> = ({
  children,
  className = '',
  blur = 'md'
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        bg-white/10 ${blurClasses[blur]} 
        border border-white/20 
        rounded-2xl 
        shadow-xl shadow-black/10
        hover:shadow-2xl hover:shadow-black/20
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  direction = 'up'
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'down': return { y: -20 };
      case 'left': return { x: 20 };
      case 'right': return { x: -20 };
      default: return { y: 20 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {children}
    </motion.div>
  );
};
