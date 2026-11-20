import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { getPublicCountriesAction } from '@/services/visa/visa.service';
import { HeroSection } from '@/components/module/Home/HeroSection';
import { FeaturesSection } from '@/components/module/Home/FeaturesSection';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { CountryCoverageBadge } from '@/components/module/visa/VisaStatusBadges';
import { Button } from '@/components/ui/button';
import { isPackageCategory } from '@/config/brand.config';
import { Country } from '@/types/api';

export const instant = false;

export default async function PublicHomePage() {
  const [packagesRes, countriesRes] = await Promise.all([
    getPackages({ limit: 12, isArchived: false }),
    getPublicCountriesAction({ limit: 6 }),
  ]);

  const packages = (packagesRes?.data || [])
    .filter((pkg) => isPackageCategory(pkg.category))
    .slice(0, 6);
  const countries = countriesRes?.data || [];

  return (
    <div>
      <HeroSection />

      {/* Featured Tour & Hajj Packages */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full bg-[#FEF3E2] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#BF6F1E]">
              Curated Journeys
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0A3A23] sm:text-3xl">
              Featured Tour &amp; Hajj Packages
            </h2>
          </div>
          <Link href="/packages">
            <Button variant="outline">View All Packages →</Button>
          </Link>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackagePreviewCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#0A3A23]/25 bg-white p-12 text-center">
            <h3 className="text-lg font-bold text-[#0A3A23]">
              Packages Are Being Updated
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Need a custom holiday, Hajj, or visa quote right now? Request one directly.
            </p>
            <Link href="/contact" className="mt-4 inline-block">
              <Button variant="gold" size="sm">
                Request Custom Quote →
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Popular Visa & Immigration Destinations Preview */}
      {countries.length > 0 && (
        <section className="border-t border-gray-200/80 bg-[#F0F7F3] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-block rounded-full border border-[#0A3A23]/20 bg-white px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0A3A23]">
                  Visa Checklists
                </span>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0A3A23] sm:text-3xl">
                  Popular Visa Destinations
                </h2>
              </div>
              <Link href="/visa-services">
                <Button variant="outline">All Countries →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country: Country) => (
                <Link
                  key={country.id}
                  href={`/visa-services/${country.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-[#0A3A23] hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1] text-xs font-bold uppercase text-[#0A3A23]">
                      {country.isoCode || country.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#0A3A23] group-hover:text-[#D9822B]">
                        {country.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {country.visaServices?.length || 0} Visa Program
                        {(country.visaServices?.length || 0) === 1 ? '' : 's'} Available
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <CountryCoverageBadge status={country.coverageStatus} />
                    <span className="text-[11px] font-bold text-[#0A3A23] transition group-hover:translate-x-0.5 group-hover:text-[#D9822B]">
                      View Checklist →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturesSection />
    </div>
  );
}
