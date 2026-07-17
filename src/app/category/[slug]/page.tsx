import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductsClient from './ProductsClient';

const BASE_URL = 'https://rajluxmisweets.com';

// ---------------------------------------------------------------------------
// ISR: Revalidate cached pages once per hour.
// Category/product data is relatively stable — this means the first request
// after each hour hits Supabase, but all subsequent requests within the hour
// are served from Netlify's CDN edge with near-zero TTFB and no cold starts.
// ---------------------------------------------------------------------------
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

// ---------------------------------------------------------------------------
// generateStaticParams — pre-renders top category pages at build time.
// These are served as static files from CDN with zero TTFB on first hit.
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('categories')
      .select('slug, name')
      .eq('is_active', true);

    if (!data) return [];

    // Build params for both slug and name-based routes
    return data
      .filter((c: any) => c.slug) // only categories with a slug column value
      .map((c: any) => ({ slug: c.slug }));
  } catch {
    // If Supabase is unavailable at build time, skip pre-rendering
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helper: fetch a category by slug or (fallback) by name for legacy URLs.
// The two Supabase calls are sequential by necessity (the second is only
// triggered if the first returns nothing), but this is unavoidable for the
// fallback pattern.
// ---------------------------------------------------------------------------
async function fetchCategory(slug: string) {
  const supabase = await createClient();

  // 1. Try slug column (primary lookup)
  let { data: category } = await supabase
    .from('categories')
    .select('id, name, description, image_url, meta_title, meta_description, meta_keywords, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .single() as any;

  // 2. Fall back to name match so old ?category= links still resolve
  if (!category) {
    const { data: byName } = await supabase
      .from('categories')
      .select('id, name, description, image_url, meta_title, meta_description, meta_keywords, slug')
      .ilike('name', slug.replace(/-/g, ' '))
      .eq('is_active', true)
      .single() as any;
    category = byName;
  }

  return category ?? null;
}

// ---------------------------------------------------------------------------
// generateMetadata — runs server-side, injected into <head>
// ---------------------------------------------------------------------------
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const category = await fetchCategory(params.slug);

  if (!category) {
    return { title: 'Category Not Found | Raj Luxmi Sweets' };
  }

  const title =
    (category as any).meta_title ||
    `${category.name} | Buy ${category.name} Online | Raj Luxmi Sweets`;

  const description =
    (category as any).meta_description ||
    category.description?.substring(0, 160) ||
    `Shop the finest ${category.name} from Raj Luxmi Sweets — handcrafted Indian sweets delivered across Lucknow.`;

  const keywords = (category as any).meta_keywords || undefined;
  const imageUrl = category.image_url || `${BASE_URL}/logo.png`;
  const canonical = `${BASE_URL}/category/${category.slug || params.slug}`;

  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: imageUrl, alt: `${category.name} — Raj Luxmi Sweets` }],
      type: 'website',
      siteName: 'Raj Luxmi Sweets',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function CategoryPage(props: Props) {
  const params = await props.params;

  // Fetch category first (we need the ID to fetch products)
  const category = await fetchCategory(params.slug);
  if (!category) {
    notFound();
  }

  // ---------------------------------------------------
  // Fetch products for JSON-LD structured data.
  // This runs AFTER fetchCategory, but since we need the
  // category.id to query products it cannot be parallelised
  // with fetchCategory itself. However it is now a single
  // dedicated Supabase client call (no extra round-trips).
  // ---------------------------------------------------
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, images, price')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(20) as any;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${BASE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${BASE_URL}/category/${category.slug || params.slug}`,
      },
    ],
  };

  const itemListLd = products && products.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${category.name} — Raj Luxmi Sweets`,
        description:
          category.description ||
          `Shop ${category.name} from Raj Luxmi Sweets`,
        url: `${BASE_URL}/category/${category.slug || params.slug}`,
        numberOfItems: products.length,
        itemListElement: products.map((p: any, i: number) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/product/${p.sku || p.id}`,
          name: p.name,
          image:
            p.images && p.images.length > 0
              ? p.images[0]
              : `${BASE_URL}/logo.png`,
        })),
      }
    : null;

  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* JSON-LD: ItemList (products in this category) */}
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      {/* Render the Products component with the category id passed directly — no client-side guessing */}
      <ProductsClient forcedCategoryId={category.id} forcedCategoryName={category.name} />
    </>
  );
}
