'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useBrand } from '@/components/providers/BrandProvider';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  href = '/',
  inverted = false,
  size = 'md',
  showTagline = false,
  className,
}: LogoProps) {
  const brand = useBrand();
  const logoSrc = brand.logoUrl || '/logo.png';
  const isLocalAsset = logoSrc.startsWith('/');

  const boxSizes = {
    sm: 'h-9 w-9 rounded-xl p-0.5',
    md: 'h-12 w-12 sm:h-[52px] sm:w-[52px] rounded-xl p-0.5',
    lg: 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl p-1',
  }[size];

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <Link
      href={href}
      title={brand.agencyName}
      className={cn(
        'group inline-flex items-center gap-3 min-w-0 max-w-full',
        className,
      )}
    >
      <span
        className={cn(
          'relative aspect-square shrink-0 overflow-hidden bg-white transition-transform duration-300 group-hover:scale-105',
          boxSizes,
          inverted
            ? 'shadow-sm ring-1 ring-white/25'
            : 'shadow-2xs ring-1 ring-[#0A3A23]/12',
        )}
      >
        {isLocalAsset ? (
          <Image
            src={logoSrc}
            alt={`${brand.agencyName} Logo`}
            width={160}
            height={160}
            priority
            className="h-full w-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt={`${brand.agencyName} Logo`}
            className="h-full w-full object-contain"
          />
        )}
      </span>

      <span className="flex flex-col min-w-0 leading-none">
        <span
          className={cn(
            'truncate font-extrabold tracking-tight leading-none',
            titleSizes,
            inverted ? 'text-white' : 'text-[#0A3A23]',
          )}
        >
          {brand.logoPrimary}
          {brand.logoAccent && (
            <span className="text-[#D9822B]">{brand.logoAccent}</span>
          )}
        </span>

        {brand.logoSubtitle && (
          <span
            className={cn(
              'mt-0.5 truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em]',
              inverted ? 'text-slate-300' : 'text-[#0A3A23]/80',
            )}
          >
            {brand.logoSubtitle}
          </span>
        )}

        {showTagline && brand.tagline && (
          <span
            className={cn(
              'mt-0.5 hidden sm:block truncate text-[10px] font-medium italic',
              inverted ? 'text-[#F7D29E]' : 'text-[#D9822B]',
            )}
          >
            {brand.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
