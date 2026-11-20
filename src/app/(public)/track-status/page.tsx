'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Rocket,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SECTOR_CATALOG } from '@/config/brand.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { trackPublicFileStatus } from '@/services/leads/leads.service';
import {
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadStage,
  ServiceCategory,
} from '@/types/api';
import { formatDate } from '@/lib/utils';

function TrackStatusContent() {
  const brand = useBrand();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [isPending, startTransition] = useTransition();
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedFile, setTrackedFile] = useState<{
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    destination?: string;
    stage: LeadStage;
    eligibilityStatus?: string;
    milestoneChecklist: LeadMilestoneItem[];
    documentChecklist: LeadDocumentChecklistItem[];
    updatedAt: string;
  } | null>(null);

  const handleLookup = (lookupCode: string) => {
    if (!lookupCode.trim()) return;
    setError(null);

    startTransition(async () => {
      const res = await trackPublicFileStatus(lookupCode);
      if (!res.success || !res.data) {
        setTrackedFile(null);
        setError(
          res.message ||
            'No file found with that Tracking Code. Try demo code: WP-102938',
        );
        return;
      }
      setTrackedFile(res.data);
    });
  };

  useEffect(() => {
    if (initialCode) {
      void trackPublicFileStatus(initialCode.trim()).then((res) => {
        if (!res.success || !res.data) {
          setTrackedFile(null);
          setError(
            res.message ||
              'No file found with that Tracking Code. Try demo code: WP-102938',
          );
          return;
        }
        setTrackedFile(res.data);
      });
    }
  }, [initialCode]);

  const sectorMeta = trackedFile
    ? SECTOR_CATALOG[trackedFile.category] ?? SECTOR_CATALOG.TOUR
    : null;

  const milestones = trackedFile?.milestoneChecklist || [];
  const docs = trackedFile?.documentChecklist || [];
  const doneMilestones = milestones.filter((m) => m.status === 'DONE').length;
  const milestonePct =
    milestones.length > 0
      ? Math.round((doneMilestones / milestones.length) * 100)
      : 0;
  const verifiedDocs = docs.filter((d) => d.status === 'VERIFIED').length;
  const pendingDocs = docs.filter(
    (d) => d.status === 'PENDING' || d.status === 'REJECTED',
  );

  const handleCopyShareLink = () => {
    if (!trackedFile?.trackingCode || typeof window === 'undefined') return;
    const url = `${window.location.origin}/track-status?code=${trackedFile.trackingCode}`;
    void navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="relative overflow-hidden border-b border-[#062416] bg-gradient-to-br from-[#062416] via-[#0A3A23] to-[#125734] py-12 text-white">
        <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#D9822B]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[#D9822B]/40 bg-[#D9822B]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F7D29E]">
            24/7 Live File Tracker
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            Track Your Visa, Work Permit or Package Status
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Enter your personal Tracking Code to check passport verification, medicals, permit approvals, and flight readiness.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="mb-8 border-gray-200/80 p-5 shadow-md sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(code);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Tracking Code (e.g. SV-820383 or WP-102938)"
              className="flex-1 font-mono uppercase"
            />
            <Button type="submit" variant="gold" disabled={isPending}>
              {isPending ? 'Checking...' : 'Track Status →'}
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-2">
              <span>Try Demo Files:</span>
              <button
                type="button"
                onClick={() => {
                  setCode('SV-820383');
                  handleLookup('SV-820383');
                }}
                className="rounded-lg border border-[#0A3A23]/20 bg-[#edf7f1] px-2.5 py-1 font-mono font-semibold text-[#0A3A23] transition hover:bg-[#0A3A23] hover:text-white"
              >
                SV-820383 (Student)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCode('WP-102938');
                  handleLookup('WP-102938');
                }}
                className="rounded-lg border border-[#F7D29E] bg-[#FEF3E2] px-2.5 py-1 font-mono font-semibold text-[#BF6F1E] transition hover:bg-[#D9822B] hover:text-white"
              >
                WP-102938 (Work Permit)
              </button>
            </div>

            <Link
              href="/contact"
              className="font-bold text-[#0A3A23] hover:text-[#D9822B] hover:underline"
            >
              Don’t have a Tracking Code? Apply Free →
            </Link>
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
        </Card>

        {trackedFile && sectorMeta && (
          <div className="space-y-6">
            {/* File Header & Progress */}
            <Card className="space-y-5 border-[#0A3A23]/20 bg-gradient-to-br from-[#F0F7F3] via-white to-[#F9FAFB] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${sectorMeta.badgeColor}`}
                    >
                      {sectorMeta.label}
                    </span>
                    <span className="rounded-lg border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs font-extrabold text-[#0A3A23]">
                      #{trackedFile.trackingCode}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0A3A23] sm:text-2xl">
                    Applicant: {trackedFile.customerName}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Destination:{' '}
                    <strong className="text-gray-800">
                      {trackedFile.destination || 'TBD'}
                    </strong>{' '}
                    • Last Updated: {formatDate(trackedFile.updatedAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase text-gray-400">
                      File Stage:
                    </span>
                    <StatusBadge status={trackedFile.stage} />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#0A3A23]" />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                        Copy Shareable Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-gray-200/80 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#0A3A23]">
                    Overall Application Progress: {milestonePct}% Complete
                  </span>
                  <span className="tabular-nums text-gray-500">
                    {doneMilestones}/{milestones.length} Milestones Done • {verifiedDocs}/
                    {docs.length} Docs Verified
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0A3A23] to-[#D9822B] transition-all"
                    style={{
                      width: `${Math.max(doneMilestones > 0 ? 8 : 3, milestonePct)}%`,
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Pending Documents Alert */}
            {pendingDocs.length > 0 ? (
              <div className="space-y-2 rounded-2xl border border-[#F7D29E] bg-[#FEF3E2] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#BF6F1E]">
                    <AlertCircle className="h-4 w-4 text-[#D9822B]" />
                    Pending Documents ({pendingDocs.length})
                  </h3>
                  <a
                    href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                    className="text-xs font-bold text-[#0A3A23] underline"
                  >
                    Call {brand.phone}
                  </a>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pendingDocs.map((d, i) => (
                    <span
                      key={d.key || i}
                      className="rounded-lg border border-[#F7D29E] bg-white px-2.5 py-1 text-xs font-semibold text-[#BF6F1E]"
                    >
                      • {d.title || `Document ${i + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              docs.length > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-[#0A3A23]/20 bg-[#edf7f1] p-4 text-xs font-semibold text-[#0A3A23]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0A3A23]" />
                  Great news! All required documents for your file have been received or verified by our team.
                </div>
              )
            )}

            {/* Milestones */}
            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#0A3A23]">
                  <Rocket className="h-4 w-4 text-[#D9822B]" />
                  Processing Milestones
                </h3>
                <span className="rounded-full border border-[#0A3A23]/20 bg-[#edf7f1] px-2.5 py-0.5 text-xs font-bold text-[#0A3A23]">
                  {doneMilestones} of {milestones.length} Completed
                </span>
              </div>
              <div className="space-y-3">
                {milestones.map((m, idx) => {
                  const isDone = m.status === 'DONE';
                  const isInProgress = m.status === 'IN_PROGRESS';
                  return (
                    <div
                      key={m.key || idx}
                      className={`flex items-center justify-between rounded-xl border p-3.5 ${
                        isDone
                          ? 'border-[#0A3A23]/20 bg-[#edf7f1]/70'
                          : isInProgress
                            ? 'border-[#F7D29E] bg-[#FEF3E2]/50'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-[#0A3A23] text-white'
                              : isInProgress
                                ? 'bg-[#D9822B] text-white'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {m.title || `Step ${idx + 1}`}
                          </p>
                          {m.completedAt && (
                            <p className="text-[11px] text-gray-500">
                              Completed: {formatDate(m.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          isDone
                            ? 'border-[#0A3A23]/20 bg-[#edf7f1] text-[#0A3A23]'
                            : isInProgress
                              ? 'border-[#F7D29E] bg-[#FEF3E2] text-[#BF6F1E]'
                              : 'border-gray-200 bg-[#F9FAFB] text-gray-600'
                        }`}
                      >
                        {(m.status || 'PENDING').replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Document Checklist */}
            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#0A3A23]">
                  <ClipboardCheck className="h-4 w-4 text-[#D9822B]" />
                  Document Checklist
                </h3>
                <span className="text-xs text-gray-500">
                  {verifiedDocs} Verified • {pendingDocs.length} Pending
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {docs.map((doc, idx) => (
                  <div
                    key={doc.key || idx}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-xs"
                  >
                    <span className="pr-2 font-medium text-gray-800">
                      {idx + 1}. {doc.title || `Document ${idx + 1}`}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-semibold ${
                        doc.status === 'VERIFIED'
                          ? 'border-[#0A3A23]/20 bg-[#edf7f1] text-[#0A3A23]'
                          : doc.status === 'RECEIVED'
                            ? 'border-gray-300 bg-white text-gray-800'
                            : doc.status === 'REJECTED'
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-[#F7D29E] bg-[#FEF3E2] text-[#BF6F1E]'
                      }`}
                    >
                      {doc.status || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicTrackStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-gray-500">
          Loading file status tracker...
        </div>
      }
    >
      <TrackStatusContent />
    </Suspense>
  );
}
