import React, { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicVisaServiceDetailAction } from '@/services/visa/visa.service';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { JsonLd } from '@/components/shared/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildVisaServiceJsonLd,
} from '@/lib/seo';
import {
  AgencyServiceStatusBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import VisaInquiryForm from '@/components/module/visa/VisaInquiryForm';
import { VisaServiceRequirement } from '@/types/api';

export const instant = false;

const getCachedVisaService = cache(
  (countrySlug: string, serviceSlug: string) =>
    getPublicVisaServiceDetailAction(countrySlug, serviceSlug),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countrySlug: string; serviceSlug: string }>;
}): Promise<Metadata> {
  const { countrySlug, serviceSlug } = await params;
  const [service, brand] = await Promise.all([
    getCachedVisaService(countrySlug, serviceSlug),
    getLiveBrandInfo(),
  ]);

  if (!service || !service.country) {
    return buildPageMetadata({
      title: 'Visa Service Not Found',
      description: 'Requested visa service checklist could not be found.',
      path: `/visa-services/${countrySlug}/${serviceSlug}`,
      noIndex: true,
      siteName: brand.agencyName,
    });
  }

  return buildPageMetadata({
    title: `${service.title} — ${service.country.name}`,
    description:
      service.shortDescription ||
      `View document requirements, processing timeline, and apply for ${service.title} in ${service.country.name} via ${brand.agencyName}.`,
    path: `/visa-services/${service.country.slug}/${service.slug}`,
    ogImage: '/images/visa-hero-bg.jpg',
    siteName: brand.agencyName,
    keywords: [
      `${service.country.name} ${service.title}`,
      `${service.country.name} visa checklist`,
      `${service.country.name} visa requirements`,
      brand.agencyName,
    ],
  });
}

export default async function VisaServiceDetailPage({
  params,
}: {
  params: Promise<{ countrySlug: string; serviceSlug: string }>;
}) {
  const { countrySlug, serviceSlug } = await params;
  const [service, brand] = await Promise.all([
    getCachedVisaService(countrySlug, serviceSlug),
    getLiveBrandInfo(),
  ]);

  if (!service || !service.country) {
    notFound();
  }

  const country = service.country;
  const requirements = service.requirements || [];
  const steps = service.applicationProcessSteps || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <JsonLd data={buildVisaServiceJsonLd(service, brand)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Visa & Immigration', path: '/visa-services' },
          { name: country.name, path: `/visa-services/${country.slug}` },
          {
            name: service.title,
            path: `/visa-services/${country.slug}/${service.slug}`,
          },
        ])}
      />
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/visa-services" className="hover:text-[#0A3A23]">
            Visa &amp; Immigration
          </Link>
          <span>/</span>
          <Link href={`/visa-services/${country.slug}`} className="hover:text-[#0A3A23]">
            {country.name}
          </Link>
          <span>/</span>
          <span className="text-[#0A3A23]">{service.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 items-center rounded-lg border border-[#0A3A23]/15 bg-[#edf7f1] px-2 font-mono text-xs font-bold text-[#0A3A23]">
                    {country.isoCode || country.name.slice(0, 2)}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{country.name}</span>
                  <VisaCategoryBadge
                    category={service.category}
                    customLabel={service.customCategoryLabel}
                  />
                </div>
                <AgencyServiceStatusBadge status={service.serviceStatus} />
              </div>

              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0A3A23] sm:text-3xl">
                {service.title}
              </h1>
              <p className="mt-2 text-base text-gray-600">{service.shortDescription}</p>

              {/* Key Metrics */}
              <div className="mt-6 grid gap-4 rounded-xl border border-gray-100 bg-[#F9FAFB] p-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-gray-500">Indicative Processing Time</span>
                  <p className="mt-1 text-sm font-bold text-[#0A3A23]">
                    {service.estimatedProcessingTime || 'Varies by Embassy'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Agency Consultancy Fee</span>
                  <p className="mt-1 text-sm font-bold text-[#0A3A23] tabular-nums">
                    {service.agencyServiceFee
                      ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                      : 'Contact for Assessment'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Embassy / Government Fees</span>
                  <p className="mt-1 text-xs font-medium text-gray-700">
                    {service.governmentFeeInfo || 'Applicable official embassy fees paid separately'}
                  </p>
                </div>
              </div>

              {service.fullDescription && (
                <div className="mt-6">
                  <h2 className="text-base font-bold text-[#0A3A23]">
                    Service Scope &amp; Overview
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {service.fullDescription}
                  </p>
                </div>
              )}

              {service.eligibilityInfo && (
                <div className="mt-6 rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] p-4">
                  <h2 className="text-sm font-bold text-[#0A3A23]">
                    General Eligibility Guidance
                  </h2>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-[#062416]">
                    {service.eligibilityInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Required Documents Checklist */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="text-lg font-bold text-[#0A3A23]">
                Required Documents Checklist ({requirements.length})
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Prepare the following documents for initial review. Do not upload sensitive passport scans through public forms; our consultant will guide you during verification.
              </p>

              {requirements.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">
                  Document checklist is customized based on applicant profile during consultation.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {requirements.map((req: VisaServiceRequirement) => (
                    <li key={req.id} className="flex items-start justify-between gap-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{req.title}</p>
                        {req.description && (
                          <p className="mt-0.5 text-xs text-gray-600">{req.description}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          req.isMandatory
                            ? 'bg-[#0A3A23] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {req.isMandatory ? 'Mandatory' : 'Supporting'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Step-by-Step Application Assistance */}
            {steps.length > 0 && (
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
                <h2 className="text-lg font-bold text-[#0A3A23]">
                  How Our Application Assistance Works
                </h2>
                <ol className="mt-4 space-y-3">
                  {steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D9822B] text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Compliance Disclaimer */}
            <div className="space-y-2 rounded-2xl border border-[#F7D29E] bg-[#FEF3E2] p-5 text-xs text-[#BF6F1E]">
              <p className="font-bold">Mandatory Immigration &amp; Compliance Disclaimer</p>
              <p>
                {service.disclaimer ||
                  'Our agency provides visa application consultancy, document review, and appointment guidance only. Visa issuance, processing times, and work/study permit approvals are determined solely by the relevant embassy or immigration authority. No visa is ever guaranteed.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[#BF6F1E]">
                {service.lastVerifiedAt && (
                  <span>
                    Last Reviewed by Agency Staff:{' '}
                    {new Date(service.lastVerifiedAt).toLocaleDateString()}
                  </span>
                )}
                {service.informationSourceUrl && (
                  <a
                    href={service.informationSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Official Immigration Reference ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Consultation Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <VisaInquiryForm
                countryId={country.id}
                countryName={country.name}
                visaServiceId={service.id}
                serviceTitle={service.title}
                category={service.category}
                serviceStatus={service.serviceStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
