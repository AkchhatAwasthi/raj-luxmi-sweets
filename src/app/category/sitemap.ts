import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

// This file lives at src/app/category/sitemap.ts
// Next.js serves it at /category/sitemap.xml and automatically
// references it from the top-level sitemap index at /sitemap.xml

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
