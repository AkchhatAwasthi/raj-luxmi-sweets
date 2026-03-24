import type { Metadata } from 'next';
import Checkout from '@/pages/Checkout';

export const metadata: Metadata = {
  title: 'Checkout | Raj Luxmi Sweets',
  description: 'Complete your order securely.',
};

export default function CheckoutPage() {
  return <Checkout />;
}
