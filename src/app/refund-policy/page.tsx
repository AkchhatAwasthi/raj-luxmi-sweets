import type { Metadata } from 'next';
import RefundPolicy from '@/app-pages/RefundPolicy';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Raj Luxmi Sweets',
  description:
    'Our transparent cancellation, replacement, and refund policy for orders placed at Raj Luxmi Sweets.',
  alternates: {
    canonical: 'https://rajluxmisweets.com/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicy />;
}
