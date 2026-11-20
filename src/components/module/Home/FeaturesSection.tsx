import Link from 'next/link';
import { publicContentConfig } from '@/config/public-content.config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick a Service or Check Eligibility',
    href: '/contact',
  },
  {
    step: '02',
    title: 'Receive Tracking ID & Official Quote',
    href: '/packages',
  },
  {
    step: '03',
    title: 'Track Documents & Visa Live 24/7',
    href: '/track-status',
  },
];

export function FeaturesSection() {
  return (
    <>
      {/* How It Works */}
      <section className="border-t border-gray-200/80 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0A3A23]">
              How It Works
            </h2>
            <Link href="/contact">
              <Button variant="gold" size="sm">
                Start Free Assessment →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Link key={item.step} href={item.href}>
                <Card className="group flex items-center justify-between gap-3.5 border-gray-200/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3A23]/50 hover:shadow-lg">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3A23] text-sm font-extrabold text-white shadow-xs transition-colors group-hover:bg-[#D9822B]">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-[#0A3A23] sm:text-base">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-sm font-bold text-[#D9822B] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-t border-gray-200/80 bg-[#F9FAFB] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#0A3A23]">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {publicContentConfig.features.map((feat, idx) => (
              <Card
                key={idx}
                className="group relative overflow-hidden border-gray-200/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3A23]/40 hover:shadow-lg"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#0A3A23] to-[#D9822B] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#F7D29E] bg-[#FEF3E2] text-xs font-extrabold text-[#BF6F1E] transition-colors group-hover:bg-[#D9822B] group-hover:text-white">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[#0A3A23]">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feat.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
