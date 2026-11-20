import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { ContactAssessmentClient } from '@/components/module/public/ContactAssessmentClient';
import { ContactPageSkeleton } from '@/components/shared/AppSkeletons';
import { JsonLd } from '@/components/shared/JsonLd';
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return buildPageMetadata({
    title: 'Contact & Free Eligibility Check',
    description: `Contact ${brand.agencyName} at ${brand.address} (${brand.phone}, ${brand.email}) or submit a free eligibility assessment for Work Permits, Student Visas, Holiday Tours, and Hajj & Umrah.`,
    path: '/contact',
    siteName: brand.agencyName,
    keywords: [
      `Contact ${brand.agencyName}`,
      `${brand.cityLabel} Travel Agency Contact`,
      'Free Visa Eligibility Assessment',
      `Europe Work Permit Consultation ${brand.cityLabel}`,
    ],
  });
}

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
