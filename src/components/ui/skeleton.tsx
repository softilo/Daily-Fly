import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'emerald' | 'dark';
}

export function Skeleton({
  className,
  tone = 'default',
  ...props
}: SkeletonProps) {
  const toneClass =
    tone === 'dark'
      ? 'bg-white/15'
      : tone === 'emerald'
        ? 'bg-[#dcebe2]'
        : 'bg-gray-200/80';

  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl', toneClass, className)}
      {...props}
    />
  );
}
