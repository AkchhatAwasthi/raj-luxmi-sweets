import type { Metadata } from 'next';
import TermsOfService from '@/app-pages/TermsOfService';

export const metadata: Metadata = {
  title: 'Terms of Service | Raj Luxmi Sweets',
  description:
    'Read the terms of service, ordering policies, and conditions for purchasing from Raj Luxmi Sweets.',
  alternates: {
    canonical: 'https://rajluxmisweets.com/terms',
  },
};

export default function TermsPage() {
  return <TermsOfService />;
}
