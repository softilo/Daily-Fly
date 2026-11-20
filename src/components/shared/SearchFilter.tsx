'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface SearchFilterProps {
  paramName?: string;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchFilter({
  paramName = 'search',
  placeholder = 'Search by name, phone, email, destination...',
  debounceMs = 350,
  className = '',
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get(paramName) ?? '';
  const [value, setValue] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setValue(currentSearch);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(paramName, value.trim());
      } else {
        params.delete(paramName);
      }
      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, currentSearch, debounceMs, paramName, pathname, router, searchParams]);

  return (
    <div className={`relative min-w-[220px] flex-1 ${className}`}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9.5 pr-14 pl-9 text-xs sm:text-sm"
      />
      <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1.5">
        {isPending && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0A3A23] border-t-transparent" />
        )}
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear search"
            className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchFilter;
