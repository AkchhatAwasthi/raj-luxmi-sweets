import type { Metadata } from 'next';
import Products from '@/pages/Products';

export const metadata: Metadata = {
  title: 'Our Products | Raj Luxmi Sweets',
  description:
    'Browse our full collection of premium Indian sweets, namkeens, mithai and festive specials.',
};

export default function ProductsPage() {
  return <Products />;
}
