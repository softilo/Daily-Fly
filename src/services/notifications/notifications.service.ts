import { getAuditLogs } from '@/services/audit/audit.service';
import { getDashboardSummary } from '@/services/dashboard/dashboard.service';
import { getLeads } from '@/services/leads/leads.service';
import { getPackages } from '@/services/packages/packages.service';
import {
  getAdminVisaInquiries,
  getAdminVisaOverview,
} from '@/services/visa/visa.service';
import {
  getNotificationReadState,
  isNotificationMarkedRead,
  StaffNotificationReadState,
} from '@/lib/notifications-store';
import {
  DashboardNotificationItem,
  DashboardNotificationsPayload,
  NotificationPriority,
} from '@/types/notifications';
import { AuditLog, StaffRole } from '@/types/api';

// Re-export only what's cleanly typed below without colliding with src/types/api.ts
export type { DashboardNotificationItem, DashboardNotificationsPayload };

const PRIORITY_RANK: Record<NotificationPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
};

const IMPORTANT_AUDIT_ACTIONS = new Set([
  'USER_CREATED',
  'USER_ROLE_CHANGED',
  'USER_STATUS_CHANGED',
  'SETTINGS_UPDATED',
  'QUOTATION_APPROVED',
]);

const VISA_CATEGORY_LABELS: Record<string, string> = {
  WORK_VISA: 'Work Visa',
  WORK_PERMIT: 'Work Permit',
  STUDENT_VISA: 'Student Visa',
  TOURIST_VISA: 'Tourist Visa',
  BUSINESS_VISA: 'Business Visa',
  OTHER: 'General Visa',
};

const SECTOR_LABELS: Record<string, string> = {
  TOUR: 'Holiday Tour',
  HAJJ_UMRAH: 'Hajj & Umrah',
  WORK_PERMIT: 'Work Permit',
  STUDENT_VISA: 'Student Visa',
};

function formatAuditNotification(log: AuditLog): {
  title: string;
  description: string;
  href: string;
} {
  const actorName = log.actor?.name || 'Staff Member';
  switch (log.action) {
    case 'USER_CREATED':
      return {
        title: 'New Staff Account Created',
        description: `${actorName} provisioned a new workspace staff account.`,
        href: '/dashboard/staff',
      };
    case 'USER_ROLE_CHANGED':
      return {
        title: 'Staff Role Permission Updated',
        description: `${actorName} updated RBAC permissions on a staff profile.`,
        href: '/dashboard/staff',
      };
    case 'USER_STATUS_CHANGED':
      return {
        title: 'Staff Account Status Changed',
        description: `${actorName} enabled or deactivated a staff member account.`,
        href: '/dashboard/staff',
      };
    case 'SETTINGS_UPDATED':
      return {
        title: 'Agency Settings Updated',
        description: `${actorName} modified official branding, contacts, tax, or PDF terms.`,
        href: '/dashboard/settings',
      };
    case 'QUOTATION_APPROVED':
      return {
        title: 'Quotation Formally Approved',
        description: `${actorName} approved & locked quotation ${log.entityId ? `#${log.entityId.slice(0, 8)}` : ''} for PDF export.`,
        href: log.entityId ? `/dashboard/quotations/${log.entityId}` : '/dashboard/audit-logs',
      };
    default:
      return {
        title: log.action.replace(/_/g, ' '),
        description: `${actorName} triggered ${log.entityType} update.`,
        href: '/dashboard/audit-logs',
      };
  }
}

export async function getDashboardNotifications({
  userId,
  role,
}: {
  userId: string;
  role: StaffRole;
}): Promise<DashboardNotificationsPayload> {
  const nowMs = Date.now();
  const oneDayAheadMs = nowMs + 24 * 60 * 60 * 1000;
  const sevenDaysAheadMs = nowMs + 7 * 24 * 60 * 60 * 1000;
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const isAdmin = role === 'OWNER_ADMIN';

  const [
    summaryResult,
    visaInquiriesResult,
    websiteLeadsResult,
    newLeadsResult,
    packagesResult,
    visaOverviewResult,
    auditLogsResult,
    readState,
  ] = await Promise.all([
    getDashboardSummary().catch(() => null),
    getAdminVisaInquiries({ page: 1, limit: 100 }).catch(() => null),
    getLeads({
      page: 1,
      limit: 50,
      source: 'WEBSITE',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }).catch(() => null),
    getLeads({
      page: 1,
      limit: 25,
      stage: 'NEW',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }).catch(() => null),
    getPackages({ page: 1, limit: 50, isArchived: false }).catch(() => null),
    getAdminVisaOverview().catch(() => null),
    isAdmin ? getAuditLogs().catch(() => null) : Promise.resolve(null),
    getNotificationReadState(userId).catch(
      (): StaffNotificationReadState => ({
        readIds: {},
        updatedAt: new Date(0).toISOString(),
      }),
    ),
  ]);

  const rawItems: Array<Omit<DashboardNotificationItem, 'read'> & { forceRead?: boolean }> = [];
  const visaInquiryLeadIds = new Set<string>();
  const webInquiryLeadIds = new Set<string>();

  // --------------------------------------------------------------------------
  // 1. WEB INQUIRIES (Visa Consultation Forms + Website Eligibility Assessments)
  // --------------------------------------------------------------------------
  const visaInquiries = visaInquiriesResult?.data ?? [];
  for (const inq of visaInquiries) {
    if (inq.leadId) {
      visaInquiryLeadIds.add(inq.leadId);
      webInquiryLeadIds.add(inq.leadId);
    }

    const stage = inq.lead?.stage;
    const isClosedLead = stage === 'WON' || stage === 'LOST';
    const categoryLabel = VISA_CATEGORY_LABELS[inq.category] || inq.category;
    const countryLabel = inq.country?.name || 'Visa Inquiry';
    const serviceLabel = inq.visaService?.title || categoryLabel;
    const trackingCode = inq.lead?.trackingCode;

    rawItems.push({
      id: `web-visa:${inq.id}`,
      category: 'WEB_INQUIRY',
      priority: !isClosedLead && (!stage || stage === 'NEW') ? 'HIGH' : 'NORMAL',
      title: `Web Visa Inquiry: ${inq.fullName}`,
      description: `${countryLabel} · ${serviceLabel}${inq.phone ? ` · ${inq.phone}` : ''}`,
      metaLabel: trackingCode ? `#${trackingCode}` : stage || 'NEW',
      sourceTag: 'Web Visa',
      href: inq.leadId
        ? `/dashboard/leads/${inq.leadId}`
        : '/dashboard/visa-immigration/inquiries',
      leadId: inq.leadId,
      createdAt: inq.createdAt,
      forceRead: isClosedLead,
    });
  }

  const websiteLeads = websiteLeadsResult?.data ?? [];
  for (const lead of websiteLeads) {
    if (visaInquiryLeadIds.has(lead.id)) {
      continue;
    }
    webInquiryLeadIds.add(lead.id);
    const isClosedLead = lead.stage === 'WON' || lead.stage === 'LOST';
    const sectorLabel = SECTOR_LABELS[lead.category || 'TOUR'] || 'General Inquiry';

    rawItems.push({
      id: `web-lead:${lead.id}`,
      category: 'WEB_INQUIRY',
      priority: lead.stage === 'NEW' ? 'HIGH' : 'NORMAL',
      title: `Website Inquiry: ${lead.customerName}`,
      description: `${sectorLabel}${lead.destination ? ` · ${lead.destination}` : ''}${lead.customerPhone ? ` · ${lead.customerPhone}` : ''}`,
      metaLabel: lead.trackingCode ? `#${lead.trackingCode}` : lead.stage,
      sourceTag: 'Website',
      href: `/dashboard/leads/${lead.id}`,
      leadId: lead.id,
      createdAt: lead.createdAt,
      forceRead: isClosedLead,
    });
  }

  // --------------------------------------------------------------------------
  // 2. OVERDUE & UPCOMING FOLLOW-UP TASKS (Next 24h & Overdue)
  // --------------------------------------------------------------------------
  const upcomingTasks = summaryResult?.followUps?.upcomingTasks ?? [];
  const totalOverdueFollowUps = summaryResult?.followUps?.overdueCount ?? 0;
  const totalOpenFollowUps = summaryResult?.followUps?.openCount ?? 0;
  let dueTodayCount = 0;
  let overdueTasksShown = 0;

  for (const task of upcomingTasks) {
    const dueMs = Date.parse(task.dueAt);
    const isOverdue = Boolean(
      task.isOverdue || (!Number.isNaN(dueMs) && dueMs < nowMs),
    );
    const isDueSoon = !isOverdue && !Number.isNaN(dueMs) && dueMs <= oneDayAheadMs;

    if (!isOverdue && !isDueSoon) {
      continue;
    }

    if (isOverdue) overdueTasksShown += 1;
    if (isDueSoon) dueTodayCount += 1;

    rawItems.push({
      id: `followup:${task.id}`,
      category: 'FOLLOW_UP',
      priority: isOverdue ? 'CRITICAL' : 'HIGH',
      title: isOverdue
        ? `Overdue Follow-Up: ${task.lead?.customerName || 'Customer File'}`
        : `Follow-Up Due Soon: ${task.lead?.customerName || 'Customer File'}`,
      description:
        task.note ||
        `Scheduled reminder assigned to ${task.assignedTo?.name || 'staff member'}.`,
      metaLabel: isOverdue ? 'Overdue' : 'Due ≤ 24h',
      sourceTag: 'Follow-Up',
      href: task.lead?.id ? `/dashboard/leads/${task.lead.id}` : '/dashboard/leads?stage=FOLLOW_UP',
      leadId: task.lead?.id,
      createdAt: task.dueAt || task.createdAt,
    });
  }

  if (totalOverdueFollowUps > overdueTasksShown) {
    rawItems.push({
      id: 'followup:overdue-summary',
      category: 'FOLLOW_UP',
      priority: 'CRITICAL',
      title: `${totalOverdueFollowUps} Overdue Follow-Up Reminders`,
      description:
        'Open client callback deadlines have passed. Review and update follow-up files immediately.',
      metaLabel: `${totalOverdueFollowUps} Overdue`,
      sourceTag: 'Action Needed',
      href: '/dashboard/leads?stage=FOLLOW_UP',
      createdAt: new Date(nowMs).toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // 3. PENDING QUOTATION DRAFT APPROVALS
  // --------------------------------------------------------------------------
  const pendingDraftQuotations = summaryResult?.quotations?.draft ?? 0;
  if (pendingDraftQuotations > 0) {
    rawItems.push({
      id: 'quotation:pending-drafts',
      category: 'QUOTATION_APPROVAL',
      priority: isAdmin ? 'CRITICAL' : 'HIGH',
      title: `${pendingDraftQuotations} Draft Quotation${pendingDraftQuotations === 1 ? '' : 's'} Pending Approval`,
      description: isAdmin
        ? 'Review & formally approve quotation drafts so counselors can export PDFs for clients.'
        : 'Draft quotations are waiting for Owner Admin approval before client PDF sharing.',
      metaLabel: isAdmin ? 'Needs Approval' : 'Awaiting Admin',
      sourceTag: 'Quotation',
      href: '/dashboard/leads?stage=QUOTED',
      createdAt: new Date(nowMs).toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // 4. NEW / UNASSIGNED LEADS NEEDING FIRST CONTACT (Non-web leads)
  // --------------------------------------------------------------------------
  const newLeads = (newLeadsResult?.data ?? []).filter(
    (lead) => !webInquiryLeadIds.has(lead.id),
  );
  let newLeadsNeedingActionCount = 0;

  for (const lead of newLeads) {
    const isUnassigned = !lead.assignedToId;
    const isFreshWithin48h =
      Date.parse(lead.createdAt) >= nowMs - 48 * 60 * 60 * 1000;

    if (!isUnassigned && !isFreshWithin48h) {
      continue;
    }

    newLeadsNeedingActionCount += 1;
    const sectorLabel = SECTOR_LABELS[lead.category || 'TOUR'] || 'Lead';

    rawItems.push({
      id: `lead-new:${lead.id}`,
      category: 'LEAD_ACTION',
      priority: isUnassigned ? 'HIGH' : 'NORMAL',
      title: isUnassigned
        ? `Unassigned New Lead: ${lead.customerName}`
        : `New Lead Awaiting Qualification: ${lead.customerName}`,
      description: `${sectorLabel}${lead.destination ? ` · ${lead.destination}` : ''} · Source: ${lead.source}`,
      metaLabel: isUnassigned ? 'Unassigned' : lead.trackingCode ? `#${lead.trackingCode}` : 'NEW',
      sourceTag: 'Lead CRM',
      href: `/dashboard/leads/${lead.id}`,
      leadId: lead.id,
      createdAt: lead.createdAt,
    });
  }

  // --------------------------------------------------------------------------
  // 5. CATALOG & VISA SERVICE STATUS ALERTS (Expiring Packages / Paused Visas)
  // --------------------------------------------------------------------------
  const activePackages = packagesResult?.data ?? [];
  let catalogAlertsCount = 0;

  for (const pkg of activePackages) {
    if (!pkg.validUntil) continue;
    const validUntilMs = Date.parse(pkg.validUntil);
    if (Number.isNaN(validUntilMs)) continue;

    if (validUntilMs <= sevenDaysAheadMs) {
      catalogAlertsCount += 1;
      const isExpired = validUntilMs < nowMs;
      rawItems.push({
        id: `pkg-validity:${pkg.id}`,
        category: 'CATALOG_ALERT',
        priority: isExpired ? 'HIGH' : 'NORMAL',
        title: isExpired
          ? `Expired Package Still Published: ${pkg.title}`
          : `Package Expiring Soon: ${pkg.title}`,
        description: `${pkg.destination} validity ended/ends on ${new Date(pkg.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
        metaLabel: isExpired ? 'Expired' : 'Expiring ≤ 7d',
        sourceTag: 'Package',
        href: isAdmin ? `/dashboard/packages/${pkg.id}/edit` : '/dashboard/packages',
        createdAt: pkg.validUntil,
      });
    }
  }

  const pausedVisaServices = visaOverviewResult?.pausedServicesCount ?? 0;
  if (pausedVisaServices > 0) {
    catalogAlertsCount += 1;
    rawItems.push({
      id: 'visa-services:paused',
      category: 'CATALOG_ALERT',
      priority: 'NORMAL',
      title: `${pausedVisaServices} Visa Service${pausedVisaServices === 1 ? '' : 's'} Temporarily Paused`,
      description:
        'Public inquiry intake is currently paused for one or more published visa services.',
      metaLabel: `${pausedVisaServices} Paused`,
      sourceTag: 'Visa Hub',
      href: '/dashboard/visa-immigration/services?serviceStatus=TEMPORARILY_PAUSED',
      createdAt: new Date(nowMs).toISOString(),
    });
  }

  // --------------------------------------------------------------------------
  // 6. OWNER_ADMIN SECURITY & GOVERNANCE AUDIT ALERTS
  // --------------------------------------------------------------------------
  let securityAlertsCount = 0;
  const auditLogs = auditLogsResult?.data ?? [];
  if (isAdmin && auditLogs.length > 0) {
    for (const log of auditLogs) {
      if (!IMPORTANT_AUDIT_ACTIONS.has(log.action)) continue;
      const createdMs = Date.parse(log.createdAt);
      if (Number.isNaN(createdMs) || createdMs < sevenDaysAgoMs) continue;

      securityAlertsCount += 1;
      const formatted = formatAuditNotification(log);
      rawItems.push({
        id: `audit:${log.id}`,
        category: 'SECURITY_AUDIT',
        priority: 'NORMAL',
        title: formatted.title,
        description: formatted.description,
        metaLabel: 'Audit Event',
        sourceTag: 'Security',
        href: formatted.href,
        createdAt: log.createdAt,
      });
      if (securityAlertsCount >= 6) break;
    }
  }

  // --------------------------------------------------------------------------
  // MERGE READ STATUS & COMPUTE EXACT COUNTS
  // --------------------------------------------------------------------------
  const items: DashboardNotificationItem[] = rawItems.map(({ forceRead, ...item }) => {
    const read = Boolean(forceRead) || isNotificationMarkedRead(readState, item);
    return {
      ...item,
      read,
    };
  });

  items.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rankDiff !== 0) return rankDiff;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });

  const webInquiryItems = items.filter((i) => i.category === 'WEB_INQUIRY');
  const unreadWebItems = webInquiryItems.filter((i) => !i.read);
  const unreadItems = items.filter((i) => !i.read);
  const totalWebInquiries = Math.max(
    visaInquiriesResult?.meta?.total ?? 0,
    webInquiryItems.length,
  );

  return {
    items: items.slice(0, 80),
    counts: {
      totalUnread: unreadItems.length,
      unreadWebInquiries: unreadWebItems.length,
      totalWebInquiries,
      overdueFollowUps: totalOverdueFollowUps,
      dueTodayFollowUps: dueTodayCount,
      openFollowUps: totalOpenFollowUps,
      pendingDraftQuotations,
      newLeadsNeedingAction: newLeadsNeedingActionCount,
      catalogAlerts: catalogAlertsCount,
      securityAlerts: securityAlertsCount,
      urgentUnread: unreadItems.filter(
        (i) => i.priority === 'CRITICAL' || i.priority === 'HIGH',
      ).length,
    },
    unreadWebInquiryIds: unreadWebItems
      .map((i) => (i.id.startsWith('web-visa:') ? i.id.slice('web-visa:'.length) : i.id)),
    generatedAt: new Date(nowMs).toISOString(),
  };
}
