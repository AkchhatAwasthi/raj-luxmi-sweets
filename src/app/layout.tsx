import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Raj Luxmi Sweets | Premium Indian Sweets & Namkeens',
  description:
    'Order premium quality Indian sweets, namkeens, mithai and festive specials from Raj Luxmi. Fresh, handcrafted, delivered to your door.',
  keywords: 'Indian sweets, mithai, namkeen, Raj Luxmi, festive sweets, online sweet shop',
  openGraph: {
    title: 'Raj Luxmi Sweets | Premium Indian Sweets & Namkeens',
    description: 'Order premium quality Indian sweets, namkeens and festive specials.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main>{children}</main>
            <Footer />
            <CartSidebar />
            <FloatingWhatsApp />
            <Toaster />
            <Sonner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
