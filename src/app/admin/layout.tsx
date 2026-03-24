'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/app-pages/admin/AdminLayout';
import { PageLoader } from '@/components/LoadingSpinner';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) return <PageLoader text="Verifying admin access..." />;
  if (!isAdmin) return null;

  return <AdminLayout>{children}</AdminLayout>;
}
