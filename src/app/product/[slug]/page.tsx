import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://rajluxmi.com';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();

  let { data: product } = await supabase
    .from('products')
    .select('name, description, images, meta_title, meta_description, meta_keywords')
    .eq('sku', slug)
    .single() as any;

  if (!product) {
    const { data: byId } = await supabase
      .from('products')
      .select('name, description, images, meta_title, meta_description, meta_keywords')
      .eq('id', slug)
      .single() as any;
    product = byId;
  }

  if (product) {
    // Use custom SEO fields if set, otherwise auto-generate from product data
    const title = (product as any).meta_title || `${product.name} | Raj Luxmi Sweets`;
    const description =
      (product as any).meta_description ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at Raj Luxmi Sweets.`;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/logo.png';
    const keywords = (product as any).meta_keywords || undefined;

    return {
      title,
      description,
      ...(keywords && {
        keywords,
      }),
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
      },
    };
  }

  return {
    title: 'Product Not Found | Raj Luxmi Sweets',
  };
}

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();

  // Try by SKU first (preferred), fall back to ID
  let { data: product } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('sku', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    const { data: byId } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', slug)
      .eq('is_active', true)
      .single();
    product = byId;
  }

  // Product not found — render 404
  if (!product) {
    notFound();
  }

  // --- JSON-LD Product Schema ---
  // Tells Google the price, availability, image, and brand so it can show
  // rich results (price badge, in-stock label) directly in search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} at Raj Luxmi Sweets.`,
    image: product.images && product.images.length > 0 ? product.images : [`${BASE_URL}/logo.png`],
    sku: product.sku || product.id,
    url: `${BASE_URL}/product/${product.sku || product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Raj Luxmi Sweets',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      ...(product.original_price && product.original_price > product.price
        ? { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        : {}),
      availability:
        (product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Raj Luxmi Sweets',
      },
      url: `${BASE_URL}/product/${product.sku || product.id}`,
    },
    ...(product.categories?.name && {
      category: product.categories.name,
    }),
  };

  return (
    <>
      {/* JSON-LD: Injected server-side — Google reads this for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}

