import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { getPackages } from '@/services/packages/packages.service';
import { requireStaffSession } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import { PackageTableRowActions } from '@/components/module/packages/PackageTableRowActions';
import { isPackageCategory, SECTOR_CATALOG } from '@/config/brand.config';
import { ServiceCategory, TourPackage } from '@/types/api';
import { formatCurrency } from '@/lib/utils';

export const instant = false;

type VisibilityFilter = 'all' | 'public' | 'unpublished';

function buildCatalogHref(params: {
  category?: string;
  status?: VisibilityFilter;
  search?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  const query = qs.toString();
  return query ? `/dashboard/packages?${query}` : '/dashboard/packages';
}

export default async function DashboardPackagesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    category?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const resolved = (await searchParams) ?? {};
  const activeCategory =
    resolved.category === 'TOUR' || resolved.category === 'HAJJ_UMRAH'
      ? (resolved.category as ServiceCategory)
      : undefined;
  const statusFilter: VisibilityFilter =
    resolved.status === 'public' || resolved.status === 'unpublished'
      ? resolved.status
      : 'all';
  const searchQuery = resolved.search?.trim() || '';

  const [publicRes, unpublishedRes, user] = await Promise.all([
    getPackages({
      limit: 100,
      category: activeCategory,
      search: searchQuery || undefined,
    }),
    getPackages({
      limit: 100,
      isArchived: true,
      category: activeCategory,
      search: searchQuery || undefined,
    }),
    requireStaffSession(),
  ]);

  const isAdmin = user?.role === 'OWNER_ADMIN';

  // Deduplicate cleanly by ID in case backend ignores isArchived param when false/true
  const combinedMap = new Map<string, TourPackage>();
  for (const pkg of [...(publicRes?.data || []), ...(unpublishedRes?.data || [])]) {
    if (isPackageCategory(pkg.category)) {
      combinedMap.set(pkg.id, pkg);
    }
  }

  const allCategoryPackages = Array.from(combinedMap.values()).sort(
    (a, b) =>
      Number(a.isArchived) - Number(b.isArchived) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const publicCount = allCategoryPackages.filter((p) => !p.isArchived).length;
  const unpublishedCount = allCategoryPackages.filter((p) => p.isArchived).length;

  const visiblePackages = allCategoryPackages.filter((pkg) => {
    if (statusFilter === 'public') return !pkg.isArchived;
    if (statusFilter === 'unpublished') return pkg.isArchived;
    return true;
  });

  const CATEGORY_TABS: Array<{ label: string; value?: ServiceCategory }> = [
    { label: 'All Tour & Hajj', value: undefined },
    { label: 'Holiday Tours', value: 'TOUR' },
    { label: 'Hajj & Umrah', value: 'HAJJ_UMRAH' },
  ];

  const VISIBILITY_TABS: Array<{
    label: string;
    value: VisibilityFilter;
    count: number;
  }> = [
    { label: 'All', value: 'all', count: allCategoryPackages.length },
    { label: 'Public', value: 'public', count: publicCount },
    { label: 'Unpublished', value: 'unpublished', count: unpublishedCount },
  ];

  return (
    <div className="space-y-5">
      <ManagementPageHeader
        title="Tour & Hajj Package Catalog"
        actionLabel={isAdmin ? '+ Create New Package' : undefined}
        actionHref={isAdmin ? '/dashboard/packages/create' : undefined}
      >
        <Link href="/dashboard/visa-immigration/services">
          <Button variant="outline" size="sm">
            Visa &amp; Permit Services →
          </Button>
        </Link>
        <Link href="/packages" target="_blank">
          <Button variant="outline" size="sm">
            View Public Catalog ↗
          </Button>
        </Link>
      </ManagementPageHeader>

      {/* Filter & Visibility Toolbar */}
      <Card className="border-gray-200/90 p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.value;
                return (
                  <Link
                    key={tab.label}
                    href={buildCatalogHref({
                      category: tab.value,
                      status: statusFilter,
                      search: searchQuery,
                    })}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#0A3A23] text-white shadow-xs'
                        : 'border border-gray-200 bg-[#F9FAFB] text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Public / Unpublished Status Switcher */}
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-[#F9FAFB] p-1">
              {VISIBILITY_TABS.map((tab) => {
                const isActive = statusFilter === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={buildCatalogHref({
                      category: activeCategory,
                      status: tab.value,
                      search: searchQuery,
                    })}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                      isActive
                        ? tab.value === 'unpublished'
                          ? 'bg-[#D9822B] text-white shadow-xs'
                          : 'bg-[#0A3A23] text-white shadow-xs'
                        : 'text-gray-600 hover:text-[#0A3A23]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
            <SearchFilter
              paramName="search"
              placeholder="Search package title or destination..."
            />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <ClearFiltersButton />
              <span className="whitespace-nowrap text-xs text-gray-500">
                Showing{' '}
                <strong className="font-bold text-[#0A3A23]">
                  {visiblePackages.length}
                </strong>{' '}
                package{visiblePackages.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Clean Data Table */}
      <Card className="overflow-hidden border-gray-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-[#F9FAFB] text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="py-3.5 pr-3 pl-5">Package &amp; Sector</th>
                <th className="px-3 py-3.5">Destination</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Duration</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Base Price</th>
                <th className="px-3 py-3.5">Key Inclusions</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Status</th>
                <th className="py-3.5 pr-5 pl-3 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {visiblePackages.map((pkg) => {
                const cat = pkg.category ?? 'TOUR';
                const sectorMeta = SECTOR_CATALOG[cat] ?? SECTOR_CATALOG.TOUR;
                const inclusions = pkg.inclusions || [];
                const previewInclusions = inclusions.slice(0, 2).join(', ');
                const remainingCount = Math.max(0, inclusions.length - 2);

                return (
                  <tr
                    key={pkg.id}
                    className={`transition-colors hover:bg-[#F9FAFB] ${
                      pkg.isArchived ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="max-w-[260px] py-4 pr-3 pl-5 align-middle">
                      <p className="line-clamp-2 font-bold leading-snug text-[#0A3A23]">
                        {pkg.title}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sectorMeta.badgeColor}`}
                      >
                        {sectorMeta.shortLabel}
                      </span>
                    </td>

                    <td className="max-w-[180px] px-3 py-4 align-middle">
                      <div className="flex items-start gap-1.5 text-xs font-semibold text-gray-700">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D9822B]" />
                        <span className="line-clamp-2">{pkg.destination}</span>
                      </div>
                    </td>

                    <td className="px-3 py-4 align-middle whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-[#F9FAFB] px-2.5 py-1 text-xs font-semibold text-gray-700">
                        <Clock className="h-3 w-3 text-[#D9822B]" />
                        {pkg.durationDays} Days
                      </span>
                    </td>

                    <td className="px-3 py-4 align-middle whitespace-nowrap">
                      <span className="text-sm font-extrabold text-[#0A3A23] tabular-nums">
                        {formatCurrency(pkg.basePrice, pkg.currency)}
                      </span>
                    </td>

                    <td className="max-w-[240px] px-3 py-4 align-middle">
                      {inclusions.length > 0 ? (
                        <div className="space-y-1">
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                            {previewInclusions}
                          </p>
                          {remainingCount > 0 && (
                            <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                              +{remainingCount} more inclusion
                              {remainingCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No inclusions listed
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-4 align-middle whitespace-nowrap">
                      {!pkg.isArchived ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0A3A23]/20 bg-[#edf7f1] px-2.5 py-1 text-[11px] font-bold text-[#0A3A23]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F7D29E] bg-[#FEF3E2] px-2.5 py-1 text-[11px] font-bold text-[#BF6F1E]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D9822B]" />
                          Unpublished
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-5 pl-3 text-right align-middle whitespace-nowrap">
                      <PackageTableRowActions
                        id={pkg.id}
                        isArchived={pkg.isArchived}
                        isAdmin={isAdmin}
                      />
                    </td>
                  </tr>
                );
              })}

              {visiblePackages.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-bold text-[#0A3A23]">
                      No matching packages found.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Try switching visibility filters or create a new package.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
