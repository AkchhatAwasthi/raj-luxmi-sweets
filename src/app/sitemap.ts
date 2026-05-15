import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
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

  // Dynamic category pages
  try {
    const supabase = await createClient();
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, name, updated_at')
      .eq('is_active', true)
      .not('slug', 'is', null) as any;

    const categoryPages: MetadataRoute.Sitemap = (categories ?? [])
      .filter((c: any) => c.slug)
      .map((c: any) => ({
        url: `${BASE_URL}/category/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticPages, ...categoryPages];
  } catch {
    // Fallback: return only static pages if DB is unavailable
    return staticPages;
  }
}

