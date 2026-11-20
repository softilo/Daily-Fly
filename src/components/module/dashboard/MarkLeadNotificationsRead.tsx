'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/components/providers/NotificationsProvider';

export function MarkLeadNotificationsRead({ leadId }: { leadId: string }) {
  const { markLeadRead } = useNotifications();

  useEffect(() => {
    if (leadId) {
      void markLeadRead(leadId);
    }
  }, [leadId, markLeadRead]);

  return null;
}
