import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Globe, Landmark, Layers, Palmtree } from 'lucide-react';
import { getPackages } from '@/services/packages/packages.service';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  isPackageCategory,
  PACKAGE_CATEGORIES,
  SECTOR_CATALOG,
} from '@/config/brand.config';
import { ServiceCategory } from '@/types/api';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import { Button } from '@/components/ui/button';

export const instant = false;

interface PublicPackagesPageProps {
  searchParams?: Promise<{
    category?: ServiceCategory;
    search?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PublicPackagesPageProps): Promise<Metadata> {
  const resolved = (await searchParams) ?? {};
  const category = resolved.category;

  if (category === 'HAJJ_UMRAH') {
    return buildPageMetadata({
      title: 'Hajj & Umrah Packages',
      description:
        'Explore VIP & economy Hajj and Umrah packages with hotel distance details, guided Ziyarat, airfare, and transparent pricing.',
      path: '/packages?category=HAJJ_UMRAH',
      ogImage: '/images/packages-hero-bg.jpg',
      keywords: [
        'Hajj Packages Bangladesh',
        'Umrah Packages Feni',
        'VIP Umrah Package',
        'Daily Fly Hajj & Umrah',
      ],
    });
  }

  if (category === 'TOUR') {
    return buildPageMetadata({
      title: 'Holiday & Group Tour Packages',
      description:
        'Curated domestic and international holiday tour packages from Bangladesh with transparent hotel, transfer, and flight inclusions.',
      path: '/packages?category=TOUR',
      ogImage: '/images/packages-hero-bg.jpg',
      keywords: [
        'Holiday Tour Packages Bangladesh',
        'Coxs Bazar Tour Package',
        'Dubai Tour Package Bangladesh',
        'Daily Fly Holiday Tours',
      ],
    });
  }

  return buildPageMetadata({
    title: 'Tour & Hajj Packages',
    description:
      'Browse curated domestic & international holiday tours, transparent inclusions, and VIP & economy Hajj & Umrah packages from Daily Fly Travel & Tours.',
    path: '/packages',
    ogImage: '/images/packages-hero-bg.jpg',
  });
}

const PACKAGE_ICONS: Partial<Record<ServiceCategory, LucideIcon>> = {
  TOUR: Palmtree,
  HAJJ_UMRAH: Landmark,
};

export default async function PublicPackagesPage({
  searchParams,
}: PublicPackagesPageProps) {
  const resolved = (await searchParams) ?? {};
  const activeCategory = resolved.category;

  if (activeCategory === 'WORK_PERMIT' || activeCategory === 'STUDENT_VISA') {
    redirect(`/visa-services?category=${activeCategory}`);
  }

  const packagesRes = await getPackages({
    limit: 50,
    isArchived: false,
    category: activeCategory,
    search: resolved.search,
  });

  const filteredPackages = (packagesRes.data || []).filter((pkg) =>
    isPackageCategory(pkg.category),
  );

  const packageSectors = PACKAGE_CATEGORIES.map((key) => SECTOR_CATALOG[key]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Tour & Hajj Packages', path: '/packages' },
        ])}
      />
      {/* Compact Photographic Packages Banner */}
      <section className="relative overflow-hidden border-b border-[#062416] bg-[#062416] pt-8 pb-12 text-white sm:pt-10 sm:pb-14">
        <Image
          src="/images/packages-hero-bg.jpg"
          alt="Scenic coastal destination and golden hour travel view"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Directional Emerald Scrims for Sharp Readability while Preserving Right-Side Destination View */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#062416]/95 via-[#0A3A23]/80 to-[#062416]/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062416]/80 via-transparent to-[#062416]/45" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F7D29E]/35 bg-[#062416]/65 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F7D29E] backdrop-blur-md">
              <Palmtree className="h-3 w-3 text-[#D9822B]" />
              <span>Verified Packages &amp; Pilgrimage</span>
            </div>

            <h1 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xs sm:text-4xl">
              Tour &amp;{' '}
              <span className="text-[#F7D29E]">Hajj Packages</span>
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-slate-200 sm:text-base">
              Curated domestic &amp; international holidays, transparent inclusions, plus VIP &amp; economy Hajj &amp; Umrah packages.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-5 max-w-7xl space-y-8 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Search & Filter Card */}
        <div className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <SearchFilter
                paramName="search"
                placeholder="Search Cox's Bazar, Dubai, Makkah..."
              />
            </div>
            <div className="flex items-center gap-2">
              <ClearFiltersButton />
              <span className="text-xs font-medium text-gray-500">
                Showing <strong className="text-[#0A3A23]">{filteredPackages.length}</strong> active package
                {filteredPackages.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <Link
              href="/packages"
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                !activeCategory
                  ? 'bg-[#0A3A23] text-white shadow-xs'
                  : 'border border-gray-200 bg-[#F9FAFB] text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              All Tour &amp; Hajj
            </Link>
            {packageSectors.map((sector) => {
              const isSelected = activeCategory === sector.key;
              const Icon = PACKAGE_ICONS[sector.key] || Palmtree;
              return (
                <Link
                  key={sector.key}
                  href={`/packages?category=${sector.key}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#D9822B] text-white shadow-xs'
                      : 'border border-gray-200 bg-[#F9FAFB] text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {sector.key === 'TOUR' ? 'Holiday Tours' : sector.label}
                </Link>
              );
            })}
            <Link
              href="/visa-services"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#0A3A23]/20 bg-[#edf7f1] px-4 py-2 text-xs font-bold text-[#0A3A23] transition hover:bg-[#0A3A23] hover:text-white"
            >
              <Globe className="h-3.5 w-3.5" />
              Looking for Visa or Work Permits? →
            </Link>
          </div>
        </div>

        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PackagePreviewCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-dashed border-[#0A3A23]/25 bg-white p-12 text-center">
            <p className="text-lg font-bold text-[#0A3A23]">
              No active packages matched your selection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/packages">
                <Button variant="outline" size="sm">
                  Reset Filters
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="gold" size="sm">
                  Request Custom Quote →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
