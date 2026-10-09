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
  metadataBase: new URL('https://rajluxmisweets.com'),
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

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'Bakery',
  name: 'Rajluxmi Sweets',
  alternateName: 'Raj Luxmi The Mithai Shop',
  image: 'https://rajluxmisweets.com/logo.png',
  url: 'https://rajluxmisweets.com',
  telephone: '+91 9996616153',
  email: 'contact@rajluxmisweets.com',
  priceRange: '₹₹',
  servesCuisine: ['Bengali Sweets', 'Traditional Indian Mithai', 'Pure Desi Ghee Sweets', 'Namkeen'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Brej Palace, Near Ashiyana Power House Chauraha, Aashiyana',
    addressLocality: 'Lucknow',
    addressRegion: 'Uttar Pradesh',
    postalCode: '226012',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '26.7924',
    longitude: '80.9125',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
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
