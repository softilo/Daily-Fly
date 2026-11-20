import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from 'next/font/google';
import { brandConfig } from '@/config/brand.config';
import { getSiteUrl } from '@/lib/seo';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: brandConfig.theme.primaryHex,
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: brandConfig.seo.defaultTitle,
    template: brandConfig.seo.titleTemplate,
  },
  description: brandConfig.seo.description,
  keywords: brandConfig.seo.keywords,
  applicationName: brandConfig.agencyName,
  authors: [{ name: brandConfig.agencyName }],
  creator: brandConfig.agencyName,
  publisher: brandConfig.agencyName,
  category: 'Travel & Tourism',
  formatDetection: {
    telephone: true,
    email: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: brandConfig.seo.defaultTitle,
    description: brandConfig.seo.description,
    siteName: brandConfig.agencyName,
    locale: 'en_BD',
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
  twitter: {
    card: 'summary_large_image',
    title: brandConfig.seo.defaultTitle,
    description: brandConfig.seo.description,
    images: ['/logo.png'],
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
      className={`${jakarta.variable} ${playfair.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-[#1F2937] font-sans">
        {children}
      </body>
    </html>
  );
}
