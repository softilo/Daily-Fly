'use client';

import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  Palmtree,
  Phone,
  Plane,
  Search,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { useBrand } from '@/components/providers/BrandProvider';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  const brand = useBrand();
  const cleanPhone = brand.phone.replace(/\s+/g, '');
  const cleanWhatsapp = brand.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="border-t border-white/10 bg-[#062416] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-3 inline-block max-w-full">
              <Logo href="/" inverted size="md" showTagline />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {brand.tagline}
            </p>
            <p className="mt-4 text-xs text-slate-400">
              {brand.legalName}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Travel &amp; Visa Services
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/packages?category=TOUR"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <Palmtree className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Holiday &amp; Group Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/packages?category=HAJJ_UMRAH"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <Landmark className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Hajj &amp; Umrah Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/visa-services?category=STUDENT_VISA"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <GraduationCap className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Study Abroad &amp; Student Visa
                </Link>
              </li>
              <li>
                <Link
                  href="/visa-services?category=WORK_PERMIT"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <Briefcase className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Work Permit &amp; Job Visa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Applicant Self-Service
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/track-status"
                  className="inline-flex items-center gap-2 font-semibold text-[#F7D29E] transition hover:text-white"
                >
                  <Search className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Live File Status Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Free Eligibility Assessment
                </Link>
              </li>
              <li>
                <Link
                  href="/visa-services"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <Globe className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  Country Visa Checklists
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <Plane className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  All Verified Packages
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Office Support
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  {brand.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-[#F7D29E]"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  WhatsApp Consultation ↗
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="inline-flex items-center gap-2 break-all transition hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#D9822B]" />
                  {brand.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D9822B]" />
                <span>{brand.address}</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-4 w-4 shrink-0 text-[#D9822B]" />
                <span>{brand.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © {brandConfig.establishedYear} {brand.legalName}. All rights reserved.
          </p>
          <p>Transparent Consultancy • Zero Hidden Charges • 24/7 Online File Tracking</p>
        </div>
      </div>
    </footer>
  );
}
