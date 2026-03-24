'use client';

import dynamic from 'next/dynamic';

const Profile = dynamic(() => import('@/app-pages/Profile'), { ssr: false });

export default function ProfilePage() {
  return <Profile />;
}
