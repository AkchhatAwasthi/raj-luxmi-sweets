'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ProductDetail = dynamic(() => import('@/app-pages/ProductDetail'), { ssr: false });

export default function ProductDetailClient() {
  return <ProductDetail />;
}
