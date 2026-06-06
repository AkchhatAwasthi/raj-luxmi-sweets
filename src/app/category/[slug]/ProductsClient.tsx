'use client';

'use client';

import Products from '@/app-pages/Products';

interface Props {
  forcedCategoryId?: string;
  forcedCategoryName?: string;
}

export default function ProductsClient({ forcedCategoryId, forcedCategoryName }: Props) {
  return <Products forcedCategoryId={forcedCategoryId} forcedCategoryName={forcedCategoryName} />;
}
