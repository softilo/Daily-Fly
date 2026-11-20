'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Menu, Phone, Search, X } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useBrand } from '@/components/providers/BrandProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Visa & Immigration', href: '/visa-services', exact: false },
  { label: 'Tour & Hajj Packages', href: '/packages', exact: false },
  { label: 'Free Eligibility Check', href: '/contact', exact: false },
];

export function Navbar() {
  const pathname = usePathname();
  const brand = useBrand();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cleanPhone = brand.phone.replace(/\s+/g, '');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isRouteActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="hidden border-b border-white/10 bg-[#062416] text-xs text-slate-200 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex shrink-0 items-center gap-1.5 font-medium transition hover:text-[#F7D29E]"
            >
              <Phone className="h-3.5 w-3.5 text-[#D9822B]" />
              <span>{brand.phone}</span>
            </a>
            <a
              href={`mailto:${brand.email}`}
              className="inline-flex min-w-0 items-center gap-1.5 truncate font-medium transition hover:text-[#F7D29E]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#D9822B]" />
              <span className="truncate">{brand.email}</span>
            </a>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-slate-300">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D9822B]" />
            <span className="max-w-md truncate">{brand.address}</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled
            ? 'border-b border-gray-200/80 bg-white/95 py-2 shadow-md backdrop-blur-md'
            : 'border-b border-gray-100 bg-white py-2.5',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 p-2 text-[#0A3A23] hover:bg-[#edf7f1] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo href="/" size="md" />
          </div>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1.5">
            {NAV_LINKS.map((item) => {
              const active = isRouteActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] font-medium transition-colors xl:px-3 xl:text-sm',
                    active
                      ? 'bg-[#edf7f1] font-bold text-[#0A3A23]'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#0A3A23]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/track-status"
              className={cn(
                'ml-1 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors xl:px-3.5',
                pathname.startsWith('/track-status')
                  ? 'border-[#0A3A23] bg-[#0A3A23] text-white shadow-xs'
                  : 'border-[#0A3A23]/20 bg-[#edf7f1] text-[#0A3A23] hover:bg-[#0A3A23] hover:text-white',
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Track My File
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/track-status"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#0A3A23]/20 bg-[#edf7f1] px-2.5 py-1.5 text-xs font-bold text-[#0A3A23] lg:hidden"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Track</span>
            </Link>
            <Link href="/contact" className="shrink-0">
              <Button variant="gold" size="sm" className="px-3 sm:px-3.5">
                <span className="sm:hidden">Quote</span>
                <span className="hidden sm:inline">Apply / Get Quote</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#062416]/55 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
              <Logo href="/" size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-[#0A3A23]" />
              </button>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
              {NAV_LINKS.map((item) => {
                const active = isRouteActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-xl px-3.5 py-2.5 text-sm font-medium',
                      active
                        ? 'border border-[#0A3A23]/20 bg-[#edf7f1] font-bold text-[#0A3A23]'
                        : 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/track-status"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl border border-[#0A3A23]/20 bg-[#edf7f1] px-3.5 py-2.5 text-sm font-bold text-[#0A3A23]"
              >
                <Search className="h-4 w-4 text-[#D9822B]" />
                Track My File Status
              </Link>
            </div>

            <div className="space-y-2 border-t border-gray-100 bg-[#F9FAFB] p-4 text-xs text-gray-600">
              <p className="font-semibold text-[#0A3A23]">Direct Office Contact</p>
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#D9822B] px-3 py-2.5 font-bold text-white shadow-xs hover:bg-[#BF6F1E]"
              >
                <Phone className="h-3.5 w-3.5 fill-white" />
                Call {brand.phone}
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-1.5 truncate rounded-xl border border-gray-200 bg-white px-3 py-2 font-medium text-gray-700 hover:text-[#0A3A23]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#D9822B]" />
                <span className="truncate">{brand.email}</span>
              </a>
              <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-gray-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D9822B]" />
                <span>{brand.address}</span>
              </p>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#0A3A23] bg-white px-3 py-2 font-bold text-[#0A3A23] hover:bg-[#edf7f1]"
              >
                Apply / Get Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
