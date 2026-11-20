import type { Metadata } from 'next';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import {
  buildTravelAgencyJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { JsonLd } from '@/components/shared/JsonLd';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { FloatingHelpWidget } from '@/components/common/FloatingHelpWidget';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return {
    title: {
      default: `${brand.agencyName} | ${brand.tagline}`,
      template: `%s | ${brand.agencyName}`,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getLiveBrandInfo();

  return (
    <BrandProvider brand={brand}>
      <JsonLd data={buildTravelAgencyJsonLd(brand)} />
      <JsonLd data={buildWebSiteJsonLd(brand)} />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingHelpWidget />
      </div>
    </BrandProvider>
  );
}
