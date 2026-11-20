import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';
import { buildBackendUrl } from '@/lib/auth-refresh';
import { getSiteUrl } from '@/lib/seo';
import type { Country, TourPackage, VisaService } from '@/types/api';

const FALLBACK_LAST_MODIFIED = new Date('2026-11-20T00:00:00.000Z');

async function fetchPublicList<T>(endpoint: string): Promise<T[]> {
  const url = buildBackendUrl(endpoint);
  if (!url) return [];

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];
    const raw = (await res.json().catch(() => null)) as
      | { data?: T[] }
      | T[]
      | null;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.data)) {
      return raw.data;
    }
    return [];
  } catch {
    return [];
  }
}

async function getCachedSitemapEntries(
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('hours');

  const [packages, countries, services] = await Promise.all([
    fetchPublicList<TourPackage>('/packages?limit=100'),
    fetchPublicList<Country>('/countries?limit=100'),
    fetchPublicList<VisaService>('/visa-services?limit=200'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: FALLBACK_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/packages`,
      lastModified: FALLBACK_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/visa-services`,
      lastModified: FALLBACK_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: FALLBACK_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track-status`,
      lastModified: FALLBACK_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const packageRoutes: MetadataRoute.Sitemap = packages
    .filter((pkg) => !pkg.isArchived)
    .map((pkg) => ({
      url: `${baseUrl}/packages/${pkg.id}`,
      lastModified: pkg.updatedAt ? new Date(pkg.updatedAt) : FALLBACK_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const countryRoutes: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/visa-services/${country.slug}`,
    lastModified: country.updatedAt
      ? new Date(country.updatedAt)
      : FALLBACK_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services
    .filter((svc) => Boolean(svc.country?.slug && svc.slug))
    .map((svc) => ({
      url: `${baseUrl}/visa-services/${svc.country!.slug}/${svc.slug}`,
      lastModified: svc.updatedAt ? new Date(svc.updatedAt) : FALLBACK_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...packageRoutes,
    ...countryRoutes,
    ...serviceRoutes,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getCachedSitemapEntries(getSiteUrl());
}
