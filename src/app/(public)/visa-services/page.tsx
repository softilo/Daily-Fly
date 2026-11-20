import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Globe,
  GraduationCap,
  Plane,
  Wrench,
} from 'lucide-react';
import {
  getPublicCountriesAction,
  getPublicVisaServicesAction,
} from '@/services/visa/visa.service';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  AgencyServiceStatusBadge,
  CountryCoverageBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import {
  AgencyServiceStatus,
  Country,
  VisaCategory,
  VisaService,
} from '@/types/api';

export const instant = false;

const VISA_CATEGORY_LABELS: Record<string, string> = {
  STUDENT_VISA: 'Student Visa',
  WORK_PERMIT: 'Work Permit',
  WORK_VISA: 'Work Visa',
  TOURIST_VISA: 'Tourist Visa',
  BUSINESS_VISA: 'Business Visa',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = params.category || '';
  const categoryLabel = VISA_CATEGORY_LABELS[category];

  if (categoryLabel) {
    return buildPageMetadata({
      title: `${categoryLabel} Requirements & Assistance`,
      description: `Check verified ${categoryLabel.toLowerCase()} checklists, destination countries, embassy timelines, and consultancy support from Daily Fly Travel & Tours.`,
      path: `/visa-services?category=${category}`,
      ogImage: '/images/visa-hero-bg.jpg',
      keywords: [
        `${categoryLabel} Bangladesh`,
        `${categoryLabel} Checklist`,
        'Visa Assistance Bangladesh',
        'Daily Fly Travel & Tours',
      ],
    });
  }

  return buildPageMetadata({
    title: 'Destination Countries & Visa Services',
    description:
      'Verified work permit checklists, student visa requirements, tourist visa guidance, and destination country coverage from Daily Fly Travel & Tours.',
    path: '/visa-services',
    ogImage: '/images/visa-hero-bg.jpg',
  });
}

const VISA_CATEGORY_TABS: Array<{ label: string; value: string; Icon: LucideIcon }> = [
  { label: 'All Categories', value: '', Icon: Globe },
  { label: 'Student Visa', value: 'STUDENT_VISA', Icon: GraduationCap },
  { label: 'Work Permit', value: 'WORK_PERMIT', Icon: Briefcase },
  { label: 'Work Visa', value: 'WORK_VISA', Icon: Wrench },
  { label: 'Tourist Visa', value: 'TOURIST_VISA', Icon: Plane },
  { label: 'Business Visa', value: 'BUSINESS_VISA', Icon: Building2 },
];

export default async function PublicVisaServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const serviceStatus = params.serviceStatus || '';

  const [countriesRes, servicesRes] = await Promise.all([
    getPublicCountriesAction({ limit: 50, search }),
    getPublicVisaServicesAction({
      limit: 50,
      search,
      category: (category as VisaCategory) || undefined,
      serviceStatus: (serviceStatus as AgencyServiceStatus) || undefined,
    }),
  ]);

  const countries = countriesRes?.data || [];
  const services = servicesRes?.data || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Visa & Immigration Services', path: '/visa-services' },
        ])}
      />
      {/* Compact Photographic Visa & Immigration Banner */}
      <section className="relative overflow-hidden border-b border-[#062416] bg-[#062416] pt-8 pb-12 text-white sm:pt-10 sm:pb-14">
        <Image
          src="/images/visa-hero-bg.jpg"
          alt="International airport departure lounge and aircraft at twilight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Directional Emerald Scrims for Sharp Readability while Preserving Right-Side Aircraft Scene */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#062416]/95 via-[#0A3A23]/80 to-[#062416]/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062416]/80 via-transparent to-[#062416]/45" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F7D29E]/35 bg-[#062416]/65 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F7D29E] backdrop-blur-md">
              <Globe className="h-3 w-3 text-[#D9822B]" />
              <span>Visa &amp; Immigration Portal</span>
            </div>

            <h1 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xs sm:text-4xl">
              Destination Countries &amp;{' '}
              <span className="text-[#F7D29E]">Visa Services</span>
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-slate-200 sm:text-base">
              Verified work permit checklists, student visa requirements, and tourist visa consultancy.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-5 max-w-7xl space-y-12 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Elevated Category Tabs + Search Bar */}
        <div className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-lg">
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
            {VISA_CATEGORY_TABS.map((tab) => {
              const isSelected = category === tab.value;
              const qs = new URLSearchParams();
              if (tab.value) qs.set('category', tab.value);
              if (search) qs.set('search', search);
              if (serviceStatus) qs.set('serviceStatus', serviceStatus);
              const href = qs.toString()
                ? `/visa-services?${qs.toString()}`
                : '/visa-services';
              const TabIcon = tab.Icon;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#0A3A23] text-white shadow-xs'
                      : 'border border-gray-200 bg-[#F9FAFB] text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <SearchFilter placeholder="Search destination country or visa service (e.g. UK, Malaysia, Romania)..." />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SelectFilter
                paramName="serviceStatus"
                placeholder="All Availability"
                options={[
                  { label: 'Accepting Inquiries', value: 'ACCEPTING_INQUIRIES' },
                  { label: 'Limited Intake', value: 'LIMITED' },
                  { label: 'Temporarily Paused', value: 'TEMPORARILY_PAUSED' },
                ]}
              />
              <ClearFiltersButton />
            </div>
          </div>
        </div>

        {/* Destination Countries Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0A3A23]">
              Destination Countries ({countries.length})
            </h2>
          </div>

          {countries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0A3A23]/25 bg-white p-12 text-center">
              <p className="text-base font-bold text-[#0A3A23]">
                No matching destination countries found.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try clearing your search filters or contact our office directly for custom destinations.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country: Country) => (
                <Link
                  key={country.id}
                  href={`/visa-services/${country.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3A23]/50 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#0A3A23] to-[#D9822B] opacity-0 transition-opacity group-hover:opacity-100" />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] text-xs font-extrabold uppercase text-[#0A3A23] transition-colors group-hover:bg-[#0A3A23] group-hover:text-white">
                          {country.isoCode || country.name.slice(0, 2)}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-[#0A3A23] group-hover:text-[#D9822B]">
                            {country.name}
                          </h3>
                          <span className="font-mono text-xs text-gray-400">
                            ISO: {country.isoCode}
                          </span>
                        </div>
                      </div>
                      <CountryCoverageBadge status={country.coverageStatus} />
                    </div>

                    {country.shortIntro && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {country.shortIntro}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {country.visaServices && country.visaServices.length > 0 ? (
                        country.visaServices.map((svc: VisaService) => (
                          <VisaCategoryBadge
                            key={svc.id}
                            category={svc.category}
                            customLabel={svc.customCategoryLabel}
                          />
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          No published visa services yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold text-[#0A3A23]">
                    <span className="font-semibold text-gray-500">
                      {country.visaServices?.length || 0} Published Service
                      {(country.visaServices?.length || 0) === 1 ? '' : 's'}
                    </span>
                    <span className="text-[#D9822B] transition group-hover:translate-x-1">
                      Explore Services →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Published Visa Services Directory */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0A3A23]">
              Published Visa Services ({services.length})
            </h2>
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0A3A23]/25 bg-white p-12 text-center">
              <p className="text-base font-medium text-gray-700">
                No visa services match the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service: VisaService) => (
                <div
                  key={service.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3A23]/50 hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-md border border-[#0A3A23]/15 bg-[#edf7f1] px-2 font-mono text-[11px] font-bold text-[#0A3A23]">
                          {service.country?.isoCode || 'GLB'}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {service.country?.name}
                        </span>
                        <VisaCategoryBadge
                          category={service.category}
                          customLabel={service.customCategoryLabel}
                        />
                      </div>
                      <AgencyServiceStatusBadge status={service.serviceStatus} />
                    </div>

                    <h3 className="mt-3.5 text-lg font-extrabold text-[#0A3A23] transition-colors group-hover:text-[#D9822B]">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {service.shortDescription}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5 text-xs">
                      <div>
                        <span className="text-[11px] text-gray-500">Indicative Processing</span>
                        <p className="mt-0.5 font-bold text-gray-900">
                          {service.estimatedProcessingTime || 'Varies by Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500">Consultancy Fee</span>
                        <p className="mt-0.5 font-extrabold text-[#0A3A23] tabular-nums">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Contact for Quote'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-[#F9FAFB]/80 px-6 py-4">
                    <span className="text-xs font-semibold text-gray-600">
                      {service.requirements?.length || 0} Checklist Items
                    </span>
                    <Link
                      href={`/visa-services/${service.country?.slug}/${service.slug}`}
                      className="rounded-xl bg-[#D9822B] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#BF6F1E]"
                    >
                      View Checklist &amp; Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
