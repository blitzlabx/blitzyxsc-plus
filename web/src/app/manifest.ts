import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'blitzyxsc-plus',
    short_name: 'blitzyxsc',
    description: 'No-auth X/Twitter data API by Blitz (blitzlabx).',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0907',
    theme_color: '#e8b339',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['developer', 'productivity', 'utilities'],
    author: 'Blitz (blitzlabx)',
  };
}
