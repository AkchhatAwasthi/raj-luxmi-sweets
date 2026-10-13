import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // unoptimized: true is required on this Netlify deployment.
    // Without it, Next.js routes all <Image> srcs through /_next/image proxy
    // which returns 502/400 errors on Netlify's standard tier.
    // NOTE: Cloudinary images already self-optimize via f_auto,q_auto in their URLs.
    // To enable proper Next.js image optimization on Netlify, you would need to
    // configure Netlify Large Media or use a paid image CDN add-on.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jifilpkqppcxwinymqic.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  // Required for nodemailer in API routes
  serverExternalPackages: ['nodemailer'],
  // Transpile packages that might have issues with Turbopack/Next.js SSR
  transpilePackages: ['framer-motion', 'lucide-react', 'recharts'],
  async redirects() {
    return [
      {
        source: '/category/diwali-special',
        destination: '/category/diwali-specials',
        permanent: true,
      },
      {
        source: '/category/baklava',
        destination: '/category/mewa-bites-baklava',
        permanent: true,
      },
      {
        source: '/category/baklawa',
        destination: '/category/mewa-bites-baklava',
        permanent: true,
      },
      {
        source: '/category/balva-box',
        destination: '/category/mewa-bites-baklava',
        permanent: true,
      },
      {
        source: '/category/baklava-box',
        destination: '/category/mewa-bites-baklava',
        permanent: true,
      },
      {
        source: '/category/baklawa-box',
        destination: '/category/mewa-bites-baklava',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
