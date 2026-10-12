import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const BASE_URL = 'https://blitzyxsc-plus.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'blitzyxsc-plus — no-auth X/Twitter data API',
    template: '%s · blitzyxsc-plus',
  },
  description:
    'Fetch tweets, profiles, replies, trends, and followers — no API key, no OAuth, no developer console. By Blitz (blitzlabx).',
  keywords: [
    'blitzyxsc',
    'twitter api',
    'x api',
    'no-auth',
    'fxtwitter',
    'blitzlabx',
    'hono',
    'edge',
    'serverless',
    'cloudflare workers',
    'vercel',
    'netlify',
  ],
  authors: [{ name: 'Blitz', url: 'https://x.com/blitzlabx' }],
  creator: 'Blitz (blitzlabx)',
  publisher: 'Blitz (blitzlabx)',
  applicationName: 'blitzyxsc-plus',
  category: 'technology',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'blitzyxsc-plus — no-auth X/Twitter data API',
    description:
      'Fetch tweets, profiles, replies, trends, and followers — no API key, no OAuth, no developer console. By Blitz (blitzlabx).',
    url: BASE_URL,
    siteName: 'blitzyxsc-plus',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'blitzyxsc-plus — no-auth X/Twitter data API by Blitz (blitzlabx)',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'blitzyxsc-plus',
    description: 'No-auth X/Twitter data API by Blitz (blitzlabx).',
    creator: '@blitzlabx',
    site: '@blitzlabx',
    images: ['/opengraph-image'],
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'blitzyxsc-plus',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'msapplication-TileColor': '#e8b339',
    'theme-color': '#e8b339',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8b339' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0907' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'blitzyxsc-plus',
              description:
                'Standalone no-auth X/Twitter data API server. Fetch tweets, profiles, replies, trends, and followers without OAuth or API keys.',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Any',
              author: {
                '@type': 'Person',
                name: 'Blitz',
                alternateName: 'blitzlabx',
                url: 'https://x.com/blitzlabx',
              },
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              license: 'https://opensource.org/licenses/MIT',
              url: BASE_URL,
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
