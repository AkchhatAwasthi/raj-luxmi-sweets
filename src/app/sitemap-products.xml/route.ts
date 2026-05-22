import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rajluxmisweets.com';

// GET /sitemap-products.xml
// Returns a urlset sitemap containing all active product pages.
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: products } = await supabase
      .from('products')
      .select('sku, id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    const entries = (products ?? [])
      .map((product: any) => {
        const lastmod = product.updated_at
          ? new Date(product.updated_at).toISOString()
          : new Date().toISOString();
        const slug = product.sku || product.id;
        return `  <url>
    <loc>${BASE_URL}/product/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

    return new NextResponse(urlset, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    // Return an empty urlset on error so crawlers don't get a hard failure.
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
    });
  }
}
