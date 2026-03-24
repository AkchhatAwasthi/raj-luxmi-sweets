import type { Metadata } from 'next';
import Cart from '@/pages/Cart';

export const metadata: Metadata = {
  title: 'Your Cart | Raj Luxmi Sweets',
  description: 'Review and manage your cart before placing your order.',
};

export default function CartPage() {
  return <Cart />;
}
