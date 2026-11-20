export type NotificationCategory =
  | 'WEB_INQUIRY'
  | 'FOLLOW_UP'
  | 'LEAD_ACTION'
  | 'QUOTATION_APPROVAL'
  | 'CATALOG_ALERT'
  | 'SECURITY_AUDIT';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL';

export interface DashboardNotificationItem {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  description: string;
  metaLabel?: string;
  sourceTag?: string;
  href: string;
  leadId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationSummaryCounts {
  totalUnread: number;
  unreadWebInquiries: number;
  totalWebInquiries: number;
  overdueFollowUps: number;
  dueTodayFollowUps: number;
  openFollowUps: number;
  pendingDraftQuotations: number;
  newLeadsNeedingAction: number;
  catalogAlerts: number;
  securityAlerts: number;
  urgentUnread: number;
}

export interface DashboardNotificationsPayload {
  items: DashboardNotificationItem[];
  counts: NotificationSummaryCounts;
  unreadWebInquiryIds: string[];
  generatedAt: string;
}
