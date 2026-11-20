import type { Metadata } from 'next';
import {
  getCurrentAccessTiming,
  requireStaffSession,
} from '@/services/auth/getMe';
import { getLiveBrandInfo } from '@/services/settings/settings.service';
import { NO_INDEX_ROBOTS } from '@/lib/seo';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { SessionSecurityGuard } from '@/components/providers/SessionSecurityGuard';
import { DashboardSidebar } from '@/components/module/dashboard/DashboardSidebar';
import { DashboardNavbar } from '@/components/module/dashboard/DashboardNavbar';

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getLiveBrandInfo();
  return {
    title: {
      default: `CRM Workspace | ${brand.agencyName}`,
      template: `%s | ${brand.agencyName}`,
    },
    robots: NO_INDEX_ROBOTS,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, brand, accessTiming] = await Promise.all([
    requireStaffSession(),
    getLiveBrandInfo(),
    getCurrentAccessTiming(),
  ]);

  return (
    <BrandProvider brand={brand}>
      <SessionSecurityGuard
        initialAccessExpiresAtMs={accessTiming.expiresAtMs}
        initialAccessIssuedAtMs={accessTiming.issuedAtMs}
      />
      <div className="min-h-screen bg-[#FAF9F6]">
        <DashboardSidebar role={user.role} />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <DashboardNavbar user={user} />
          <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </BrandProvider>
  );
}
