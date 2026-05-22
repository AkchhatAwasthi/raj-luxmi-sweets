import { NextResponse } from 'next/server';

// Force dynamic rendering — prevent static prerendering of this route.
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rajluxmisweets.com';

/**
 * GET /sitemap.xml — Sitemap Index
 *
 * Returns a <sitemapindex> that lists three sub-sitemaps:
 *   /sitemap-pages.xml      → static pages
 *   /sitemap-products.xml   → individual product pages
 *   /sitemap-categories.xml → category pages
 */
export async function GET() {
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-products.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
