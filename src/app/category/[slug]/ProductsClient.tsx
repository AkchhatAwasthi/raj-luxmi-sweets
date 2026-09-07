'use client';

'use client';

import Products from '@/app-pages/Products';

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
    <Products
      forcedCategoryId={forcedCategoryId}
      forcedCategoryName={forcedCategoryName}
      forcedCategoryDescription={forcedCategoryDescription}
    />
  );
}
