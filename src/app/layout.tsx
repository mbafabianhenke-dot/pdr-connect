import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import LanguageProvider from '@/components/LanguageProvider';
import SessionGuard from '@/components/SessionGuard';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'PDR Connect — The Platform for PDR Professionals',
    template: '%s | PDR Connect',
  },
  description:
    'Connect with 1000+ PDR technicians, car painters, preparers and dismantlers across 48+ countries. Free to join. Find work or hire specialists worldwide.',
  keywords: [
    'PDR technician', 'paintless dent repair', 'car painter', 'preparer',
    'dismantler', 'PDR jobs', 'auto body', 'dent removal', 'PDR platform',
    'PDR Connect', 'pdrconnect', 'PDR international',
  ],
  authors: [{ name: 'PDR Connect', url: APP_URL }],
  creator: 'PDR Connect',
  publisher: 'PDR Connect',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'PDR Connect',
    title: 'PDR Connect — The Platform for PDR Professionals',
    description:
      'Connect with 1000+ PDR technicians, car painters, preparers and dismantlers across 48+ countries. Free to join.',
    images: [
      {
        url: 'https://pdrconnect.eu/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDR Connect — The Platform for PDR Professionals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDR Connect — The Platform for PDR Professionals',
    description:
      'Connect with 1000+ PDR technicians across 48+ countries. Free to join.',
    images: ['https://pdrconnect.eu/og-image.png'],
    creator: '@pdrconnect',
  },
  alternates: {
    canonical: APP_URL,
  },
  // Explicitly output og:type (Next.js sometimes omits it) + fb:app_id
  other: {
    'og:type': 'website',
    'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionGuard />
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', background: '#1e293b', color: '#fff' },
          }}
        />
      </body>
    </html>
  );
}
