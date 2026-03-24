import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jifilpkqppcxwinymqic.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Required for nodemailer in API routes
  serverExternalPackages: ['nodemailer'],
  // Transpile packages that might have issues with Turbopack/Next.js SSR
  transpilePackages: ['framer-motion', 'lucide-react', 'recharts'],
};

export default nextConfig;
