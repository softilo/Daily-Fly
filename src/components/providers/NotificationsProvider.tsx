'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  DashboardNotificationItem,
  DashboardNotificationsPayload,
} from '@/types/notifications';

const POLL_INTERVAL_MS = 45_000;

const EMPTY_NOTIFICATIONS: DashboardNotificationsPayload = {
  items: [],
  counts: {
    totalUnread: 0,
    unreadWebInquiries: 0,
    totalWebInquiries: 0,
    overdueFollowUps: 0,
    dueTodayFollowUps: 0,
    openFollowUps: 0,
    pendingDraftQuotations: 0,
    newLeadsNeedingAction: 0,
    catalogAlerts: 0,
    securityAlerts: 0,
    urgentUnread: 0,
  },
  unreadWebInquiryIds: [],
  generatedAt: '',
};

interface NotificationsContextValue {
  data: DashboardNotificationsPayload;
  isRefreshing: boolean;
  isUpdating: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markLeadRead: (leadId: string) => Promise<void>;
  markWebInquiriesRead: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  data: EMPTY_NOTIFICATIONS,
  isRefreshing: false,
  isUpdating: false,
  refreshNotifications: async () => {},
  markNotificationRead: async () => {},
  markLeadRead: async () => {},
  markWebInquiriesRead: async () => {},
  markAllRead: async () => {},
});

function recomputeCounts(
  prev: DashboardNotificationsPayload,
  items: DashboardNotificationItem[],
): DashboardNotificationsPayload {
  const unreadItems = items.filter((i) => !i.read);
  const unreadWebItems = unreadItems.filter((i) => i.category === 'WEB_INQUIRY');

  return {
    ...prev,
    items,
    counts: {
      ...prev.counts,
      totalUnread: unreadItems.length,
      unreadWebInquiries: unreadWebItems.length,
      urgentUnread: unreadItems.filter(
        (i) => i.priority === 'CRITICAL' || i.priority === 'HIGH',
      ).length,
    },
    unreadWebInquiryIds: unreadWebItems.map((i) =>
      i.id.startsWith('web-visa:') ? i.id.slice('web-visa:'.length) : i.id,
    ),
  };
}

export function NotificationsProvider({
  initialData,
  children,
}: {
  initialData: DashboardNotificationsPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [data, setData] = useState<DashboardNotificationsPayload>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const initialPathnameRef = useRef(pathname);
  const markedLeadRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refreshNotifications = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/notifications', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const fresh = (await res.json()) as DashboardNotificationsPayload;
      if (fresh && Array.isArray(fresh.items)) {
        setData(fresh);
      }
    } catch {
      // Non-fatal network error; retain current state until next poll
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const patchNotifications = useCallback(
    async (payload: Record<string, unknown>) => {
      setIsUpdating(true);
      try {
        const res = await fetch('/api/dashboard/notifications', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const fresh = (await res.json()) as DashboardNotificationsPayload;
        if (fresh && Array.isArray(fresh.items)) {
          setData(fresh);
        }
      } catch {
        // Ignore transient mutation failure
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      setData((prev) => {
        const target = prev.items.find((i) => i.id === id);
        if (!target || target.read) return prev;
        return recomputeCounts(
          prev,
          prev.items.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        );
      });
      await patchNotifications({ action: 'mark_read', notificationIds: [id] });
    },
    [patchNotifications],
  );

  const markLeadRead = useCallback(
    async (leadId: string) => {
      if (!leadId || markedLeadRef.current.has(leadId)) return;
      markedLeadRef.current.add(leadId);

      setData((prev) => {
        const hasUnread = prev.items.some(
          (i) => !i.read && i.leadId === leadId,
        );
        if (!hasUnread) return prev;
        return recomputeCounts(
          prev,
          prev.items.map((item) =>
            item.leadId === leadId ? { ...item, read: true } : item,
          ),
        );
      });
      await patchNotifications({ action: 'mark_lead_read', leadId });
    },
    [patchNotifications],
  );

  const markWebInquiriesRead = useCallback(async () => {
    setData((prev) =>
      recomputeCounts(
        prev,
        prev.items.map((item) =>
          item.category === 'WEB_INQUIRY' ? { ...item, read: true } : item,
        ),
      ),
    );
    await patchNotifications({ action: 'mark_web_inquiries_read' });
  }, [patchNotifications]);

  const markAllRead = useCallback(async () => {
    setData((prev) =>
      recomputeCounts(
        prev,
        prev.items.map((item) => ({ ...item, read: true })),
      ),
    );
    await patchNotifications({ action: 'mark_all_read' });
  }, [patchNotifications]);

  // Refresh after navigating to another dashboard screen
  useEffect(() => {
    if (initialPathnameRef.current !== pathname) {
      initialPathnameRef.current = pathname;
      void refreshNotifications();
    }
  }, [pathname, refreshNotifications]);

  // Background poll every 45s while visible + refresh on tab focus
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshNotifications();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshNotifications();
      }
    };

    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshNotifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      data,
      isRefreshing,
      isUpdating,
      refreshNotifications,
      markNotificationRead,
      markLeadRead,
      markWebInquiriesRead,
      markAllRead,
    }),
    [
      data,
      isRefreshing,
      isUpdating,
      refreshNotifications,
      markNotificationRead,
      markLeadRead,
      markWebInquiriesRead,
      markAllRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}
