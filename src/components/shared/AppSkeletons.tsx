import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PackageCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton tone="emerald" className="h-6 w-24 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton tone="emerald" className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-4 h-6 w-4/5 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-full rounded-md" />
        <Skeleton className="mt-1.5 h-4 w-5/6 rounded-md" />

        <div className="mt-5 space-y-2 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5">
          <Skeleton className="h-3 w-24 rounded-md" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 w-full rounded-md" />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-gray-100 pt-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton tone="emerald" className="h-7 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

function CountryCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton tone="emerald" className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-4 w-full rounded-md" />
        <Skeleton className="mt-1.5 h-4 w-3/4 rounded-md" />
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs">
      <div className="p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton tone="emerald" className="h-6 w-10 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-6 w-3/4 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-full rounded-md" />
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-[#F9FAFB] p-3.5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton tone="emerald" className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 bg-[#F9FAFB]/80 px-6 py-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-xl" />
      </div>
    </div>
  );
}

function CompactBannerSkeleton({ withCategoryTabs = false }: { withCategoryTabs?: boolean }) {
  return (
    <>
      <section className="border-b border-[#062416] bg-[#062416] pt-8 pb-12 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <Skeleton tone="dark" className="h-6 w-48 rounded-full" />
            <Skeleton tone="dark" className="h-10 w-80 sm:w-96 rounded-xl" />
            <Skeleton tone="dark" className="h-4 w-full max-w-lg rounded-md" />
          </div>
        </div>
      </section>
      <div className="relative z-20 mx-auto -mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-lg">
          {withCategoryTabs && (
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-8 w-28 rounded-full" />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
          {!withCategoryTabs && (
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-9 w-32 rounded-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-28 rounded-md" />
        <Skeleton tone="emerald" className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-8 w-20 rounded-lg" />
      <Skeleton className="mt-2 h-3.5 w-32 rounded-md" />
    </div>
  );
}

export function RootLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 sm:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton tone="emerald" className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <PackageCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PublicHomeSkeleton() {
  return (
    <div className="bg-[#F9FAFB]">
      {/* Hero Skeleton */}
      <section className="border-b border-gray-200/70 bg-gradient-to-br from-[#F4FAF6] via-white to-[#FFF9F2] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <Skeleton tone="emerald" className="h-8 w-64 rounded-full" />
              <Skeleton className="h-14 w-full max-w-lg rounded-2xl" />
              <Skeleton className="h-5 w-full max-w-xl rounded-md" />
              <Skeleton className="h-5 w-4/5 max-w-md rounded-md" />
              <div className="flex flex-wrap gap-3.5 pt-1">
                <Skeleton className="h-12 w-44 rounded-xl" />
                <Skeleton className="h-12 w-44 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-4 border-t border-gray-200/80 pt-5">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-4 w-32 rounded-md" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xl space-y-5">
                <Skeleton tone="emerald" className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="space-y-2.5">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-9 w-72 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <PackageCardSkeleton key={idx} />
          ))}
        </div>
      </section>

      {/* Popular Visa Destinations Skeleton */}
      <section className="border-t border-gray-200/80 bg-[#F0F7F3] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Skeleton tone="emerald" className="h-6 w-32 rounded-full" />
              <Skeleton className="h-9 w-64 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <CountryCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function PublicPackagesSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <CompactBannerSkeleton />
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <PackageCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PublicPackageDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton tone="emerald" className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-4/5 rounded-xl" />
            </div>
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-3">
              <Skeleton className="h-6 w-56 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-3">
              <Skeleton className="h-6 w-44 rounded-lg" />
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-4 w-full rounded-md" />
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-4">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton tone="emerald" className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicVisaServicesSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <CompactBannerSkeleton withCategoryTabs />
      <div className="mx-auto max-w-7xl space-y-12 px-4 pt-10 pb-12 sm:px-6 lg:px-8">
        <section>
          <Skeleton className="mb-6 h-8 w-64 rounded-xl" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CountryCardSkeleton key={idx} />
            ))}
          </div>
        </section>
        <section>
          <Skeleton className="mb-6 h-8 w-72 rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ServiceCardSkeleton key={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PublicCountryDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-48 rounded-md" />
        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton tone="emerald" className="h-14 w-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-52 rounded-xl" />
                <Skeleton className="h-4 w-72 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ServiceCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PublicVisaServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-64 rounded-md" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Skeleton tone="emerald" className="h-7 w-12 rounded-lg" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>
              <Skeleton className="h-9 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="grid gap-4 rounded-xl border border-gray-100 bg-[#F9FAFB] p-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <Skeleton className="h-5 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 space-y-3">
              <Skeleton className="h-6 w-56 rounded-lg" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 space-y-4">
              <Skeleton tone="emerald" className="h-7 w-56 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrackStatusResultSkeleton() {
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton tone="emerald" className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
            <Skeleton className="h-8 w-52 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-44 rounded-md" />
            <Skeleton tone="emerald" className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton tone="emerald" className="h-2.5 w-full rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm space-y-3">
        <Skeleton className="h-6 w-56 rounded-lg" />
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full rounded-xl" />
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm space-y-3">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrackStatusPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="border-b border-gray-200/80 bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-3">
          <Skeleton tone="emerald" className="mx-auto h-6 w-44 rounded-full" />
          <Skeleton className="mx-auto h-10 w-72 rounded-xl" />
          <Skeleton className="mx-auto h-4 w-96 max-w-full rounded-md" />
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="border-b border-[#062416] bg-[#062416] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-3">
          <Skeleton tone="dark" className="h-6 w-56 rounded-full" />
          <Skeleton tone="dark" className="h-10 w-80 sm:w-96 rounded-xl" />
          <Skeleton tone="dark" className="h-4 w-full max-w-xl rounded-md" />
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 lg:col-span-2 space-y-5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-11 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-3">
                <Skeleton tone="emerald" className="h-5 w-36 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xl space-y-5">
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <Skeleton tone="emerald" className="h-5 w-36 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-3.5 w-52 rounded-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <StatCardSkeleton key={idx} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:col-span-7 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:col-span-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-4">
        <Skeleton className="h-5 w-44 rounded-md" />
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardTableSkeleton({
  rows = 7,
  cols = 5,
  hasFilters = false,
}: {
  rows?: number;
  cols?: number;
  hasFilters?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      {hasFilters && (
        <div className="rounded-2xl border border-gray-200/90 bg-white p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white">
        <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-3.5">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((_, idx) => (
              <Skeleton key={idx} className="h-4 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100 px-6">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid items-center gap-4 py-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: cols }).map((__, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className={colIdx === 0 ? 'h-5 w-4/5 rounded-md' : 'h-4 w-3/4 rounded-md'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPackagesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <PackageCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export function DashboardLeadDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-44 rounded-md" />
      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton tone="emerald" className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:col-span-8 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 lg:col-span-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardFormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="max-w-3xl rounded-2xl border border-gray-200/90 bg-white p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, idx) => (
            <div key={idx} className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardQuotationDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full rounded-xl" />
        ))}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <div className="w-64 space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton tone="emerald" className="h-7 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardVisaOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-36 rounded-xl" />
        ))}
      </div>
      <div className="flex justify-between gap-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <StatCardSkeleton key={idx} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardVisaTableSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-36 rounded-xl" />
        ))}
      </div>
      <DashboardTableSkeleton rows={7} cols={cols} hasFilters />
    </div>
  );
}
