import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'PDR Connect — The Platform for PDR Professionals',
  description:
    'Join 1000+ PDR technicians, car painters, preparers and dismantlers from 48+ countries. Free to join — find jobs or hire specialists worldwide on PDR Connect.',
  openGraph: {
    title: 'PDR Connect — The Platform for PDR Professionals',
    description:
      'Join 1000+ PDR technicians from 48+ countries. Free to join — find jobs or hire specialists worldwide.',
    url: '/',
    images: [{ url: 'https://pdrconnect.eu/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDR Connect — The Platform for PDR Professionals',
    description: '1000+ PDR technicians, 48+ countries, free to join.',
    images: ['https://pdrconnect.eu/og-image.png'],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
