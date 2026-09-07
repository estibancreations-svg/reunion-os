import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://reunion.family';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/admin', '/user', '/api'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
