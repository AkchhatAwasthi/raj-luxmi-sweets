import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rajluxmisweets.com';

// GET /sitemap-pages.xml
// Returns a urlset sitemap containing all static pages.
export async function GET() {
  const pages = [
    { url: BASE_URL, changefreq: 'daily', priority: '1.0' },
    { url: `${BASE_URL}/products`, changefreq: 'daily', priority: '0.9' },
    { url: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.6' },
    { url: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.6' },
    { url: `${BASE_URL}/celebrate-with-rajluxmi`, changefreq: 'monthly', priority: '0.7' },
  ];

  const now = new Date().toISOString();

  const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(urlset, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
