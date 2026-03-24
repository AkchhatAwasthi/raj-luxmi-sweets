import type { Metadata } from 'next';
import ProductDetail from '@/pages/ProductDetail';

// Dynamic metadata per product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Slug is formatted as "product-name" — convert for display
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${name} | Raj Luxmi Sweets`,
    description: `Buy authentic ${name} online from Raj Luxmi — handcrafted, fresh, delivered to your door.`,
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
