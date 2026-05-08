import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://rajluxmisweets.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('sku, id, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  return (products || []).map((product) => ({
    url: `${BASE_URL}/product/${product.sku || product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
