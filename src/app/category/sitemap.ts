import { MetadataRoute } from 'next';

// Sitemap for categories is handled centrally in src/app/sitemap.ts
// via generateSitemaps(). This file must still export a default function
// to satisfy Next.js/Turbopack — it returns an empty array so it has
// no effect on the actual sitemap output.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
