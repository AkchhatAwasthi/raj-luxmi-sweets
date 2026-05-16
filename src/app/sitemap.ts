import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

// generateSitemaps tells Next.js to create 3 separate child sitemaps.
// Next.js then AUTOMATICALLY generates a sitemap index at /sitemap.xml
// that links to:
//   /sitemap/pages.xml
//   /sitemap/products.xml
//   /sitemap/categories.xml
export async function generateSitemaps() {
  return [
    { id: 'pages' },
    { id: 'products' },
    { id: 'categories' },
  ];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;

  // ─── Main Pages ──────────────────────────────────────────────────────────
  if (id === 'pages') {
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${BASE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/celebrate-with-rajluxmi`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];
  }

  // ─── Products ─────────────────────────────────────────────────────────────
  if (id === 'products') {
    try {
      const supabase = await createClient();
      const { data: products } = await supabase
        .from('products')
        .select('sku, id, updated_at')
        .eq('is_active', true) as any;

      return (products ?? []).map((p: any) => ({
        url: `${BASE_URL}/product/${p.sku || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch {
      return [];
    }
  }

  // ─── Categories ───────────────────────────────────────────────────────────
  if (id === 'categories') {
    try {
      const supabase = await createClient();
      const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)
        .not('slug', 'is', null) as any;

      return (categories ?? [])
        .filter((c: any) => c.slug)
        .map((c: any) => ({
          url: `${BASE_URL}/category/${c.slug}`,
          lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    } catch {
      return [];
    }
  }

  return [];
}
