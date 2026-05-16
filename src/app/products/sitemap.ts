import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

// This file lives at src/app/products/sitemap.ts
// Next.js serves it at /products/sitemap.xml and automatically
// references it from the top-level sitemap index at /sitemap.xml

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
