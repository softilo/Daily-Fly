'use client';

import React from 'react';
import { CheckCheck, Inbox } from 'lucide-react';
import { useNotifications } from '@/components/providers/NotificationsProvider';

export function InquiriesReadBanner({ total }: { total: number }) {
  const { data, isUpdating, markWebInquiriesRead } = useNotifications();
  const unreadCount = data.counts.unreadWebInquiries;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F7D29E]/80 bg-[#FEF3E2]/55 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#F7D29E] bg-white text-[#D9822B]">
          <Inbox className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 sm:text-sm">
            {unreadCount > 0 ? (
              <>
                <span className="text-[#BF6F1E] tabular-nums">{unreadCount}</span>{' '}
                Unread Web {unreadCount === 1 ? 'Inquiry' : 'Inquiries'}
              </>
            ) : (
              'All Web Inquiries Marked Read'
            )}
          </p>
          <p className="text-[11px] text-stone-600">
            Showing {total} total visa consultation{' '}
            {total === 1 ? 'record' : 'records'}. Opening a lead automatically
            clears its unread badge.
          </p>
        </div>
      </div>

      {unreadCount > 0 && (
        <button
          type="button"
          onClick={() => void markWebInquiriesRead()}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#0A3A23]/20 bg-[#0A3A23] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#062416] disabled:opacity-50"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Mark All Web Inquiries Read</span>
        </button>
      )}
    </div>
  );
}

export function InquiryUnreadBadge({
  inquiryId,
  leadId,
}: {
  inquiryId: string;
  leadId?: string | null;
}) {
  const { data } = useNotifications();
  const isUnread = data.items.some(
    (item) =>
      !item.read &&
      item.category === 'WEB_INQUIRY' &&
      (item.id === `web-visa:${inquiryId}` ||
        (leadId ? item.leadId === leadId : false)),
  );

  if (!isUnread) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#F7D29E] bg-[#FEF3E2] px-2 py-0.5 text-[10px] font-bold text-[#9A5412]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D9822B]" />
      Unread
    </span>
  );
}

export function UnreadWebInquiriesInlinePill() {
  const { data } = useNotifications();
  const unread = data.counts.unreadWebInquiries;

  if (unread <= 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#F7D29E] bg-[#FEF3E2] px-2 py-0.5 text-[11px] font-bold text-[#9A5412] tabular-nums">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D9822B]" />
      {unread} unread
    </span>
  );
}
