import type { Metadata } from 'next';
import PrivacyPolicy from '@/app-pages/PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Raj Luxmi Sweets',
  description:
    'Learn how Raj Luxmi Sweets protects your privacy and secures your personal and payment data.',
  alternates: {
    canonical: 'https://rajluxmisweets.com/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
