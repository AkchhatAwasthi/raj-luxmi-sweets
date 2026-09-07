'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import weddingBannerImg from '@/assets/wedding_gifting_banner.jpg';

const CorporateWeddingGifting = () => {
  const router = useRouter();

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      "Hello Raj Luxmi Sweets team, I would like to enquire about Royal Wedding & Corporate Gifting hampers."
    );
    window.open(`https://wa.me/918448447408?text=${text}`, '_blank');
  };

  return (
    <section className="py-6 md:py-10 bg-[#FAF9F6]">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#4D1119] via-[#651A24] to-[#450D14] text-white border border-[#B38B46]/30 shadow-xl"
        >
          {/* Subtle Background Mandala Patterns */}
          <div className="absolute -left-12 -top-12 w-64 h-64 border border-[#B38B46]/15 rounded-full pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-52 h-52 border border-[#B38B46]/10 rounded-full pointer-events-none" />
          <div className="absolute right-1/2 -bottom-20 w-80 h-80 bg-[#B38B46]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[220px] md:min-h-[260px] lg:min-h-[290px]">
            {/* Left Content Column */}
            <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 lg:p-12 z-10 space-y-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-orange-avenue font-normal text-[#FAF9F6] tracking-wide leading-tight">
                Royal Wedding &amp; Corporate <br className="hidden sm:block" />
                Gifting — <span className="text-[#E6C687]">Celebrate with Elegance</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#E6D5B8]/90 font-light leading-relaxed max-w-lg">
                Personalised boxes for your celebrations, weddings &amp; corporate events with bespoke branding and custom sweet assortments.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="px-6 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-[#C69A4E] via-[#E2BA6F] to-[#C69A4E] hover:from-[#D4AA5E] hover:to-[#D4AA5E] text-[#2C1810] font-orange-avenue text-xs sm:text-sm uppercase tracking-wider font-medium rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Enquire Bulk Gifting
                </button>

                <button
                  onClick={() => router.push('/celebrate-with-rajluxmi')}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#E6C687]/40 hover:bg-white/10 text-[#FAF9F6] font-orange-avenue text-xs sm:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer"
                >
                  View Catalogue
                </button>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="lg:col-span-6 relative w-full h-[220px] sm:h-[280px] lg:h-full min-h-[240px] lg:min-h-[290px]">
              <Image
                src={weddingBannerImg}
                alt="Royal Wedding and Corporate Gifting"
                fill
                className="object-cover object-center lg:object-right"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Gradient edge blends image into maroon backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#4D1119] via-transparent to-transparent lg:w-1/3" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CorporateWeddingGifting;
