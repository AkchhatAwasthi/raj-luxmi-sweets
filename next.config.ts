import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Image optimization re-enabled (was previously disabled with unoptimized: true).
    // @netlify/plugin-nextjs v5 (already installed) handles image optimization on Netlify.
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
    ],
  },
  // Required for nodemailer in API routes
  serverExternalPackages: ['nodemailer'],
  // Transpile packages that might have issues with Turbopack/Next.js SSR
  transpilePackages: ['framer-motion', 'lucide-react', 'recharts'],
};

export default nextConfig;
