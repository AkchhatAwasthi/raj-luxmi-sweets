'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Products = dynamic(() => import('@/app-pages/Products'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
      <div className="w-12 h-12 border-4 border-[#E6D5B8] border-t-[#8B2131] rounded-full animate-spin" />
    </div>
  ),
});

interface Props {
  forcedCategoryId?: string;
  forcedCategoryName?: string;
  forcedCategoryDescription?: string;
}

export default function ProductsClient({
  forcedCategoryId,
  forcedCategoryName,
  forcedCategoryDescription,
}: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="w-12 h-12 border-4 border-[#E6D5B8] border-t-[#8B2131] rounded-full animate-spin" />
        </div>
      }
    >
      <Products
        forcedCategoryId={forcedCategoryId}
        forcedCategoryName={forcedCategoryName}
        forcedCategoryDescription={forcedCategoryDescription}
      />
    </Suspense>
  );
}
