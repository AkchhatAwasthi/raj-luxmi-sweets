import { NextResponse } from 'next/server';

// NOTE: This file has no effect — Next.js special metadata files (sitemap.ts)
// always take priority over route handlers at the same path (/sitemap.xml).
// The real sitemap is served by src/app/sitemap.ts.
// This default export exists only to satisfy the Turbopack build requirement.
export async function GET() {
  return new NextResponse(null, { status: 404 });
}
