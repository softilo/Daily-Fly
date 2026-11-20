import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ClipboardList, Phone, X } from 'lucide-react';
import { getSinglePackage } from '@/services/packages/packages.service';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { JsonLd } from '@/components/shared/JsonLd';
import {
  buildBreadcrumbJsonLd,
  buildPackageJsonLd,
  buildPageMetadata,
} from '@/lib/seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { isPackageCategory, SECTOR_CATALOG } from '@/config/brand.config';

export const instant = false;

const getCachedPackage = cache((id: string) => getSinglePackage(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [pkg, brand] = await Promise.all([
    getCachedPackage(id),
    getLiveBrandInfo(),
  ]);

  if (!pkg) {
    return buildPageMetadata({
      title: 'Package Not Found',
      description: 'Requested travel package could not be found.',
      path: `/packages/${id}`,
      noIndex: true,
      siteName: brand.agencyName,
    });
  }

  const sectorMeta =
    SECTOR_CATALOG[pkg.category ?? 'TOUR'] ?? SECTOR_CATALOG.TOUR;
  const summary =
    pkg.description.replace(/\s+/g, ' ').trim().slice(0, 155) ||
    `${pkg.title} — ${pkg.durationDays} Days in ${pkg.destination} by ${brand.agencyName}.`;

  return buildPageMetadata({
    title: `${pkg.title} (${pkg.destination})`,
    description: summary,
    path: `/packages/${pkg.id}`,
    ogImage: '/images/packages-hero-bg.jpg',
    siteName: brand.agencyName,
    keywords: [
      pkg.title,
      pkg.destination,
      sectorMeta.label,
      brand.agencyName,
      `${pkg.destination} tour package`,
    ],
  });
}

export default async function PublicPackageDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pkg, brand] = await Promise.all([
    getCachedPackage(id),
    getLiveBrandInfo(),
  ]);

  if (!pkg) {
    notFound();
  }

  const category = pkg.category ?? 'TOUR';
  const sectorMeta = SECTOR_CATALOG[category] ?? SECTOR_CATALOG.TOUR;
  const specs = (pkg.structuredSpecs ?? {}) as Record<string, unknown>;
  const specEntries = Object.entries(specs).filter(
    ([, val]) => val !== undefined && val !== null && val !== '',
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <JsonLd data={buildPackageJsonLd(pkg, brand)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Packages', path: '/packages' },
          { name: pkg.title, path: `/packages/${pkg.id}` },
        ])}
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={
            isPackageCategory(category)
              ? `/packages?category=${category}`
              : `/visa-services?category=${category}`
          }
          className="text-sm font-bold text-[#0A3A23] hover:text-[#D9822B] hover:underline"
        >
          ← Back to {sectorMeta.label}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${sectorMeta.badgeColor}`}
                >
                  {sectorMeta.label}
                </span>
                <Badge variant="info">{pkg.destination}</Badge>
                <span className="text-sm font-medium text-gray-500">
                  {pkg.durationDays} Days
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0A3A23]">
                {pkg.title}
              </h1>
            </div>

            <Card className="p-6">
              <h2 className="mb-3 text-lg font-bold text-[#0A3A23]">
                Program &amp; Package Overview
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {pkg.description}
              </p>
            </Card>

            {specEntries.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-bold text-[#0A3A23]">
                  Verified {sectorMeta.shortLabel} Specifications
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-3"
                    >
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#0A3A23]">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {pkg.requiredDocuments && pkg.requiredDocuments.length > 0 && (
              <Card className="border-[#0A3A23]/20 bg-[#edf7f1] p-6">
                <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#0A3A23]">
                  <ClipboardList className="h-5 w-5 text-[#D9822B]" />
                  Required Documents Checklist
                </h2>
                <p className="mb-4 text-xs text-gray-600">
                  Please prepare the following documents for smooth file opening and visa/application processing:
                </p>
                <ul className="grid grid-cols-1 gap-2 text-sm text-gray-800 sm:grid-cols-2">
                  {pkg.requiredDocuments.map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-[#0A3A23]/15 bg-white p-2.5"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0A3A23]" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card className="p-5">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase text-[#0A3A23]">
                  <Check className="h-4 w-4 text-[#0A3A23]" />
                  What Is Included
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i}>• {inc}</li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold uppercase text-rose-700">
                  <X className="h-4 w-4 text-rose-600" />
                  What Is Excluded
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {pkg.exclusions.map((exc, i) => (
                    <li key={i}>• {exc}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <div>
            <Card className="sticky top-24 space-y-5 border-[#0A3A23]/20 p-6 shadow-md">
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  {category === 'STUDENT_VISA'
                    ? 'Processing & File Charge'
                    : 'Starting Package Price'}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#0A3A23] tabular-nums">
                  {formatCurrency(pkg.basePrice, pkg.currency)}
                </p>
              </div>

              <div className="space-y-2.5">
                <Link
                  href={`/contact?category=${category}&destination=${encodeURIComponent(pkg.destination)}`}
                  className="block"
                >
                  <Button variant="gold" className="w-full">
                    Check Eligibility &amp; Apply →
                  </Button>
                </Link>
                <a
                  href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#0A3A23]/25 bg-[#edf7f1] py-2.5 text-xs font-bold text-[#0A3A23] transition hover:bg-[#0A3A23] hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Desk: {brand.phone}
                </a>
              </div>

              <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <p>Hours: {brand.officeHours}</p>
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${brand.email}`}
                    className="font-semibold text-[#0A3A23] hover:text-[#D9822B] hover:underline"
                  >
                    {brand.email}
                  </a>
                </p>
                <p>Office: {brand.address}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
