import { DashboardTableSkeleton } from '@/components/shared/AppSkeletons';

export default function LeadsLoading() {
  return <DashboardTableSkeleton rows={8} cols={6} hasFilters />;
}
