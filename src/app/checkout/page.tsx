'use client';

import dynamic from 'next/dynamic';

const Checkout = dynamic(() => import('@/app-pages/Checkout'), { ssr: false });

export default function CheckoutPage() {
  return <Checkout />;
}
