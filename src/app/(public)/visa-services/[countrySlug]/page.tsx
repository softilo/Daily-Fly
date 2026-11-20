import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCountryBySlugAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  CountryCoverageBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import { VisaService } from '@/types/api';

export const instant = false;

export default async function CountryVisaDetailPage({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}) {
  const { countrySlug } = await params;
  const country = await getPublicCountryBySlugAction(countrySlug);

  if (!country) {
    notFound();
  }

  const services = country.visaServices || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/visa-services" className="hover:text-[#0A3A23]">
            Visa &amp; Immigration
          </Link>
          <span>/</span>
          <span className="text-[#0A3A23]">{country.name}</span>
        </div>

        {/* Country Header */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#0A3A23]/15 bg-[#edf7f1] text-base font-extrabold uppercase text-[#0A3A23]">
                {country.isoCode || country.name.slice(0, 2)}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#0A3A23]">
                    {country.name}
                  </h1>
                  <span className="rounded-lg border border-gray-200 bg-[#F9FAFB] px-2 py-0.5 font-mono text-xs text-gray-600">
                    {country.isoCode}
                  </span>
                </div>
                {country.shortIntro && (
                  <p className="mt-2 text-base text-gray-600">{country.shortIntro}</p>
                )}
              </div>
            </div>
            <CountryCoverageBadge status={country.coverageStatus} />
          </div>

          {country.detailedDescription && (
            <div className="mt-6 whitespace-pre-line border-t border-gray-100 pt-6 text-sm leading-relaxed text-gray-700">
              {country.detailedDescription}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-[#F7D29E] bg-[#FEF3E2] p-4 text-xs text-[#BF6F1E]">
            <strong>Transparency &amp; Compliance Note:</strong> Our agency provides document verification, application preparation, and procedural guidance for {country.name}. Agency coverage status reflects our internal service capacity and does not represent embassy quota availability or guaranteed approval.
          </div>
        </div>

        {/* Offered Visa Services */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#0A3A23]">
            Available Visa &amp; Permit Assistance Services for {country.name} ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-600">
                No published visa service categories are currently listed for {country.name}.
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
                      <VisaCategoryBadge
                        category={service.category}
                        customLabel={service.customCategoryLabel}
                      />
                      <AgencyServiceStatusBadge status={service.serviceStatus} />
                    </div>

                    <h3 className="mt-3.5 text-xl font-extrabold text-[#0A3A23] transition-colors group-hover:text-[#D9822B]">
                      {service.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {service.shortDescription}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5 text-xs">
                      <div>
                        <span className="text-[11px] text-gray-500">Estimated Processing</span>
                        <p className="mt-0.5 font-bold text-gray-900">
                          {service.estimatedProcessingTime || 'Subject to Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500">Agency Consultancy Fee</span>
                        <p className="mt-0.5 font-extrabold text-[#0A3A23] tabular-nums">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Upon Consultation'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-[#F9FAFB]/80 px-6 py-4">
                    <span className="text-xs font-semibold text-gray-600">
                      {service.requirements?.length || 0} Required Documents
                    </span>
                    <Link
                      href={`/visa-services/${country.slug}/${service.slug}`}
                      className="rounded-xl bg-[#D9822B] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#BF6F1E]"
                    >
                      Full Checklist &amp; Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
