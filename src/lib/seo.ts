import type { Metadata } from 'next';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import type { LiveBrandInfo } from '@/lib/brand';
import type { TourPackage, VisaService } from '@/types/api';

export function getSiteUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (explicit) {
    const withProto = explicit.startsWith('http')
      ? explicit
      : `https://${explicit}`;
    return withProto.replace(/\/+$/, '');
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    return `https://${vercelProd.replace(/\/+$/, '')}`;
  }

  const vercelPreview = process.env.VERCEL_URL?.trim();
  if (vercelPreview) {
    return `https://${vercelPreview.replace(/\/+$/, '')}`;
  }

  return 'http://localhost:3000';
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const normalizedPath = pathOrUrl.startsWith('/')
    ? pathOrUrl
    : `/${pathOrUrl}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const NO_INDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export interface PageMetadataOptions {
  title: string;
  absoluteTitle?: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  imageAlt?: string;
  noIndex?: boolean;
  siteName?: string;
}

export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  keywords,
  ogImage = '/logo.png',
  imageAlt,
  noIndex = false,
  siteName = brandConfig.agencyName,
}: PageMetadataOptions): Metadata {
  const fullTitle = absoluteTitle || `${title} | ${siteName}`;
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const alt = imageAlt || fullTitle;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords: keywords ?? brandConfig.seo.keywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex
      ? NO_INDEX_ROBOTS
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName,
      locale: 'en_BD',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function buildTravelAgencyJsonLd(brand: LiveBrandInfo) {
  const siteUrl = getSiteUrl();
  const sameAs = Object.values(brandConfig.socials).filter(
    (url): url is string =>
      Boolean(url && !url.endsWith('.com') && url.startsWith('http')),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${siteUrl}/#organization`,
    name: brand.agencyName,
    legalName: brand.legalName,
    description: `${brand.agencyName} — Trusted travel agency for Air Ticket Booking, Visa Assistance, Europe Work Permits, Student Visas, and Hajj & Umrah packages. Office: ${brand.address}.`,
    url: siteUrl,
    logo: toAbsoluteUrl(brand.logoUrl || '/logo.png'),
    image: toAbsoluteUrl('/images/packages-hero-bg.jpg'),
    telephone: brand.phone,
    email: brand.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: brand.address,
      addressLocality: brand.cityLabel,
      addressCountry: 'BD',
    },
    areaServed: ['Bangladesh', 'Worldwide'],
    openingHours: brand.officeHours,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteJsonLd(brand: LiveBrandInfo) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: brand.agencyName,
    url: siteUrl,
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/packages?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildPackageJsonLd(pkg: TourPackage, brand: LiveBrandInfo) {
  const siteUrl = getSiteUrl();
  const sectorMeta =
    SECTOR_CATALOG[pkg.category ?? 'TOUR'] ?? SECTOR_CATALOG.TOUR;
  const priceNumber = Number(pkg.basePrice);

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.description.slice(0, 300),
    touristType: sectorMeta.label,
    url: `${siteUrl}/packages/${pkg.id}`,
    image: toAbsoluteUrl('/images/packages-hero-bg.jpg'),
    provider: {
      '@type': 'TravelAgency',
      name: brand.agencyName,
      url: siteUrl,
      telephone: brand.phone,
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: pkg.inclusions?.length || 1,
      description: `${pkg.durationDays} Days in ${pkg.destination}`,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/packages/${pkg.id}`,
      priceCurrency: pkg.currency || brand.defaultCurrency || 'BDT',
      price: Number.isFinite(priceNumber) ? priceNumber : 0,
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildVisaServiceJsonLd(
  service: VisaService,
  brand: LiveBrandInfo,
) {
  const siteUrl = getSiteUrl();
  const countryName = service.country?.name || 'International';
  const fee = Number(service.agencyServiceFee);

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.title} (${countryName})`,
    description:
      service.shortDescription ||
      `${service.title} visa assistance and document checklist for ${countryName}.`,
    serviceType: service.customCategoryLabel || service.category,
    url: service.country?.slug
      ? `${siteUrl}/visa-services/${service.country.slug}/${service.slug}`
      : `${siteUrl}/visa-services`,
    areaServed: countryName,
    provider: {
      '@type': 'TravelAgency',
      name: brand.agencyName,
      url: siteUrl,
      telephone: brand.phone,
    },
    ...(Number.isFinite(fee) && fee > 0
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: service.currency || brand.defaultCurrency || 'BDT',
            price: fee,
          },
        }
      : {}),
  };
}
