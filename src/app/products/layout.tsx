import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products | Raj Luxmi Sweets',
  description:
    'Browse our full collection of premium Indian sweets, namkeens, mithai and festive specials.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
