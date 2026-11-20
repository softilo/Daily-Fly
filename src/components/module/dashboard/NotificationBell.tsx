'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  Compass,
  FileCheck2,
  Inbox,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationsProvider';
import {
  DashboardNotificationItem,
  NotificationCategory,
} from '@/types/notifications';
import { cn } from '@/lib/utils';

type NotificationTab = 'ALL' | 'UNREAD' | 'WEB' | 'URGENT' | 'SYSTEM';

function formatRelativeTime(isoDate: string): string {
  const ts = Date.parse(isoDate);
  if (Number.isNaN(ts)) return '';
  const diffMs = Date.now() - ts;
  if (diffMs < 0) {
    const aheadMin = Math.round(Math.abs(diffMs) / 60_000);
    if (aheadMin < 60) return `In ${aheadMin}m`;
    const aheadHr = Math.round(aheadMin / 60);
    if (aheadHr < 24) return `In ${aheadHr}h`;
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getCategoryStyle(item: DashboardNotificationItem): {
  icon: React.ReactNode;
  iconBg: string;
  accentBar: string;
  pillClass: string;
} {
  switch (item.category as NotificationCategory) {
    case 'WEB_INQUIRY':
      return {
        icon: <Inbox className="h-4 w-4 text-[#BF6F1E]" />,
        iconBg: 'bg-[#FEF3E2] border-[#F7D29E]',
        accentBar: 'bg-[#D9822B]',
        pillClass: 'bg-[#FEF3E2] text-[#9A5412] border-[#F7D29E]',
      };
    case 'FOLLOW_UP':
      return item.priority === 'CRITICAL'
        ? {
            icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
            iconBg: 'bg-rose-50 border-rose-200',
            accentBar: 'bg-rose-600',
            pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
          }
        : {
            icon: <CalendarClock className="h-4 w-4 text-amber-700" />,
            iconBg: 'bg-amber-50 border-amber-200',
            accentBar: 'bg-amber-500',
            pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
          };
    case 'QUOTATION_APPROVAL':
      return {
        icon: <FileCheck2 className="h-4 w-4 text-[#0A3A23]" />,
        iconBg: 'bg-[#edf7f1] border-[#b7dec7]',
        accentBar: 'bg-[#0A3A23]',
        pillClass: 'bg-[#edf7f1] text-[#0A3A23] border-[#b7dec7]',
      };
    case 'LEAD_ACTION':
      return {
        icon: <UserPlus className="h-4 w-4 text-teal-700" />,
        iconBg: 'bg-teal-50 border-teal-200',
        accentBar: 'bg-teal-600',
        pillClass: 'bg-teal-50 text-teal-800 border-teal-200',
      };
    case 'CATALOG_ALERT':
      return {
        icon: <Compass className="h-4 w-4 text-amber-700" />,
        iconBg: 'bg-amber-50 border-amber-200',
        accentBar: 'bg-amber-500',
        pillClass: 'bg-stone-100 text-stone-700 border-stone-200',
      };
    case 'SECURITY_AUDIT':
    default:
      return {
        icon: <ShieldAlert className="h-4 w-4 text-slate-700" />,
        iconBg: 'bg-slate-100 border-slate-200',
        accentBar: 'bg-slate-600',
        pillClass: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

export function NotificationBell() {
  const {
    data,
    isRefreshing,
    isUpdating,
    refreshNotifications,
    markNotificationRead,
    markWebInquiriesRead,
    markAllRead,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('ALL');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { counts, items } = data;

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'UNREAD':
        return items.filter((item) => !item.read);
      case 'WEB':
        return items.filter((item) => item.category === 'WEB_INQUIRY');
      case 'URGENT':
        return items.filter(
          (item) =>
            item.category === 'FOLLOW_UP' ||
            item.category === 'QUOTATION_APPROVAL',
        );
      case 'SYSTEM':
        return items.filter(
          (item) =>
            item.category === 'LEAD_ACTION' ||
            item.category === 'CATALOG_ALERT' ||
            item.category === 'SECURITY_AUDIT',
        );
      case 'ALL':
      default:
        return items;
    }
  }, [activeTab, items]);

  const urgentItemsCount = useMemo(
    () =>
      items.filter(
        (i) =>
          (i.category === 'FOLLOW_UP' || i.category === 'QUOTATION_APPROVAL') &&
          !i.read,
      ).length,
    [items],
  );

  const systemItemsCount = useMemo(
    () =>
      items.filter(
        (i) =>
          (i.category === 'LEAD_ACTION' ||
            i.category === 'CATALOG_ALERT' ||
            i.category === 'SECURITY_AUDIT') &&
          !i.read,
      ).length,
    [items],
  );

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      void refreshNotifications();
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5">
      {/* Direct Unread Web Inquiries Counter Pill (Visible on sm+ when > 0) */}
      {counts.unreadWebInquiries > 0 && (
        <Link
          href="/dashboard/visa-immigration/inquiries"
          title="Open Unread Web Inquiries"
          className="hidden items-center gap-1.5 rounded-xl border border-[#F7D29E] bg-[#FEF3E2] px-2.5 py-1.5 text-[11px] font-bold text-[#9A5412] transition hover:bg-[#FDE6C4] sm:inline-flex whitespace-nowrap"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9822B] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D9822B]" />
          </span>
          <span className="tabular-nums">{counts.unreadWebInquiries}</span>
          <span className="hidden xl:inline">Unread Web Inquiries</span>
          <span className="xl:hidden">Web</span>
        </Link>
      )}

      {/* Bell Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-label={`Notifications (${counts.totalUnread} unread, ${counts.unreadWebInquiries} unread web inquiries)`}
        title={`${counts.totalUnread} unread notifications (${counts.unreadWebInquiries} unread web inquiries)`}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition focus:outline-none',
          open
            ? 'border-[#0A3A23] bg-[#edf7f1] text-[#0A3A23]'
            : 'border-gray-200/90 bg-gray-50/70 text-gray-700 hover:bg-gray-100',
        )}
      >
        <Bell className="h-4 w-4" />
        {counts.totalUnread > 0 && (
          <span
            className={cn(
              'absolute -top-1.5 -right-1.5 flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-extrabold leading-none text-white ring-2 ring-white tabular-nums',
              counts.overdueFollowUps > 0 || counts.unreadWebInquiries > 0
                ? 'bg-rose-600'
                : 'bg-[#D9822B]',
            )}
          >
            {counts.totalUnread > 99 ? '99+' : counts.totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Notification Center */}
      {open && (
        <div className="fixed top-16 right-3 left-3 z-50 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-[440px]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-[#FAF9F6] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Notifications Center
                </h2>
                {counts.totalUnread > 0 && (
                  <span className="rounded-full bg-[#0A3A23] px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">
                    {counts.totalUnread} Unread
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-stone-500">
                <strong className="text-[#9A5412]">
                  {counts.unreadWebInquiries} unread web{' '}
                  {counts.unreadWebInquiries === 1 ? 'inquiry' : 'inquiries'}
                </strong>{' '}
                · {counts.overdueFollowUps} overdue follow-ups
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refreshNotifications()}
                disabled={isRefreshing}
                title="Refresh notifications"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
                />
              </button>
              {counts.totalUnread > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0A3A23] transition hover:bg-[#edf7f1] disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Operational Summary Strip */}
          <div className="grid grid-cols-3 gap-2 border-b border-stone-100 bg-white px-3.5 py-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('WEB')}
              className={cn(
                'rounded-xl border px-2.5 py-1.5 text-left transition',
                counts.unreadWebInquiries > 0
                  ? 'border-[#F7D29E] bg-[#FEF3E2]/70 hover:bg-[#FEF3E2]'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Unread Web
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-[#9A5412] tabular-nums">
                {counts.unreadWebInquiries}
                <span className="ml-1 text-[10px] font-medium text-stone-500">
                  / {counts.totalWebInquiries}
                </span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('URGENT')}
              className={cn(
                'rounded-xl border px-2.5 py-1.5 text-left transition',
                counts.overdueFollowUps > 0
                  ? 'border-rose-200 bg-rose-50/70 hover:bg-rose-50'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Overdue Tasks
              </p>
              <p
                className={cn(
                  'mt-0.5 text-sm font-extrabold tabular-nums',
                  counts.overdueFollowUps > 0
                    ? 'text-rose-700'
                    : 'text-slate-800',
                )}
              >
                {counts.overdueFollowUps}
                <span className="ml-1 text-[10px] font-medium text-stone-500">
                  due
                </span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('URGENT')}
              className={cn(
                'rounded-xl border px-2.5 py-1.5 text-left transition',
                counts.pendingDraftQuotations > 0
                  ? 'border-[#b7dec7] bg-[#edf7f1]/80 hover:bg-[#edf7f1]'
                  : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Draft Quotes
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-[#0A3A23] tabular-nums">
                {counts.pendingDraftQuotations}
                <span className="ml-1 text-[10px] font-medium text-stone-500">
                  pending
                </span>
              </p>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-stone-100 bg-stone-50/60 px-3 py-2">
            {(
              [
                { key: 'ALL', label: 'All', badge: items.length },
                {
                  key: 'WEB',
                  label: 'Web Inquiries',
                  badge: counts.unreadWebInquiries,
                  highlight: counts.unreadWebInquiries > 0,
                },
                { key: 'UNREAD', label: 'Unread', badge: counts.totalUnread },
                {
                  key: 'URGENT',
                  label: 'Follow-Ups & Quotes',
                  badge: urgentItemsCount,
                },
                {
                  key: 'SYSTEM',
                  label: 'Leads & Alerts',
                  badge: systemItemsCount,
                },
              ] as Array<{
                key: NotificationTab;
                label: string;
                badge: number;
                highlight?: boolean;
              }>
            ).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
                    isActive
                      ? 'bg-[#0A3A23] text-white'
                      : 'text-stone-600 hover:bg-stone-200/70',
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.highlight
                            ? 'bg-[#D9822B] text-white'
                            : 'bg-stone-200 text-stone-700',
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-action when viewing Web Inquiries tab */}
          {activeTab === 'WEB' && counts.unreadWebInquiries > 0 && (
            <div className="flex items-center justify-between border-b border-amber-100 bg-[#FEF3E2]/50 px-3.5 py-2 text-[11px]">
              <span className="font-medium text-[#9A5412]">
                {counts.unreadWebInquiries} unread website inquiry waiting
              </span>
              <button
                type="button"
                onClick={() => void markWebInquiriesRead()}
                disabled={isUpdating}
                className="font-bold text-[#0A3A23] hover:underline disabled:opacity-50"
              >
                Mark web read
              </button>
            </div>
          )}

          {/* Scrollable Notification Feed */}
          <div className="max-h-[380px] flex-1 divide-y divide-stone-100 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-[#0A3A23]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {activeTab === 'WEB'
                    ? 'No unread web inquiries right now'
                    : 'All caught up!'}
                </p>
                <p className="mt-1 max-w-xs text-xs text-stone-500">
                  New customer website inquiries, overdue follow-ups, quotation
                  approvals, and catalog alerts will appear here automatically.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const style = getCategoryStyle(item);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'group relative flex items-start gap-3 px-4 py-3 transition-colors',
                      item.read
                        ? 'bg-white hover:bg-stone-50/80'
                        : 'bg-[#FAF9F6] hover:bg-stone-50',
                    )}
                  >
                    {!item.read && (
                      <span
                        className={cn(
                          'absolute top-2 bottom-2 left-0 w-1 rounded-r-full',
                          style.accentBar,
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
                        style.iconBg,
                      )}
                    >
                      {style.icon}
                    </div>

                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!item.read) {
                          void markNotificationRead(item.id);
                        }
                        setOpen(false);
                      }}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-xs leading-snug group-hover:text-[#0A3A23]',
                            item.read
                              ? 'font-medium text-slate-700'
                              : 'font-bold text-slate-900',
                          )}
                        >
                          {item.title}
                        </p>
                        {!item.read && (
                          <span
                            title="Unread"
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D9822B]"
                          />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-stone-600">
                        {item.description}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {item.metaLabel && (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                              style.pillClass,
                            )}
                          >
                            {item.metaLabel}
                          </span>
                        )}
                        {item.sourceTag && (
                          <span className="text-[10px] font-medium text-stone-400">
                            {item.sourceTag}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400">
                          · {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </Link>

                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void markNotificationRead(item.id);
                        }}
                        disabled={isUpdating}
                        title="Mark as read"
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 opacity-80 transition hover:border-[#0A3A23] hover:text-[#0A3A23] group-hover:opacity-100"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="flex items-center justify-between gap-2 border-t border-stone-100 bg-[#FAF9F6] px-4 py-2.5 text-xs">
            <Link
              href="/dashboard/visa-immigration/inquiries"
              onClick={() => setOpen(false)}
              className="font-semibold text-[#0A3A23] hover:text-[#D9822B]"
            >
              Web Visa Inquiries ({counts.unreadWebInquiries} unread) →
            </Link>
            <Link
              href="/dashboard/leads"
              onClick={() => setOpen(false)}
              className="font-medium text-stone-500 hover:text-slate-900"
            >
              Lead CRM →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
