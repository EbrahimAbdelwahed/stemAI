import React from 'react';
import { cn } from '../../lib/utils';

// Button variants
const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-800/50',
  ghost: 'hover:bg-gray-800/50 text-gray-300 hover:text-white',
  link: 'text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline',
  destructive: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700',
};

// Size variants
const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
  xl: 'px-8 py-4 text-lg rounded-xl',
  icon: 'p-2 rounded-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:pointer-events-none',
        'relative overflow-hidden',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles  
        sizeVariants[size],
        
        // Width modifier
        fullWidth && 'w-full',
        
        // Loading state
        loading && 'cursor-wait',
        
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button content */}
      <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </span>
    </button>
  );
}

// Icon-only button variant
export function IconButton({
  children,
  size = 'md',
  ...props
}: Omit<ButtonProps, 'icon' | 'iconPosition'>) {
  return (
    <Button size="icon" {...props}>
      {children}
    </Button>
  );
}

// Button with gradient effect
export function GradientButton({
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      className={cn(
        'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800',
        'hover:from-blue-700 hover:via-blue-800 hover:to-blue-900',
        'shadow-lg hover:shadow-xl hover:shadow-blue-500/25',
        className
      )}
      {...props}
    />
  );
} 