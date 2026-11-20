import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-[#1F2937] placeholder:text-gray-400 focus:border-[#0A3A23] focus:outline-none focus:ring-2 focus:ring-[#0A3A23]/15 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[96px] w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-gray-400 focus:border-[#0A3A23] focus:outline-none focus:ring-2 focus:ring-[#0A3A23]/15 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block text-sm font-semibold text-gray-700 mb-1.5',
        className,
      )}
      {...props}
    />
  );
}
