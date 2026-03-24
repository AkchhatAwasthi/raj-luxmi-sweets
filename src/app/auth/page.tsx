import type { Metadata } from 'next';
import Auth from '@/app-pages/Auth';

export const metadata: Metadata = {
  title: 'Sign In | Raj Luxmi Sweets',
  description: 'Sign in or create an account to place your order.',
};

export default function AuthPage() {
  return <Auth />;
}
