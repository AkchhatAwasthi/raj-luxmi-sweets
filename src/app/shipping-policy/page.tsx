import type { Metadata } from 'next';
import ShippingPolicy from '@/app-pages/ShippingPolicy';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Raj Luxmi Sweets',
  description:
    'Information about local Lucknow express delivery, pan-India courier shipping, packaging standards and transit times for Raj Luxmi Sweets.',
  alternates: {
    canonical: 'https://rajluxmisweets.com/shipping-policy',
  },
};

export default function ShippingPolicyPage() {
  return <ShippingPolicy />;
}
