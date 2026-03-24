import type { Metadata } from 'next';
import Home from '@/pages/Index';

export const metadata: Metadata = {
  title: 'Raj Luxmi Sweets | Premium Indian Sweets & Namkeens',
  description:
    'Order premium Indian sweets, namkeens, mithai and festive specials from Raj Luxmi. Fresh, handcrafted, delivered to your door.',
};

export default function HomePage() {
  return <Home />;
}
