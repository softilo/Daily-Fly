'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, Copy, Search } from 'lucide-react';
import { AgencyServiceStatus, VisaCategory } from '@/types/api';
import { submitPublicVisaInquiryAction } from '@/services/visa/visa.service';

interface VisaInquiryFormProps {
  countryId: string;
  countryName: string;
  visaServiceId: string;
  serviceTitle: string;
  category: VisaCategory;
  serviceStatus: AgencyServiceStatus;
}

export default function VisaInquiryForm({
  countryId,
  countryName,
  visaServiceId,
  serviceTitle,
  category,
  serviceStatus,
}: VisaInquiryFormProps) {
  const isAccepting =
    serviceStatus === 'ACCEPTING_INQUIRIES' || serviceStatus === 'LIMITED';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
    consentGiven: false,
  });

  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    trackingCode: string | null;
    message: string;
  } | null>(null);

  if (!isAccepting) {
    return (
      <div className="rounded-2xl border border-[#F7D29E] bg-[#FEF3E2] p-6">
        <h3 className="text-base font-bold text-[#BF6F1E]">
          Inquiries Currently Paused for This Service
        </h3>
        <p className="mt-2 text-sm text-[#BF6F1E]">
          Our agency is currently not accepting new consultation requests for{' '}
          <strong>{serviceTitle}</strong> ({countryName}). Please check back later or browse our other active destination services.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentGiven) {
      setError('Please confirm that you consent to our team contacting you regarding this inquiry.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitPublicVisaInquiryAction({
      countryId,
      visaServiceId,
      category,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || undefined,
      message: formData.message || undefined,
      consentGiven: formData.consentGiven,
    });

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.message || 'Could not submit inquiry. Please try again.');
      return;
    }

    setSubmittedResult({
      trackingCode: res.data.trackingCode || null,
      message: res.message || 'Thank you for your visa inquiry.',
    });
  };

  if (submittedResult) {
    return (
      <div className="space-y-4 rounded-2xl border border-[#0A3A23]/20 bg-[#edf7f1] p-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0A3A23] shadow-2xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#D9822B]" />
          Consultation Request Registered
        </div>
        <h3 className="text-lg font-bold text-[#0A3A23]">
          Thank you! Your Visa File Has Been Created
        </h3>
        <p className="text-sm text-[#062416]">{submittedResult.message}</p>
        {submittedResult.trackingCode && (
          <div className="space-y-3 rounded-xl border border-[#0A3A23]/20 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Your File Tracking Code
                </p>
                <p className="mt-0.5 font-mono text-xl font-extrabold text-[#0A3A23]">
                  #{submittedResult.trackingCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && submittedResult.trackingCode) {
                    void navigator.clipboard.writeText(submittedResult.trackingCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-[#F9FAFB] px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#0A3A23]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy ID
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Use this Tracking Code anytime to check document verification and visa processing milestones.
            </p>
            <Link
              href={`/track-status?code=${submittedResult.trackingCode}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#D9822B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#BF6F1E]"
            >
              <Search className="h-3.5 w-3.5" />
              Track My File Status Now →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-md"
    >
      <div>
        <h3 className="text-lg font-bold text-[#0A3A23]">
          Request a Visa Consultation
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Inquiring about <strong>{serviceTitle}</strong> for <strong>{countryName}</strong>. An authorized visa consultant will review your inquiry and contact you.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-bold text-gray-700">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Your full name as on passport"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#0A3A23] focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            Phone / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            minLength={7}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+8801XXXXXXXXX"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#0A3A23] focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#0A3A23] focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-gray-700">
          Inquiry Note / Background Summary
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Briefly mention your intended travel timeline, qualification/work background, or questions..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#0A3A23] focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-gray-600">
        <input
          type="checkbox"
          required
          checked={formData.consentGiven}
          onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0A3A23] focus:ring-[#0A3A23]"
        />
        <span>
          I understand that this agency provides visa consultancy and documentation assistance only, that final visa decisions rest solely with the relevant embassy/government authority, and I consent to being contacted regarding my inquiry.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#D9822B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#BF6F1E] disabled:opacity-50"
      >
        {loading ? 'Submitting Inquiry...' : 'Submit Consultation Request'}
      </button>
    </form>
  );
}
