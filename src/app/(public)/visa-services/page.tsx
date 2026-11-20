import React from 'react';
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
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#062416] bg-gradient-to-br from-[#0A3A23] via-[#0d482b] to-[#062416] py-12 text-white">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[#D9822B]/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#D9822B]/40 bg-[#D9822B]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F7D29E]">
              Visa &amp; Immigration Portal
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Destination Countries &amp; Visa Services
            </h1>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
              Verified work permit checklists, student visa requirements, and tourist visa consultancy.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Category Tabs + Search Bar */}
        <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
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
                Try clearing your search filters or contact our Feni office directly for custom destinations.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country: Country) => (
                <Link
                  key={country.id}
                  href={`/visa-services/${country.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-[#0A3A23] hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] text-xs font-extrabold uppercase text-[#0A3A23]">
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
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
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
                    <span>
                      {country.visaServices?.length || 0} Published Service
                      {(country.visaServices?.length || 0) === 1 ? '' : 's'}
                    </span>
                    <span className="text-[#D9822B] transition group-hover:translate-x-1">
                      Explore Country Services →
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
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service: VisaService) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition hover:border-[#0A3A23]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-md border border-[#0A3A23]/15 bg-[#edf7f1] px-1.5 font-mono text-[11px] font-bold text-[#0A3A23]">
                          {service.country?.isoCode || 'GLB'}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {service.country?.name}
                        </span>
                        <VisaCategoryBadge
                          category={service.category}
                          customLabel={service.customCategoryLabel}
                        />
                      </div>
                      <AgencyServiceStatusBadge status={service.serviceStatus} />
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-[#0A3A23]">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-600">{service.shortDescription}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3 text-xs">
                      <div>
                        <span className="text-gray-500">Indicative Processing:</span>
                        <p className="font-bold text-gray-800">
                          {service.estimatedProcessingTime || 'Varies by Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Consultancy Fee:</span>
                        <p className="font-bold text-[#0A3A23] tabular-nums">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Contact for Quote'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-500">
                      {service.requirements?.length || 0} Document Checklist Items
                    </span>
                    <Link
                      href={`/visa-services/${service.country?.slug}/${service.slug}`}
                      className="rounded-xl bg-[#D9822B] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#BF6F1E]"
                    >
                      View Requirements &amp; Inquire
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
