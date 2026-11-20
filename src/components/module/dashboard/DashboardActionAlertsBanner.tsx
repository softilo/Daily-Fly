'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  FileCheck2,
  Inbox,
} from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationsProvider';

export function DashboardActionAlertsBanner() {
  const { data, isUpdating, markWebInquiriesRead } = useNotifications();
  const { counts } = data;

  const hasAlerts =
    counts.unreadWebInquiries > 0 ||
    counts.overdueFollowUps > 0 ||
    counts.pendingDraftQuotations > 0 ||
    counts.catalogAlerts > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {counts.unreadWebInquiries > 0 && (
        <div className="flex flex-col justify-between rounded-2xl border border-[#F7D29E] bg-[#FEF3E2]/70 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A5412]">
                Unread Web Inquiries
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                {counts.unreadWebInquiries}
              </p>
              <p className="mt-0.5 text-xs text-stone-600">
                Website visa &amp; eligibility submissions awaiting review
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#F7D29E] bg-white text-[#D9822B]">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#F7D29E]/60">
            <Link
              href="/dashboard/visa-immigration/inquiries"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3A23] hover:text-[#BF6F1E]"
            >
              Review Inquiries
              <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() => void markWebInquiriesRead()}
              disabled={isUpdating}
              className="text-[11px] font-semibold text-stone-600 hover:text-slate-900 disabled:opacity-50"
            >
              Mark read
            </button>
          </div>
        </div>
      )}

      {counts.overdueFollowUps > 0 && (
        <Link
          href="/dashboard/leads?stage=FOLLOW_UP"
          className="group flex flex-col justify-between rounded-2xl border border-rose-200 bg-rose-50/75 p-4 transition hover:bg-rose-50"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                Overdue Follow-Ups
              </p>
              <p className="mt-1 text-2xl font-extrabold text-rose-900 tabular-nums">
                {counts.overdueFollowUps}
              </p>
              <p className="mt-0.5 text-xs text-rose-700/90">
                Callback reminders past due date ({counts.dueTodayFollowUps} due
                within 24h)
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 border-t border-rose-200/70 pt-2 text-xs font-bold text-rose-800 group-hover:underline">
            Open Follow-Up Queue
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      )}

      {counts.pendingDraftQuotations > 0 && (
        <Link
          href="/dashboard/leads?stage=QUOTED"
          className="group flex flex-col justify-between rounded-2xl border border-[#b7dec7] bg-[#edf7f1]/75 p-4 transition hover:bg-[#edf7f1]"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0A3A23]">
                Draft Quotations
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                {counts.pendingDraftQuotations}
              </p>
              <p className="mt-0.5 text-xs text-stone-600">
                Quotation drafts awaiting approval &amp; PDF lock
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#b7dec7] bg-white text-[#0A3A23]">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 border-t border-[#b7dec7]/70 pt-2 text-xs font-bold text-[#0A3A23] group-hover:underline">
            Review Draft Quotes
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      )}

      {counts.catalogAlerts > 0 && (
        <Link
          href="/dashboard/packages"
          className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-300 hover:bg-stone-50"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Catalog &amp; Visa Alerts
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">
                {counts.catalogAlerts}
              </p>
              <p className="mt-0.5 text-xs text-stone-600">
                Expiring/expired package dates or paused visa services
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-amber-700">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 border-t border-stone-100 pt-2 text-xs font-bold text-slate-800 group-hover:underline">
            Inspect Catalog Status
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      )}
    </div>
  );
}
