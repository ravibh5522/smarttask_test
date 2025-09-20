import React from 'react';
import { cn } from '@/lib/utils';

interface SmartTaskIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;
  variant?: 'default' | 'gradient' | 'minimal' | 'outline';
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
};

export const SmartTaskIcon: React.FC<SmartTaskIconProps> = ({
  size = 'md',
  variant = 'default',
  className,
  animate = false,
}) => {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  
  const baseClasses = cn(
    'transition-all duration-300',
    animate && 'hover:scale-110',
    className
  );

  // Simple, clean icon design
  return (
    <div className={cn(baseClasses, 'relative')} style={{ width: iconSize, height: iconSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Background circle with gradient */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="url(#icon-gradient)"
        />
        
        {/* Simple checkmark */}
        <path
          d="M10 16l3 3 6-6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Small indicator dot */}
        <circle
          cx="22"
          cy="10"
          r="3"
          fill="white"
          opacity="0.9"
        />
        <circle
          cx="22"
          cy="10"
          r="1.5"
          fill="url(#icon-gradient)"
        />
        
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-light))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Favicon version - even simpler
export const SmartTaskFavicon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" fill="url(#favicon-gradient)" />
      <path d="M10 16l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="22" cy="10" r="2.5" fill="white" opacity="0.9" />
      
      <defs>
        <linearGradient id="favicon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-light))" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Logo version for headers and branding
export const SmartTaskLogo: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  showText?: boolean;
  variant?: 'light' | 'dark' | 'auto';
}> = ({ 
  size = 'md', 
  showText = true,
  variant = 'auto'
}) => {
  const iconSizes = { sm: 32, md: 40, lg: 48 };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };
  const iconSize = iconSizes[size];
  
  const getTextColor = () => {
    if (variant === 'light') return 'text-white';
    if (variant === 'dark') return 'text-foreground';
    return 'text-foreground'; // Auto adapts to theme
  };
  
  const getSubtextColor = () => {
    if (variant === 'light') return 'text-gray-300';
    if (variant === 'dark') return 'text-muted-foreground';
    return 'text-muted-foreground'; // Auto adapts to theme
  };
  
  return (
    <div className="flex items-center gap-3">
      <SmartTaskIcon size={iconSize} variant="default" animate />
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold tracking-tight',
            textSizes[size],
            getTextColor()
          )}>
            SmartTask
          </span>
          <span className={cn(
            'text-sm font-medium -mt-1',
            getSubtextColor()
          )}>
            Project Management
          </span>
        </div>
      )}
    </div>
  );
};

export default SmartTaskIcon;
