import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Only allow pages that are publicly accessible WITHOUT a login redirect.
        // Every URL listed here must also be in PUBLIC_PATHS in middleware.ts.
        allow: [
          '/',
          '/register',
          '/login',
          '/privacy',
          '/terms',
          '/legal',
          '/blog',
          '/blog/',
        ],
        disallow: [
          // Protected dashboard routes
          '/dashboard',
          '/profile',
          '/search',
          '/messages',
          '/documents',
          '/contracts',
          '/offers',
          '/requests',
          '/premium',
          '/admin',
          // Onboarding/auth flows — not useful for SEO
          '/onboarding',
          '/pending-approval',
          '/sign-legal',
          '/reset-password',
          // API routes
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
