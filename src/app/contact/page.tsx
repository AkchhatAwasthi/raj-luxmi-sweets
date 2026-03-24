import type { Metadata } from 'next';
import Contact from '@/pages/Contact';

export const metadata: Metadata = {
  title: 'Contact Us | Raj Luxmi Sweets',
  description:
    'Get in touch with Raj Luxmi for orders, queries or feedback. We are happy to help!',
};

export default function ContactPage() {
  return <Contact />;
}
