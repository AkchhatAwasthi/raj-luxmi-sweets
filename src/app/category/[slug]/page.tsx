import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const BASE_URL = 'https://rajluxmisweets.com';

// Client component that renders the products grid with the category pre-selected
const Products = dynamic(() => import('@/app-pages/Products'), { ssr: false });

type Props = {
  params: Promise<{ slug: string }>;
};

// ---------------------------------------------------------------------------
// Helper: fetch a category by slug or (fallback) by name for legacy URLs
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
  const category = await fetchCategory(params.slug);

  if (!category) {
    notFound();
  }

  // ---------------------------------------------------
  // JSON-LD: BreadcrumbList + ItemList (category page)
  // Tells Google about the hierarchy and the products
  // so it can show category-level rich results.
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

      {/* Render the same Products component with the category pre-filtered */}
      <Products />
    </>
  );
}
