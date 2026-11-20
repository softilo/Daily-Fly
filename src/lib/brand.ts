import { brandConfig } from '@/config/brand.config';
import { AgencySettings } from '@/types/api';

export interface LiveBrandInfo {
  agencyName: string;
  legalName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  shortLocation: string;
  cityLabel: string;
  officeHours: string;
  website?: string;
  logoUrl?: string;
  defaultCurrency: string;
  taxRate: number;
  quotationValidityDays: number;
  logoPrimary: string;
  logoAccent: string;
  logoSubtitle: string;
  initials: string;
}

const IGNORED_INITIAL_WORDS = new Set(['the', 'and', 'of', 'for', '&', 'a', 'an']);

function normalizeWhatsappNumber(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (digits.length < 7) {
    return brandConfig.contact.whatsapp;
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.startsWith('880')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+88${digits}`;
  }
  return `+${digits}`;
}

export function extractLocationSummary(address: string): {
  shortLocation: string;
  cityLabel: string;
} {
  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^\d{3,6}$/.test(p));

  const nonCountryParts = parts.filter(
    (p) => p.toLowerCase() !== 'bangladesh',
  );

  const cityCandidate =
    nonCountryParts[nonCountryParts.length - 1] ||
    parts[0] ||
    'Bangladesh';
  const cleanedCity = cityCandidate.replace(/-\d{3,6}$/, '').trim() || 'Bangladesh';

  if (nonCountryParts.length >= 2) {
    const first = nonCountryParts[0];
    const last = cleanedCity;
    const shortLocation =
      first.toLowerCase() === last.toLowerCase()
        ? first
        : `${first}, ${last}`;
    return { shortLocation, cityLabel: cleanedCity };
  }

  return {
    shortLocation: nonCountryParts[0] || address,
    cityLabel: cleanedCity,
  };
}

function deriveLogoParts(agencyName: string): {
  logoPrimary: string;
  logoAccent: string;
  logoSubtitle: string;
  initials: string;
} {
  const clean = agencyName.trim();
  if (!clean) {
    return {
      logoPrimary: brandConfig.logo.primaryText,
      logoAccent: brandConfig.logo.accentText,
      logoSubtitle: 'Travel & Tours',
      initials: 'DF',
    };
  }

  // Exact two-tone split for Daily Fly brand identity
  if (clean.toLowerCase().startsWith('daily fly')) {
    const rest = clean.slice('daily fly'.length).trim();
    return {
      logoPrimary: 'Daily ',
      logoAccent: 'Fly',
      logoSubtitle: rest || 'Travel & Tours',
      initials: 'DF',
    };
  }

  // Keep exact brand split if using TravelPilot fallback
  if (clean.toLowerCase().startsWith('travelpilot')) {
    const rest = clean.slice('travelpilot'.length).trim();
    return {
      logoPrimary: 'Travel',
      logoAccent: rest ? `Pilot ${rest}` : 'Pilot',
      logoSubtitle: '',
      initials: 'TP',
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  const meaningful = words.filter(
    (w) => !IGNORED_INITIAL_WORDS.has(w.toLowerCase()),
  );
  const initialSource = meaningful.length >= 2 ? meaningful : words;
  const initials =
    initialSource.length >= 2
      ? `${initialSource[0].charAt(0)}${initialSource[1].charAt(0)}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  if (words.length === 1) {
    return {
      logoPrimary: words[0],
      logoAccent: '',
      logoSubtitle: '',
      initials,
    };
  }

  const splitAt = Math.ceil(words.length / 2);
  return {
    logoPrimary: `${words.slice(0, splitAt).join(' ')} `,
    logoAccent: words.slice(splitAt).join(' '),
    logoSubtitle: '',
    initials,
  };
}

export function buildLiveBrandInfo(
  settings?: Partial<AgencySettings> | null,
): LiveBrandInfo {
  const agencyName = settings?.agencyName?.trim() || brandConfig.agencyName;
  const legalName =
    settings?.legalName?.trim() ||
    settings?.agencyName?.trim() ||
    brandConfig.legalName;
  const email = settings?.email?.trim() || brandConfig.contact.email;
  const phone = settings?.phone?.trim() || brandConfig.contact.phone;
  const whatsapp = normalizeWhatsappNumber(phone);
  const address = settings?.address?.trim() || brandConfig.contact.address;
  const { shortLocation, cityLabel } = extractLocationSummary(address);
  const defaultCurrency =
    settings?.defaultCurrency?.trim() || brandConfig.defaults.currency;

  const { logoPrimary, logoAccent, logoSubtitle, initials } =
    deriveLogoParts(agencyName);

  return {
    agencyName,
    legalName,
    tagline: brandConfig.tagline,
    email,
    phone,
    whatsapp,
    address,
    shortLocation,
    cityLabel,
    officeHours: brandConfig.contact.officeHours,
    website: settings?.website || undefined,
    logoUrl: settings?.logoUrl || brandConfig.logo.imageUrl,
    defaultCurrency,
    taxRate: Number(settings?.taxRate ?? 0),
    quotationValidityDays: Number(settings?.quotationValidityDays ?? 7),
    logoPrimary,
    logoAccent,
    logoSubtitle,
    initials,
  };
}

export const DEFAULT_LIVE_BRAND: LiveBrandInfo = buildLiveBrandInfo(null);
