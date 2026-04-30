import type { Metadata } from 'next';
import Script from 'next/script';
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
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Raj Luxmi Sweets | Premium Indian Sweets & Namkeens',
    description: 'Order premium quality Indian sweets, namkeens and festive specials.',
    type: 'website',
    locale: 'en_IN',
  },
  verification: {
    google: '2VHWcOtRj_HHEQtcdnHOfoi9-OWUZcC3dp_2l3yX-dU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VEENV6ZQVP" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-VEENV6ZQVP');
          `}
        </Script>
      </head>
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
