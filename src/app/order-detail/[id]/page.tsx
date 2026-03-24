import type { Metadata } from 'next';
import UserOrderDetail from '@/pages/OrderDetail';

export const metadata: Metadata = {
  title: 'Order Details | Raj Luxmi Sweets',
  description: 'View details and status of your order.',
};

export default function OrderDetailPage() {
  return <UserOrderDetail />;
}
