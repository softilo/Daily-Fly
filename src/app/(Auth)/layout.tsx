import type { Metadata } from 'next';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { Logo } from '@/components/shared/Logo';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return {
    title: `Staff Sign In | ${brand.agencyName}`,
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getLiveBrandInfo();

  return (
    <BrandProvider brand={brand}>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0F7F3] via-[#F9FAFB] to-white px-4 py-12">
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-[#0A3A23]/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#D9822B]/10 blur-3xl" />

        <div className="relative z-10 mb-8">
          <Logo href="/" size="lg" showTagline />
        </div>
        <div className="relative z-10 flex w-full justify-center">{children}</div>
      </div>
    </BrandProvider>
  );
}
