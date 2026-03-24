import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Details | Raj Luxmi Sweets',
  description: 'View details and status of your order.',
};

export default function OrderDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
