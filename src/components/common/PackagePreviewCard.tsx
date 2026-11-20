import Link from 'next/link';
import { ArrowRight, Check, Clock, MapPin } from 'lucide-react';
import { TourPackage } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { SECTOR_CATALOG } from '@/config/brand.config';

export function PackagePreviewCard({ pkg }: { pkg: TourPackage }) {
  const category = pkg.category ?? 'TOUR';
  const sectorMeta = SECTOR_CATALOG[category] ?? SECTOR_CATALOG.TOUR;
  const specs = (pkg.structuredSpecs ?? {}) as Record<string, unknown>;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-gray-200/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3A23] hover:shadow-xl">
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-[#0A3A23] to-[#D9822B] opacity-0 transition-opacity group-hover:opacity-100" />

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${sectorMeta.badgeColor}`}
          >
            {sectorMeta.shortLabel}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-gray-200 bg-[#F9FAFB] px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              <Clock className="h-3 w-3 shrink-0 text-[#D9822B]" />
              {pkg.durationDays} Days
            </span>
            <Badge variant="info" className="max-w-full gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-[#D9822B]" />
              <span className="truncate">{pkg.destination}</span>
            </Badge>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#0A3A23]">
          {pkg.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {pkg.description}
        </p>

        {/* Sector-Specific Highlights */}
        {category === 'HAJJ_UMRAH' && Boolean(specs.makkahHotel) && (
          <div className="mt-3 space-y-1 rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] p-3 text-xs text-[#0A3A23]">
            <p>
              <strong>Makkah Hotel:</strong> {String(specs.makkahHotel)}
            </p>
            {Boolean(specs.packageSubType) && (
              <p>
                <strong>Type:</strong> {String(specs.packageSubType)} •{' '}
                {specs.qurbaniIncluded ? 'Qurbani Included' : 'Qurbani Optional'}
              </p>
            )}
          </div>
        )}

        {category === 'WORK_PERMIT' && Boolean(specs.monthlySalaryRange) && (
          <div className="mt-3 space-y-1 rounded-xl border border-[#F7D29E] bg-[#FEF3E2] p-3 text-xs text-[#BF6F1E]">
            <p>
              <strong>Salary:</strong> {String(specs.monthlySalaryRange)}
            </p>
            {Boolean(specs.jobRole) && (
              <p>
                <strong>Role:</strong> {String(specs.jobRole)} •{' '}
                {specs.processingTimeDays
                  ? `~${String(specs.processingTimeDays)} Days Processing`
                  : ''}
              </p>
            )}
          </div>
        )}

        {category === 'STUDENT_VISA' && Boolean(specs.minIeltsRequired) && (
          <div className="mt-3 space-y-1 rounded-xl border border-gray-200 bg-[#F9FAFB] p-3 text-xs text-gray-800">
            <p>
              <strong>Requirement:</strong> {String(specs.minIeltsRequired)}
            </p>
            {Boolean(specs.intakeMonths) && (
              <p>
                <strong>Intakes:</strong> {String(specs.intakeMonths)} • Max Gap:{' '}
                {String(specs.maxStudyGapYears ?? 4)} Yrs
              </p>
            )}
          </div>
        )}

        {pkg.inclusions?.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Key Inclusions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.inclusions.slice(0, 3).map((inc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-[#F9FAFB] px-2 py-0.5 text-xs text-gray-700"
                >
                  <Check className="h-3 w-3 shrink-0 text-[#0A3A23]" />
                  {inc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <span className="block text-xs text-gray-400">
            {category === 'STUDENT_VISA'
              ? 'Service / File Fee'
              : 'Starting Package Price'}
          </span>
          <span className="text-xl font-extrabold text-[#0A3A23] tabular-nums">
            {formatCurrency(pkg.basePrice, pkg.currency)}
          </span>
        </div>
        <Link href={`/packages/${pkg.id}`}>
          <Button variant="gold" size="sm">
            Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
