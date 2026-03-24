'use client';

import dynamic from 'next/dynamic';

const UserOrderDetail = dynamic(() => import('@/app-pages/OrderDetail'), { ssr: false });

export default function OrderDetailPage() {
  return <UserOrderDetail />;
}
