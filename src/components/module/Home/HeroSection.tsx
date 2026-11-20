'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Palmtree,
  PhoneCall,
  Search,
} from 'lucide-react';
import { publicContentConfig } from '@/config/public-content.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { Button } from '@/components/ui/button';

const QUICK_SECTORS = [
  {
    Icon: Palmtree,
    title: 'Holiday Tours',
    href: '/packages?category=TOUR',
  },
  {
    Icon: Landmark,
    title: 'Hajj & Umrah',
    href: '/packages?category=HAJJ_UMRAH',
  },
  {
    Icon: GraduationCap,
    title: 'Student Visa',
    href: '/visa-services?category=STUDENT_VISA',
  },
  {
    Icon: Briefcase,
    title: 'Work Permit & Job Visa',
    href: '/visa-services?category=WORK_PERMIT',
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
    <section className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-[#F0F7F3] via-[#F9FAFB] to-white pt-10 pb-16 sm:pt-16 lg:pb-20">
      {/* Subtle Brand Ambient Accents */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-[#0A3A23]/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#D9822B]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0A3A23_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Hero Copy & CTAs */}
          <div className="text-center lg:col-span-7 lg:text-left">
            {/* Top Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0A3A23]/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0A3A23] shadow-sm sm:text-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#D9822B] animate-ping" />
              <span className="flex h-2 w-2 rounded-full bg-[#0A3A23]" />
              <span>Certified &amp; Trusted Travel Agency in Feni</span>
            </div>

            {/* Main Headline */}
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

            {/* Subheadline */}
            <p className="mx-auto mb-8 max-w-2xl text-base font-normal leading-relaxed text-gray-600 sm:text-lg lg:mx-0 lg:text-xl">
              Trusted agency for{' '}
              <strong className="font-semibold text-gray-900">Air Ticket Booking</strong>,{' '}
              <strong className="font-semibold text-gray-900">Visa Assistance</strong>,{' '}
              <strong className="font-semibold text-[#0A3A23]">Europe Work Permits</strong>, and sacred{' '}
              <strong className="font-semibold text-[#D9822B]">Hajj &amp; Umrah</strong> packages. Located at Feni Center, Feni.
            </p>

            {/* Dual CTAs */}
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

            {/* Trust Highlights Checklist */}
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
                  Feni Center Office
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Box (Track File + Choose Service) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#0A3A23]/15 bg-white p-5 shadow-xl sm:p-6">
              <div className="mb-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0A3A23]">
                  <Search className="h-4 w-4 text-[#D9822B]" />
                  Track Your Live File Status
                </h2>
              </div>

              <form onSubmit={handleQuickTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Enter Tracking Code (e.g. SV-820383)"
                  className="h-10 flex-1 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3 font-mono text-xs uppercase text-gray-900 placeholder:text-gray-400 focus:border-[#0A3A23] focus:bg-white focus:outline-none"
                />
                <Button type="submit" variant="gold" size="sm" className="h-10 px-4">
                  Track →
                </Button>
              </form>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Browse By Category
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_SECTORS.map(({ Icon, title, href }) => (
                    <Link
                      key={title}
                      href={href}
                      className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-[#F9FAFB] px-3.5 py-3 transition hover:border-[#0A3A23] hover:bg-[#edf7f1]"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#D9822B]" />
                      <p className="text-xs font-bold text-[#0A3A23]">
                        {title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-[#0A3A23]/10 pt-8 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx}>
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
