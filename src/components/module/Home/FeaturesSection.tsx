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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Link key={item.step} href={item.href}>
                <Card className="group flex items-center gap-3.5 border-gray-200/90 p-5 transition hover:-translate-y-0.5 hover:border-[#0A3A23] hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3A23] text-sm font-extrabold text-white transition-colors group-hover:bg-[#D9822B]">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-[#0A3A23] sm:text-base">
                    {item.title}
                  </h3>
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
                className="border-gray-200/80 p-6 transition hover:border-[#0A3A23]/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#F7D29E] bg-[#FEF3E2] text-xs font-extrabold text-[#BF6F1E]">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[#0A3A23]">
                  {feat.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
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
