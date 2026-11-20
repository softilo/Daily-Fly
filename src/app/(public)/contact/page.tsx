'use client';

import { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  Search,
} from 'lucide-react';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceCategory } from '@/types/api';
import { submitPublicInquiry } from '@/services/leads/leads.service';
import { ContactPageSkeleton } from '@/components/shared/AppSkeletons';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialCat =
    (searchParams.get('category') as ServiceCategory) || 'WORK_PERMIT';
  const initialDest = searchParams.get('destination') || '';

  const [category, setCategory] = useState<ServiceCategory>(initialCat);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [destination, setDestination] = useState(initialDest);
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');

  const [age, setAge] = useState('');
  const [passportValidityMonths, setPassportValidityMonths] = useState('18');
  const [jobRole, setJobRole] = useState('');
  const [gpa, setGpa] = useState('');
  const [ieltsScore, setIeltsScore] = useState('');
  const [studyGapYears, setStudyGapYears] = useState('0');

  const [isPending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    eligibility: {
      status: string;
      score: number;
      summary: string;
      reasons: string[];
    };
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please enter your full name and phone/WhatsApp number.');
      return;
    }

    const metadata: Record<string, unknown> = {
      passportValidityMonths: Number(passportValidityMonths) || 12,
    };

    if (category === 'WORK_PERMIT') {
      if (age) metadata.age = Number(age);
      if (jobRole) metadata.jobRole = jobRole;
    } else if (category === 'STUDENT_VISA') {
      if (gpa) metadata.gpa = Number(gpa);
      if (ieltsScore) metadata.ieltsScore = Number(ieltsScore);
      if (studyGapYears) metadata.studyGapYears = Number(studyGapYears);
    }

    startTransition(async () => {
      const res = await submitPublicInquiry({
        category,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        destination: destination.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        requirements: requirements.trim() || undefined,
        metadata,
      });

      if (!res.success || !res.data) {
        setError(res.message || 'Could not submit inquiry. Please try again.');
        return;
      }

      setResult(res.data);
    });
  };

  const brand = useBrand();
  const enabledSectors = brandConfig.enabledCategories.map(
    (k) => SECTOR_CATALOG[k],
  );
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="relative overflow-hidden border-b border-[#062416] bg-gradient-to-br from-[#062416] via-[#0A3A23] to-[#125734] py-12 text-white">
        <div className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#D9822B]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="inline-block rounded-full border border-[#D9822B]/40 bg-[#D9822B]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F7D29E]">
            Free • Instant Tracking ID
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            Eligibility Check &amp; Inquiry
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Get instant pre-assessment scoring and a personal Tracking Code for your file.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {result ? (
              <Card className="space-y-5 border-[#0A3A23]/25 bg-[#edf7f1] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0A3A23]/15 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#0A3A23]">
                      <CheckCircle2 className="h-4 w-4 text-[#D9822B]" />
                      Inquiry Recorded
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                      <h2 className="font-mono text-2xl font-extrabold text-[#0A3A23]">
                        #{result.trackingCode}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            void navigator.clipboard.writeText(result.trackingCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2500);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0A3A23]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#0A3A23] hover:bg-[#F0F7F3]"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#0A3A23]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#D9822B] px-4 py-1.5 text-xs font-bold text-white">
                    Match Score: {result.eligibility?.score ?? 70}% (
                    {String(result.eligibility?.status || 'CONDITIONAL_MATCH').replace(
                      /_/g,
                      ' ',
                    )}
                    )
                  </span>
                </div>

                <div className="space-y-2 rounded-xl border border-[#0A3A23]/15 bg-white p-4">
                  <p className="text-sm font-bold text-[#0A3A23]">
                    {result.eligibility?.summary}
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {(result.eligibility?.reasons || []).map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href={`/track-status?code=${result.trackingCode}`}>
                    <Button variant="secondary" className="gap-1.5">
                      <Search className="h-3.5 w-3.5" />
                      Track My File ({result.trackingCode}) →
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setResult(null)}>
                    New Inquiry
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 shadow-md sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      1. Select Service Category
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {enabledSectors.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setCategory(s.key)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            category === s.key
                              ? 'border-[#0A3A23] bg-[#edf7f1] text-[#0A3A23] ring-2 ring-[#0A3A23]/15'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-[#F9FAFB]'
                          }`}
                        >
                          <p className="text-xs font-bold">{s.shortLabel}</p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                            {s.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-700">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Md. Rakibul Islam"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-700">
                        Phone / WhatsApp Number *
                      </label>
                      <Input
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. +8801711223344"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-700">
                        Preferred Country / Destination
                      </label>
                      <Input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder={
                          category === 'HAJJ_UMRAH'
                            ? 'Makkah & Madinah'
                            : category === 'WORK_PERMIT'
                              ? 'Romania / Saudi Arabia / Malaysia'
                              : category === 'STUDENT_VISA'
                                ? 'UK / Malaysia / Canada / Australia'
                                : "Cox's Bazar / Maldives / Thailand"
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-700">
                        Estimated Budget ({brand.defaultCurrency})
                      </label>
                      <Input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 450000"
                      />
                    </div>
                  </div>

                  {category === 'WORK_PERMIT' && (
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
                      <p className="text-xs font-bold uppercase text-[#0A3A23]">
                        Work Permit Pre-Eligibility Check
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Applicant Age (Years)
                          </label>
                          <Input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 27"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Passport Validity (Months)
                          </label>
                          <Input
                            type="number"
                            value={passportValidityMonths}
                            onChange={(e) =>
                              setPassportValidityMonths(e.target.value)
                            }
                            placeholder="Min 12 months"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Trade / Job Category
                          </label>
                          <Input
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            placeholder="Warehouse / Driving / Hospitality"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {category === 'STUDENT_VISA' && (
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
                      <p className="text-xs font-bold uppercase text-[#0A3A23]">
                        Academic &amp; IELTS Eligibility Profile
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Last GPA / CGPA
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={gpa}
                            onChange={(e) => setGpa(e.target.value)}
                            placeholder="e.g. 3.45"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            IELTS / PTE Score (0 if MOI)
                          </label>
                          <Input
                            type="number"
                            step="0.5"
                            value={ieltsScore}
                            onChange={(e) => setIeltsScore(e.target.value)}
                            placeholder="e.g. 6.0"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Study Gap (Years)
                          </label>
                          <Input
                            type="number"
                            value={studyGapYears}
                            onChange={(e) => setStudyGapYears(e.target.value)}
                            placeholder="e.g. 2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {category === 'HAJJ_UMRAH' && (
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
                      <p className="text-xs font-bold uppercase text-[#0A3A23]">
                        Hajj &amp; Umrah Pilgrim Readiness
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Passport Remaining Validity (Months)
                          </label>
                          <Input
                            type="number"
                            value={passportValidityMonths}
                            onChange={(e) =>
                              setPassportValidityMonths(e.target.value)
                            }
                            placeholder="Minimum 6 months required"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            Email (Optional)
                          </label>
                          <Input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="pilgrim@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-700">
                      Additional Notes / Questions
                    </label>
                    <textarea
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Mention preferred intake, work experience, room sharing preference, or number of family members..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#0A3A23] focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="gold"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    {isPending
                      ? 'Evaluating Profile & Generating Tracking ID...'
                      : 'Submit & Get Instant Eligibility + Tracking ID →'}
                  </Button>
                </form>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="border-[#062416] bg-[#0A3A23] p-6 text-white">
              <h3 className="text-sm font-bold uppercase text-[#F7D29E]">
                Already Applied With Us?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                Check your Passport, GAMCA Medical, Offer Letter, BMET Manpower, or Umrah Visa progress 24/7 using your Tracking Code.
              </p>
              <Link href="/track-status" className="mt-4 block">
                <Button variant="gold" size="sm" className="w-full gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  Track Application Status
                </Button>
              </Link>
            </Card>

            <Card className="space-y-3 p-6">
              <h3 className="text-sm font-bold uppercase text-[#0A3A23]">
                Talk to a Counselor Directly
              </h3>
              <a
                href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-lg font-bold text-[#0A3A23] transition hover:text-[#D9822B]"
              >
                <Phone className="h-4 w-4 text-[#D9822B]" />
                {brand.phone}
              </a>
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0A3A23] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#062416]"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#D9822B]" />
                Message on WhatsApp ↗
              </a>
              <p className="text-xs text-gray-500">
                Office Hours: {brand.officeHours}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold uppercase text-[#0A3A23]">
                Visit Our Office
              </h3>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {brand.address}
              </p>
              <a
                href={`mailto:${brand.email}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A3A23] hover:text-[#D9822B] hover:underline"
              >
                <Mail className="h-3.5 w-3.5 text-[#D9822B]" />
                {brand.email}
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicContactAndAssessmentPage() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactFormContent />
    </Suspense>
  );
}
