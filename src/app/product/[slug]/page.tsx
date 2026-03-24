'use client';

import dynamic from 'next/dynamic';

const ProductDetail = dynamic(() => import('@/app-pages/ProductDetail'), { ssr: false });

export default function ProductDetailPage() {
  return <ProductDetail />;
}
