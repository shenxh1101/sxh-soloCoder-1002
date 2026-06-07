import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variant === 'default' && 'bg-slate-600 text-white',
        variant === 'success' && 'bg-emerald-500 text-white',
        variant === 'warning' && 'bg-amber-500 text-white',
        variant === 'danger' && 'bg-rose-500 text-white',
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
