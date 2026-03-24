import type { Metadata } from 'next';
import Profile from '@/pages/Profile';

export const metadata: Metadata = {
  title: 'My Profile | Raj Luxmi Sweets',
  description: 'View and manage your account details and past orders.',
};

export default function ProfilePage() {
  return <Profile />;
}
