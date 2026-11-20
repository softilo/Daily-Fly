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
    sm: 'h-9 w-9',
    md: 'h-11 w-11 sm:h-12 sm:w-12',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <Link href="/" className="flex items-center gap-3 group">

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-xl sm:text-2xl text-[#0A3A23] tracking-tight font-serif">
            Daily
          </span>
          <span className="font-extrabold text-xl sm:text-2xl text-[#D9822B] tracking-tight font-serif">
            Fly
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-[#0A3A23]/80 tracking-wider uppercase -mt-1">
          Travel &amp; Tours
        </span>
        <span className="text-[9px] text-[#D9822B] font-medium italic hidden sm:block">
          Explore the world with us
        </span>
      </div>
    </Link>
  );
}
