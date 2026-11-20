import { NextRequest, NextResponse } from 'next/server';
import {
  isSameOriginRequest,
  NO_STORE_AUTH_HEADERS,
} from '@/lib/auth-cookies';
import {
  markAllNotificationsRead,
  markNotificationIdsRead,
  markWebInquiriesRead,
} from '@/lib/notifications-store';
import { getMe } from '@/services/auth/getMe';
import { getDashboardNotifications } from '@/services/notifications/notifications.service';

interface PatchNotificationsBody {
  action?:
    | 'mark_read'
    | 'mark_lead_read'
    | 'mark_web_inquiries_read'
    | 'mark_all_read';
  notificationIds?: unknown;
  leadId?: unknown;
}

export async function GET() {
  const user = await getMe();
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const payload = await getDashboardNotifications({
    userId: user.id,
    role: user.role,
  });

  return NextResponse.json(payload, {
    status: 200,
    headers: NO_STORE_AUTH_HEADERS,
  });
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden origin' },
      { status: 403, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const user = await getMe();
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const body = (await request.json().catch(() => ({}))) as PatchNotificationsBody;
  const action = body.action;

  if (action === 'mark_read') {
    const ids = Array.isArray(body.notificationIds)
      ? body.notificationIds.filter((v): v is string => typeof v === 'string')
      : [];
    if (ids.length > 0) {
      await markNotificationIdsRead(user.id, ids);
    }
  } else if (action === 'mark_lead_read') {
    const leadId = typeof body.leadId === 'string' ? body.leadId.trim() : '';
    if (leadId) {
      const current = await getDashboardNotifications({
        userId: user.id,
        role: user.role,
      });
      const matchingIds = current.items
        .filter(
          (item) =>
            !item.read &&
            (item.leadId === leadId ||
              item.id === `web-lead:${leadId}` ||
              item.id === `lead-new:${leadId}`),
        )
        .map((item) => item.id);

      // Always record direct web-lead / lead-new IDs even beyond top-80 window
      const idsToMark = Array.from(
        new Set([...matchingIds, `web-lead:${leadId}`, `lead-new:${leadId}`]),
      );
      await markNotificationIdsRead(user.id, idsToMark);
    }
  } else if (action === 'mark_web_inquiries_read') {
    const current = await getDashboardNotifications({
      userId: user.id,
      role: user.role,
    });
    const webIds = current.items
      .filter((item) => item.category === 'WEB_INQUIRY')
      .map((item) => item.id);
    await markWebInquiriesRead(user.id, webIds, current.generatedAt);
  } else if (action === 'mark_all_read') {
    const current = await getDashboardNotifications({
      userId: user.id,
      role: user.role,
    });
    const allIds = current.items.map((item) => item.id);
    await markAllNotificationsRead(user.id, allIds, current.generatedAt);
  } else {
    return NextResponse.json(
      { success: false, message: 'Unsupported notification action' },
      { status: 400, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const updated = await getDashboardNotifications({
    userId: user.id,
    role: user.role,
  });

  return NextResponse.json(updated, {
    status: 200,
    headers: NO_STORE_AUTH_HEADERS,
  });
}
