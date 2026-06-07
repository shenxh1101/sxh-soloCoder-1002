import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', size = 'md', removable, onRemove, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
          variant === 'default' && 'bg-slate-700 text-slate-200',
          variant === 'success' && 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
          variant === 'warning' && 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
          variant === 'danger' && 'bg-rose-900/50 text-rose-300 border border-rose-700/50',
          variant === 'info' && 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50',
          variant === 'outline' && 'bg-transparent text-slate-400 border border-slate-600/50',
          className
        )}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </span>
    );
  }
);
Tag.displayName = 'Tag';
