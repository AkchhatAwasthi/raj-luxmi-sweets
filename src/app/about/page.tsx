import type { Metadata } from 'next';
import About from '@/pages/About';

export const metadata: Metadata = {
  title: 'About Us | Raj Luxmi Sweets',
  description:
    'Learn the story behind Raj Luxmi — decades of crafting authentic Indian sweets with love and tradition.',
};

export default function AboutPage() {
  return <About />;
}
