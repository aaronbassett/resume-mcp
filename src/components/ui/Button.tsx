import type { FC, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'fluid-primary' | 'fluid-secondary' | 'fluid-accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden';
    
    const variants = {
      primary: 'gradient-primary text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      'fluid-primary': 'text-primary-foreground shadow-lg hover:shadow-xl animate-fluid-primary',
      'fluid-secondary': 'text-primary-foreground shadow-lg hover:shadow-xl animate-fluid-secondary',
      'fluid-accent': 'text-primary-foreground shadow-lg hover:shadow-xl animate-fluid-accent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    };

    const isFluidVariant = variant.startsWith('fluid-');

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isFluidVariant && (
          <div className="absolute inset-0 opacity-100 animate-fluid-bg" />
        )}
        <span className="relative z-10">
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';