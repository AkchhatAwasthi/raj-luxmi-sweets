import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | Raj Luxmi Sweets',
  description: 'View and manage your account details and past orders.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
