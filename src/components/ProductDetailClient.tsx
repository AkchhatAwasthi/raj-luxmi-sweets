'use client';

import ProductDetail from '@/app-pages/ProductDetail';

interface Props {
  product: any;
}

export default function ProductDetailClient({ product }: Props) {
  return <ProductDetail product={product} />;
}
