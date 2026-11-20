import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { TrackStatusClient } from '@/components/module/public/TrackStatusClient';
import { TrackStatusPageSkeleton } from '@/components/shared/AppSkeletons';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return buildPageMetadata({
    title: 'Track Application & File Status',
    description: `Track your visa application, work permit processing, GAMCA medicals, BMET manpower, or tour file status 24/7 with ${brand.agencyName}. Need help? Call ${brand.phone}.`,
    path: '/track-status',
    siteName: brand.agencyName,
    keywords: [
      `${brand.agencyName} File Tracker`,
      'Visa Status Check Bangladesh',
      'Work Permit Tracking Code',
    ],
  });
}

export default function PublicTrackStatusPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Track Status', path: '/track-status' },
        ])}
      />
      <Suspense fallback={<TrackStatusPageSkeleton />}>
        <TrackStatusClient />
      </Suspense>
    </>
  );
}
