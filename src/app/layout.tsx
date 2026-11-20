import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import { brandConfig } from '@/config/brand.config';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: brandConfig.seo.defaultTitle,
    template: brandConfig.seo.titleTemplate,
  },
  description: brandConfig.seo.description,
  keywords: brandConfig.seo.keywords,
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: brandConfig.seo.defaultTitle,
    description: brandConfig.seo.description,
    siteName: brandConfig.agencyName,
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: `${brandConfig.agencyName} Logo`,
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-[#1F2937] font-sans">
        {children}
      </body>
    </html>
  );
}
