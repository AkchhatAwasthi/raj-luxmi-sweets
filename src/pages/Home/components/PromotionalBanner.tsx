// @ts-nocheck

'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/2.png';

const PromotionalBanner = () => {
  const router = useRouter();

  return (
    <section
      className="w-full relative overflow-hidden cursor-pointer group"
      onClick={() => router.push('/products')}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="relative w-full overflow-hidden">
          <img
            src={heroImage.src}
            alt="Exclusive Collection"
            className="w-full h-auto object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Subtle overlay for premium feel on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
        </div>
      </motion.div>
    </section>
  );
};

export default PromotionalBanner;
