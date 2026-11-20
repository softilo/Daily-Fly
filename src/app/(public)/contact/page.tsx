import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactAssessmentClient } from '@/components/module/public/ContactAssessmentClient';
import { ContactPageSkeleton } from '@/components/shared/AppSkeletons';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const instant = false;

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact & Free Eligibility Check',
  description:
    'Contact Daily Fly Travel & Tours at Feni Center or submit a free eligibility assessment for Work Permits, Student Visas, Holiday Tours, and Hajj & Umrah.',
  path: '/contact',
  keywords: [
    'Contact Daily Fly Travel & Tours',
    'Feni Travel Agency Contact',
    'Free Visa Eligibility Assessment',
    'Europe Work Permit Consultation Feni',
  ],
});

export default function PublicContactAndAssessmentPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact & Eligibility Check', path: '/contact' },
        ])}
      />
      <Suspense fallback={<ContactPageSkeleton />}>
        <ContactAssessmentClient />
      </Suspense>
    </>
  );
}
