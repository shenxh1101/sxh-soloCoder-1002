import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: React.ReactNode;
  inputSize?: 'sm' | 'md';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, inputSize = 'md', ...props }, ref) => (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'flex w-full rounded-lg border border-slate-600/50 bg-slate-900/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200',
          inputSize === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 py-2 text-sm',
          icon && 'pl-9',
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';
