import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/server';

const ProductDetail = dynamic(() => import('@/app-pages/ProductDetail'), { ssr: false });

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const supabase = await createClient();

  let { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('sku', slug)
    .single();

  if (!product) {
    const { data: byId } = await supabase
      .from('products')
      .select('name, description, images')
      .eq('id', slug)
      .single();
    product = byId;
  }

  if (product) {
    const title = `${product.name} | Raj Luxmi Sweets`;
    const description = product.description?.substring(0, 160) || `Buy ${product.name} at Raj Luxmi Sweets.`;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/logo.png';
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
      }
    };
  }

  return {
    title: 'Product Not Found | Raj Luxmi Sweets',
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
