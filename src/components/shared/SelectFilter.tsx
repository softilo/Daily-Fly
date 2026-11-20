'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface SelectFilterOption {
  label: string;
  value: string;
}

interface SelectFilterProps {
  paramName: string;
  label?: string;
  placeholder?: string;
  options: SelectFilterOption[];
  className?: string;
}

export function SelectFilter({
  paramName,
  label,
  placeholder = 'All',
  options,
  className = '',
}: SelectFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = searchParams.get(paramName) ?? '';

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="whitespace-nowrap text-xs font-medium text-gray-500">
          {label}
        </span>
      )}
      <select
        value={currentValue}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className={`h-9.5 rounded-xl border px-3 py-1.5 text-xs transition focus:border-[#0A3A23] focus:outline-none sm:text-sm ${
          currentValue
            ? 'border-[#0A3A23] bg-[#edf7f1] font-semibold text-[#0A3A23]'
            : 'border-gray-200 bg-white text-gray-700'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectFilter;
