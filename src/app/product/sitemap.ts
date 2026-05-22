import { MetadataRoute } from 'next';

// Products are indexed via /sitemap-products.xml (a dedicated route handler).
// This stub is required to satisfy Next.js/Turbopack which expects a default
// export from every sitemap.ts file it discovers inside the app directory.
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
