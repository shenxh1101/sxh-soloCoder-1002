import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'bg-amber-500 text-slate-900 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 focus:ring-amber-500',
          variant === 'secondary' && 'bg-slate-700 text-slate-100 hover:bg-slate-600 active:scale-95 focus:ring-slate-500',
          variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-slate-700/50 active:scale-95 focus:ring-slate-500',
          variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500 active:scale-95 focus:ring-rose-500',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-12 px-6 text-base',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
