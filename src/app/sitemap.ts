import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

// /sitemap.xml — served by Next.js as the main sitemap entry point.
//
// Structure (mirrors the sitemap index pattern):
//   /sitemap.xml         ← this file (all URLs combined, entry point for Google)
//   /sitemap/pages.xml   ← pages only  (via generateSitemaps in child route)
//   /sitemap/products.xml ← products   (via generateSitemaps in child route)
//   /sitemap/categories.xml ← cats     (via generateSitemaps in child route)
//
// Next.js 16 does not auto-generate a <sitemapindex> from generateSitemaps
// in the root sitemap.ts, so we return all URLs here so /sitemap.xml works.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/celebrate-with-rajluxmi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const supabase = await createClient();

    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products').select('sku, id, updated_at').eq('is_active', true) as any,
      supabase.from('categories').select('slug, updated_at').eq('is_active', true).not('slug', 'is', null) as any,
    ]);

    const productPages: MetadataRoute.Sitemap = (products ?? []).map((p: any) => ({
      url: `${BASE_URL}/product/${p.sku || p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = (categories ?? [])
      .filter((c: any) => c.slug)
      .map((c: any) => ({
        url: `${BASE_URL}/category/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
