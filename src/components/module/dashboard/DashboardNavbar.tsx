'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { StaffUser } from '@/types/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LogoutBtn } from '@/components/shared/LogoutBtn';
import { DASHBOARD_NAV_ITEMS } from '@/lib/navItem.config';
import { NavIcon } from './DashboardSidebar';
import { NotificationBell } from './NotificationBell';
import { useNotifications } from '@/components/providers/NotificationsProvider';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export function DashboardNavbar({ user }: { user: StaffUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const { data: notifications } = useNotifications();
  const { counts } = notifications;

  const visibleItems = DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role),
  );

  const activeItem =
    visibleItems.find((i) => i.href === pathname) ||
    visibleItems
      .filter((i) => i.href !== '/dashboard' && pathname.startsWith(i.href))
      .sort((a, b) => b.href.length - a.href.length)[0] ||
    visibleItems[0];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    if (!q) return;
    router.push(`/dashboard/leads?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-400">
            <Link href="/dashboard" className="font-medium hover:text-[#0A3A23]">
              Workspace
            </Link>
            {activeItem && activeItem.href !== '/dashboard' && (
              <>
                <span>/</span>
                <Link
                  href={activeItem.href}
                  className="truncate font-semibold text-[#0A3A23] hover:text-[#D9822B]"
                >
                  {activeItem.title}
                </Link>
              </>
            )}
          </div>
        </div>

        <form
          onSubmit={handleQuickSearch}
          className="hidden w-full max-w-xs items-center lg:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search name, phone, #code..."
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/80 pr-12 pl-8 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#0A3A23] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute top-1 right-1.5 bottom-1 rounded-lg px-2 text-[11px] font-bold text-[#0A3A23] hover:bg-[#edf7f1]"
            >
              Find
            </button>
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <Link
            href="/my-profile"
            className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200/90 bg-gray-50/70 px-2.5 py-1.5 transition hover:bg-gray-100"
            title={`${user.name} (${user.email})`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A3A23] text-[11px] font-bold text-white">
              {(user.name || 'S').charAt(0).toUpperCase()}
            </div>
            <span className="hidden max-w-[110px] truncate text-xs font-semibold text-gray-900 sm:inline">
              {user.name}
            </span>
            <StatusBadge status={user.role} />
          </Link>
          <div className="shrink-0">
            <LogoutBtn />
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#062416]/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#062416] text-slate-200 shadow-xl">
            <div className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 py-2.5">
              <Logo href="/dashboard" variant="sidebar" size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 p-3">
              <Link
                href="/dashboard/leads/create"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#D9822B] px-3 py-2 text-xs font-bold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Customer Inquiry</span>
              </Link>
            </div>

            <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
              {visibleItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                const badgeCount =
                  item.href === '/dashboard/visa-immigration/inquiries'
                    ? counts.unreadWebInquiries
                    : item.href === '/dashboard/leads'
                      ? counts.overdueFollowUps + counts.newLeadsNeedingAction
                      : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-medium',
                      isActive
                        ? 'bg-[#0A3A23] font-semibold text-[#F7D29E]'
                        : 'text-slate-300 hover:bg-white/10',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <NavIcon
                        name={item.icon}
                        className={isActive ? 'text-[#D9822B]' : 'text-slate-400'}
                      />
                      <span className="truncate">{item.title}</span>
                    </span>
                    {badgeCount > 0 && (
                      <span className="shrink-0 rounded-full bg-[#D9822B] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white tabular-nums">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
