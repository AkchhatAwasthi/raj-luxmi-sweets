import type { Metadata } from 'next';
import BulkOrderClient from '@/app-pages/BulkOrderClient';

export const metadata: Metadata = {
  title: 'Bulk Orders & Royal Bespoke Gifting | Raj Luxmi Sweets',
  description: 'Handcrafted luxury sweet boxes, festive hampers & bespoke corporate gifting for weddings, celebrations and corporate events across India. Order directly on WhatsApp.',
};

export default function CelebratePage() {
  return <BulkOrderClient />;
}
