import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Landmark,
  MapPin,
  Palmtree,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { TourPackage } from '@/types/api';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { SECTOR_CATALOG } from '@/config/brand.config';

export function PackagePreviewCard({ pkg }: { pkg: TourPackage }) {
  const category = pkg.category ?? 'TOUR';
  const sectorMeta = SECTOR_CATALOG[category] ?? SECTOR_CATALOG.TOUR;
  const specs = (pkg.structuredSpecs ?? {}) as Record<string, unknown>;
  const docCount = pkg.requiredDocuments?.length ?? 0;

  const isHajj = category === 'HAJJ_UMRAH';
  const isWorkPermit = category === 'WORK_PERMIT';
  const isStudent = category === 'STUDENT_VISA';

  const CategoryIcon = isHajj
    ? Landmark
    : isWorkPermit
      ? Briefcase
      : isStudent
        ? GraduationCap
        : Palmtree;

  const headerTint = isHajj
    ? 'bg-gradient-to-r from-[#0A3A23] to-[#125734] text-white'
    : isWorkPermit
      ? 'bg-gradient-to-r from-[#FEF3E2] to-[#FFF9F0] text-[#0A3A23] border-b border-[#F7D29E]/60'
      : 'bg-gradient-to-r from-[#edf7f1] to-[#F7FBF9] text-[#0A3A23] border-b border-[#0A3A23]/10';

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-gray-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3A23]/50 hover:shadow-xl">
      {/* Structured Top Header Band (consistent 2-line height across all cards) */}
      <div>
        <div className={`px-5 py-4 ${headerTint}`}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight ${
                isHajj
                  ? 'bg-[#D9822B] text-white'
                  : 'border border-[#0A3A23]/15 bg-white text-[#0A3A23] shadow-2xs'
              }`}
            >
              <CategoryIcon className="h-3 w-3 shrink-0" />
              {sectorMeta.shortLabel}
            </span>

            <span
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isHajj
                  ? 'bg-white/15 text-[#F7D29E]'
                  : 'border border-gray-200/80 bg-white text-gray-700'
              }`}
            >
              <Clock className={`h-3 w-3 shrink-0 ${isHajj ? 'text-[#F7D29E]' : 'text-[#D9822B]'}`} />
              {pkg.durationDays} {pkg.durationDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 min-w-0">
            <MapPin
              className={`h-3.5 w-3.5 shrink-0 ${
                isHajj ? 'text-[#F7D29E]' : 'text-[#D9822B]'
              }`}
            />
            <span
              className={`truncate text-xs font-semibold ${
                isHajj ? 'text-slate-100' : 'text-[#0A3A23]/90'
              }`}
              title={pkg.destination}
            >
              {pkg.destination}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6">
          <Link href={`/packages/${pkg.id}`} className="block">
            <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-gray-900 transition-colors group-hover:text-[#0A3A23]">
              {pkg.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {pkg.description}
          </p>

          {/* Sector-Specific Highlights */}
          {isHajj && Boolean(specs.makkahHotel) && (
            <div className="mt-4 space-y-1 rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] p-3 text-xs text-[#0A3A23]">
              <p className="truncate">
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

          {isWorkPermit && Boolean(specs.monthlySalaryRange) && (
            <div className="mt-4 space-y-1 rounded-xl border border-[#F7D29E] bg-[#FEF3E2] p-3 text-xs text-[#BF6F1E]">
              <p>
                <strong>Salary:</strong> {String(specs.monthlySalaryRange)}
              </p>
              {Boolean(specs.jobRole) && (
                <p className="truncate">
                  <strong>Role:</strong> {String(specs.jobRole)}
                  {specs.processingTimeDays
                    ? ` • ~${String(specs.processingTimeDays)} Days Processing`
                    : ''}
                </p>
              )}
            </div>
          )}

          {isStudent && Boolean(specs.minIeltsRequired) && (
            <div className="mt-4 space-y-1 rounded-xl border border-gray-200 bg-[#F9FAFB] p-3 text-xs text-gray-800">
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

          {/* Clean Scannable Inclusions Checklist */}
          {pkg.inclusions?.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  What&apos;s Included
                </p>
                {pkg.inclusions.length > 3 && (
                  <span className="text-[11px] font-semibold text-[#0A3A23]">
                    +{pkg.inclusions.length - 3} more
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {pkg.inclusions.slice(0, 3).map((inc, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-gray-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0A3A23]" />
                    <span className="line-clamp-1">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {docCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#F9FAFB] px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              <ClipboardList className="h-3.5 w-3.5 text-[#D9822B]" />
              <span>{docCount} Document Checklist Items</span>
            </div>
          )}
        </div>
      </div>

      {/* User-Friendly Action Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-[#F9FAFB]/80 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <span className="block text-[11px] font-medium text-gray-500">
            {isStudent ? 'Service / File Fee' : 'Starting from'}
          </span>
          <span className="block truncate text-xl font-extrabold text-[#0A3A23] tabular-nums">
            {formatCurrency(pkg.basePrice, pkg.currency)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/contact?category=${category}&destination=${encodeURIComponent(pkg.destination)}`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-[#0A3A23]/25 bg-white px-3 text-xs font-bold text-[#0A3A23] transition hover:border-[#0A3A23] hover:bg-[#edf7f1]"
          >
            Inquire
          </Link>
          <Link
            href={`/packages/${pkg.id}`}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#D9822B] px-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#BF6F1E]"
          >
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
