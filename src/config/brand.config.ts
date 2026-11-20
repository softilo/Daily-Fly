/**
 * ============================================================================
 * CENTRALIZED WHITE-LABEL BRAND CONFIGURATION
 * ============================================================================
 * When cloning this project for a new Travel Agency client:
 * 1. Update this single file (`brand.config.ts`) for agency name, logo, colors,
 *    contact details, currency, and SEO metadata.
 * 2. Update `public-content.config.ts` and `src/app/(Public)` for landing page
 *    custom design.
 * 3. The entire `(Dashboard)` CRM, Quotation Engine, and RBAC
 *    automatically adapt without changing a single dashboard file.
 * ============================================================================
 */

import { ServiceCategory } from '@/types/api';

export const PACKAGE_CATEGORIES: ServiceCategory[] = ['TOUR', 'HAJJ_UMRAH'];

export function isPackageCategory(category?: ServiceCategory | string): boolean {
  return category === 'TOUR' || category === 'HAJJ_UMRAH';
}

export interface SectorMetaConfig {
  key: ServiceCategory;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
}

export const SECTOR_CATALOG: Record<ServiceCategory, SectorMetaConfig> = {
  TOUR: {
    key: 'TOUR',
    label: 'Holiday Tours & Air Tickets',
    shortLabel: 'Holiday Tour',
    badgeColor: 'bg-[#edf7f1] text-[#0A3A23] border-[#0A3A23]/20',
    description: 'Domestic & international holiday packages, air tickets, hotels, and tourist visas.',
  },
  HAJJ_UMRAH: {
    key: 'HAJJ_UMRAH',
    label: 'Hajj & Umrah Packages',
    shortLabel: 'Hajj & Umrah',
    badgeColor: 'bg-[#0A3A23] text-white border-[#0A3A23]',
    description: 'Nusuk-verified Hajj & Umrah packages with walking-distance Haram hotels.',
  },
  WORK_PERMIT: {
    key: 'WORK_PERMIT',
    label: 'Europe & Global Work Permits',
    shortLabel: 'Work Permit',
    badgeColor: 'bg-[#FEF3E2] text-[#BF6F1E] border-[#F7D29E]',
    description: 'Verified overseas employment permits (Albania, Romania, Croatia & GCC) with BMET processing.',
  },
  STUDENT_VISA: {
    key: 'STUDENT_VISA',
    label: 'Study Abroad & Student Visa',
    shortLabel: 'Student Visa',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'University admission, SOP/CAS support, and student visa counseling.',
  },
};

export interface BrandConfig {
  agencyName: string;
  shortName: string;
  tagline: string;
  legalName: string;
  establishedYear: number;
  /**
   * Toggle which service verticals this agency sells!
   * Simply remove or reorder categories when cloning for a niche agency.
   */
  enabledCategories: ServiceCategory[];
  logo: {
    primaryText: string;
    accentText: string;
    imageUrl?: string;
    faviconUrl: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    officeHours: string;
    googleMapsUrl?: string;
  };
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  defaults: {
    currency: string;
    currencySymbol: string;
    locale: string;
  };
  theme: {
    primaryHex: string;
    accentHex: string;
  };
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    description: string;
    keywords: string[];
  };
}

export const brandConfig: BrandConfig = {
  agencyName: 'Daily Fly Travel & Tours',
  shortName: 'Daily Fly',
  tagline: 'Explore the world with us',
  legalName: 'Daily Fly Travel & Tours',
  establishedYear: 2026,
  enabledCategories: ['TOUR', 'HAJJ_UMRAH', 'WORK_PERMIT', 'STUDENT_VISA'],
  logo: {
    primaryText: 'Daily ',
    accentText: 'Fly',
    imageUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
  },
  contact: {
    phone: '01355-289399',
    whatsapp: '+8801355289399',
    email: 'dailyflytraveltours@gmail.com',
    address: 'Feni Center, 5th floor, Lift (4), Post Office Road, Feni, Bangladesh, 3900',
    officeHours: 'Saturday – Thursday: 9:30 AM – 8:00 PM',
  },
  socials: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  },
  defaults: {
    currency: 'BDT',
    currencySymbol: '৳',
    locale: 'en-BD',
  },
  theme: {
    primaryHex: '#0A3A23', // Brand Forest Green
    accentHex: '#D9822B',  // Brand Warm Gold
  },
  seo: {
    titleTemplate: '%s | Daily Fly Travel & Tours',
    defaultTitle: 'Daily Fly Travel & Tours | Explore The World With Us',
    description:
      'Daily Fly Travel & Tours — Trusted agency for Air Ticket Booking, Visa Assistance, Europe Work Permits (Albania, Romania, Croatia), Student Visas, and sacred Hajj & Umrah packages. Located at Feni Center, Feni, Bangladesh.',
    keywords: [
      'Daily Fly Travel & Tours',
      'Air Ticket Feni',
      'Europe Work Permit Bangladesh',
      'Albania Work Permit Visa',
      'Hajj Umrah Agency Feni',
      'Feni Travel Agency',
      'Visa Assistance Bangladesh',
    ],
  },
};
