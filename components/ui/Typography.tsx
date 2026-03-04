import React from 'react';
import { cn } from '../../lib/utils';

// Typography variants
const typographyVariants = {
  h1: 'text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold tracking-tight',
  h4: 'text-xl md:text-2xl font-semibold tracking-tight',
  h5: 'text-lg md:text-xl font-semibold',
  h6: 'text-base md:text-lg font-semibold',
  p: 'text-base leading-relaxed',
  lead: 'text-lg md:text-xl text-muted-foreground leading-relaxed',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium',
  muted: 'text-sm text-muted-foreground',
  code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
};

// Color variants
const colorVariants = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-muted-foreground',
  accent: 'text-blue-400',
  gradient: 'text-gradient',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  muted: 'text-gray-400',
};

export interface TypographyProps {
  variant?: keyof typeof typographyVariants;
  color?: keyof typeof colorVariants;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  gradient?: boolean;
  shadow?: boolean;
}

export function Typography({
  variant = 'p',
  color = 'default',
  className,
  children,
  as,
  gradient = false,
  shadow = false,
  ...props
}: TypographyProps) {
  const Component = as || getDefaultComponent(variant);
  
  return (
    <Component
      className={cn(
        typographyVariants[variant],
        colorVariants[color],
        gradient && 'text-gradient',
        shadow && 'text-shadow',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

function getDefaultComponent(variant: keyof typeof typographyVariants): React.ElementType {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'h5':
      return 'h5';
    case 'h6':
      return 'h6';
    case 'lead':
    case 'large':
    case 'p':
      return 'p';
    case 'small':
    case 'muted':
      return 'span';
    case 'code':
      return 'code';
    default:
      return 'p';
  }
}

// Convenience components
export function Heading1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" {...props} />;
}

export function Heading2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function Heading3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function Lead(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="lead" {...props} />;
}

export function Muted(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="muted" {...props} />;
}

export function Code(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="code" {...props} />;
} 