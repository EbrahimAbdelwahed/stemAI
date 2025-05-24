import React from 'react';
import { cn } from '../../lib/utils';

// Card variants
const cardVariants = {
  default: 'bg-gray-900 border border-gray-800',
  enhanced: 'card-enhanced card-glow',
  glass: 'glass glass-hover',
  gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50',
  highlight: 'bg-gray-900 border border-blue-500/30 shadow-lg shadow-blue-500/10',
};

// Padding variants
const paddingVariants = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants;
  padding?: keyof typeof paddingVariants;
  interactive?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-xl shadow-md transition-all duration-300 ease-out',
        
        // Variant styles
        cardVariants[variant],
        
        // Padding
        paddingVariants[padding],
        
        // Interactive states
        interactive && 'cursor-pointer',
        hover && 'hover:shadow-xl hover:shadow-blue-500/5 hover:scale-[1.02] hover:-translate-y-1',
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card header component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card title component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  className, 
  children, 
  as: Component = 'h3',
  ...props 
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        'text-xl font-semibold leading-none tracking-tight text-white',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card description component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('text-gray-300 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Card content component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

// Card footer component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Feature card specific component for homepage
export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  action,
  className,
}: FeatureCardProps) {
  const isLink = !!action.href;
  const Component = isLink ? 'a' : 'div';
  
  return (
    <Card
      variant="enhanced"
      hover
      interactive
      className={cn('group max-w-sm', className)}
    >
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors duration-300">
            {icon}
          </div>
          <CardTitle className="group-hover:text-blue-300 transition-colors duration-300">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="group-hover:text-gray-200 transition-colors duration-300">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardFooter>
        <Component
          {...(isLink ? { href: action.href } : { onClick: action.onClick })}
          className="btn-primary w-full group-hover:scale-105 transition-transform duration-300"
        >
          {action.label}
        </Component>
      </CardFooter>
    </Card>
  );
} 