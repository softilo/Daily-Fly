import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackStatusClient } from '@/components/module/public/TrackStatusClient';
import { TrackStatusPageSkeleton } from '@/components/shared/AppSkeletons';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const instant = false;

export const metadata: Metadata = buildPageMetadata({
  title: 'Track Application & File Status',
  description:
    'Track your visa application, work permit processing, GAMCA medicals, BMET manpower, or tour file status 24/7 using your personal Daily Fly Tracking Code.',
  path: '/track-status',
  keywords: [
    'Daily Fly File Tracker',
    'Visa Status Check Bangladesh',
    'Work Permit Tracking Code',
    'Application Status Daily Fly',
  ],
});

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
