'use client';

import dynamic from 'next/dynamic';

const Products = dynamic(() => import('@/app-pages/Products'), { ssr: false });

export default function ProductsPage() {
  return <Products />;
}
