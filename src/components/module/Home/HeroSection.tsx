'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  Landmark,
  Palmtree,
  PhoneCall,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { publicContentConfig } from '@/config/public-content.config';
import { useBrand } from '@/components/providers/BrandProvider';

const QUICK_SECTORS = [
  {
    Icon: Palmtree,
    title: 'Holiday Tours',
    subtitle: 'Packages & Hotels',
    href: '/packages?category=TOUR',
    accent: 'bg-[#edf7f1] text-[#0A3A23]',
  },
  {
    Icon: Landmark,
    title: 'Hajj & Umrah',
    subtitle: 'Sacred Journeys',
    href: '/packages?category=HAJJ_UMRAH',
    accent: 'bg-[#FEF3E2] text-[#D9822B]',
  },
  {
    Icon: GraduationCap,
    title: 'Student Visa',
    subtitle: 'Study Abroad',
    href: '/visa-services?category=STUDENT_VISA',
    accent: 'bg-[#edf7f1] text-[#0A3A23]',
  },
  {
    Icon: Briefcase,
    title: 'Work Permit',
    subtitle: 'Overseas Jobs',
    href: '/visa-services?category=WORK_PERMIT',
    accent: 'bg-[#FEF3E2] text-[#D9822B]',
  },
];

export function HeroSection() {
  const { stats } = publicContentConfig;
  const brand = useBrand();
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');

  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackingCode.trim().toUpperCase();
    if (!cleaned) {
      router.push('/track-status');
      return;
    }
    router.push(`/track-status?code=${encodeURIComponent(cleaned)}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-[#EDF6F0] via-[#F9FAFB] to-white pt-10 pb-16 sm:pt-16 lg:pb-20">
      {/* Eye-catching background geometry, ambient glows & flight arcs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-[440px] w-[440px] rounded-full bg-[#0A3A23]/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-[#D9822B]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0A3A23_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Subtle Decorative Flight Path SVG */}
      <svg
        className="pointer-events-none absolute top-10 right-0 hidden h-80 w-1/2 opacity-20 lg:block"
        viewBox="0 0 600 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 280 C 180 120, 380 40, 560 90"
          stroke="#0A3A23"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <circle cx="560" cy="90" r="5" fill="#D9822B" />
        <circle cx="40" cy="280" r="4" fill="#0A3A23" />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Hero Copy & CTAs (Preserved per user specification) */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0A3A23]/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0A3A23] shadow-sm sm:text-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#D9822B] animate-ping" />
              <span className="flex h-2 w-2 rounded-full bg-[#0A3A23]" />
              <span>
                Certified &amp; Trusted Travel Agency in {brand.cityLabel}
              </span>
            </div>

            <h1 className="mb-6 font-serif text-3xl font-extrabold leading-[1.18] tracking-tight text-[#0A3A23] sm:text-5xl sm:leading-[1.14] lg:text-6xl">
              Explore the World{' '}
              <span className="relative inline-block text-[#D9822B]">
                With Us
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#D9822B]/40"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5.5C50 1.5 150 1.5 199 5.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base font-normal leading-relaxed text-gray-600 sm:text-lg lg:mx-0 lg:text-xl">
              Trusted agency for{' '}
              <strong className="font-semibold text-gray-900">Air Ticket Booking</strong>,{' '}
              <strong className="font-semibold text-gray-900">Visa Assistance</strong>,{' '}
              <strong className="font-semibold text-[#0A3A23]">Europe Work Permits</strong>, and sacred{' '}
              <strong className="font-semibold text-[#D9822B]">Hajj &amp; Umrah</strong> packages. Located at {brand.address}.
            </p>

            <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/packages"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#D9822B] px-7 py-4 text-base font-bold tracking-wide text-white shadow-lg shadow-[#D9822B]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#BF6F1E] hover:shadow-xl hover:shadow-[#D9822B]/35 sm:w-auto"
              >
                <span>Explore Packages</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  `Hello ${brand.agencyName}, I would like to inquire about your services.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[#0A3A23] px-7 py-4 text-base font-bold text-[#0A3A23] transition-all duration-200 hover:bg-[#0A3A23] hover:text-white sm:w-auto"
              >
                <PhoneCall className="h-5 w-5 text-[#D9822B] transition-colors group-hover:text-white" />
                <span>Inbox / Call Now</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200/80 pt-6 text-left sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A3A23]" />
                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  100% Legal Permits
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A3A23]" />
                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  Best Airfares
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A3A23]" />
                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  VIP Umrah Guides
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0A3A23]" />
                <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                  {brand.shortLocation} Office
                </span>
              </div>
            </div>
          </div>

          {/* Right: Eye-Catching Travel Portal / Boarding Card */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glow Halo */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#0A3A23]/15 via-[#D9822B]/15 to-[#0A3A23]/10 blur-xl" />

              {/* Floating Pill Top Right */}
              <div className="hidden sm:inline-flex absolute -top-4 right-4 z-20 items-center gap-1.5 rounded-full border border-[#F7D29E] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0A3A23] shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-[#D9822B]" />
                <span>24/7 Live File Tracking</span>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-[#0A3A23]/15 bg-white shadow-2xl">
                {/* Deep Forest Green Header Band */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#062416] via-[#0A3A23] to-[#125734] px-6 py-5 text-white">
                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[#D9822B]/25 blur-xl" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-xs">
                        <Plane className="h-5 w-5 -rotate-45 text-[#F7D29E]" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#F7D29E]">
                          Instant Service Desk
                        </p>
                        <h2 className="text-base font-extrabold text-white">
                          {brand.agencyName}
                        </h2>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-white/15">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>

                {/* Boarding-Pass Perforated Divider */}
                <div className="relative flex items-center justify-between bg-[#F0F7F3] px-6 py-3 border-b border-dashed border-[#0A3A23]/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0A3A23]">
                    <Search className="h-3.5 w-3.5 text-[#D9822B]" />
                    <span>Track Your Live File Status</span>
                  </div>
                  <Link
                    href="/track-status"
                    className="text-[11px] font-bold text-[#D9822B] hover:underline"
                  >
                    Open Tracker →
                  </Link>
                </div>

                {/* Interactive Tracker Form & Quick Sector Grid */}
                <div className="space-y-5 p-5 sm:p-6">
                  <form onSubmit={handleQuickTrack} className="flex gap-2">
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      placeholder="Enter Code (e.g. SV-820383)"
                      className="h-11 flex-1 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3.5 font-mono text-xs uppercase text-gray-900 placeholder:text-gray-400 focus:border-[#0A3A23] focus:bg-white focus:ring-2 focus:ring-[#0A3A23]/15 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#D9822B] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#BF6F1E]"
                    >
                      <span>Track</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Explore Service Verticals</span>
                      <Compass className="h-3.5 w-3.5 text-[#D9822B]" />
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {QUICK_SECTORS.map(({ Icon, title, subtitle, href, accent }) => (
                        <Link
                          key={title}
                          href={href}
                          className="group flex items-center gap-2.5 rounded-xl border border-gray-200/80 bg-[#F9FAFB] p-3 transition-all hover:-translate-y-0.5 hover:border-[#0A3A23]/40 hover:bg-white hover:shadow-md"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#0A3A23]">
                              {title}
                            </p>
                            <p className="truncate text-[10px] font-medium text-gray-500">
                              {subtitle}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Quick Eligibility Bar */}
                  <Link
                    href="/contact"
                    className="flex items-center justify-between rounded-xl border border-[#0A3A23]/15 bg-[#F0F7F3] px-4 py-3 text-xs font-bold text-[#0A3A23] transition hover:border-[#0A3A23] hover:bg-[#0A3A23] hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#D9822B]" />
                      Free Eligibility Check &amp; Instant Quote
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#D9822B]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elevated Bottom Stats Strip */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#0A3A23]/10 bg-white/90 px-5 py-4 shadow-2xs backdrop-blur-xs transition hover:border-[#D9822B]/50 hover:shadow-sm"
            >
              <p className="text-2xl font-extrabold text-[#0A3A23] tabular-nums sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
