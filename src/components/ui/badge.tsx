import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const styles = {
    default: 'bg-[#0A3A23] text-white border border-[#0A3A23]',
    success: 'bg-[#edf7f1] text-[#0A3A23] border border-[#0A3A23]/20',
    warning: 'bg-[#FEF3E2] text-[#BF6F1E] border border-[#F7D29E]',
    danger: 'bg-rose-50/80 text-rose-700 border border-rose-200/80',
    info: 'bg-[#edf7f1] text-[#0A3A23] border border-[#0A3A23]/20',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200/90',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
