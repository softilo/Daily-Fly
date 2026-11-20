import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'gold' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default:
        'bg-[#062416] text-white hover:bg-[#0A3A23] shadow-xs disabled:opacity-50',
      outline:
        'border border-gray-200 bg-white text-[#0A3A23] hover:bg-[#edf7f1] hover:border-[#0A3A23]/40 shadow-2xs disabled:opacity-50',
      secondary:
        'bg-[#0A3A23] text-white hover:bg-[#062416] shadow-xs disabled:opacity-50',
      gold:
        'bg-[#D9822B] text-white hover:bg-[#BF6F1E] shadow-sm shadow-[#D9822B]/25 disabled:opacity-50',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs disabled:opacity-50',
      ghost:
        'text-[#1F2937] hover:bg-[#edf7f1] hover:text-[#0A3A23] disabled:opacity-50',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8.5 px-3 text-xs',
      lg: 'h-11 px-6 text-sm sm:text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3A23] focus-visible:ring-offset-1 disabled:pointer-events-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
