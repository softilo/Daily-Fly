import type { MetadataRoute } from 'next';
import { brandConfig } from '@/config/brand.config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandConfig.agencyName,
    short_name: brandConfig.shortName,
    description: brandConfig.seo.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: brandConfig.theme.primaryHex,
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
