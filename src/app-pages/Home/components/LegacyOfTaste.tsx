'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
const IMAGE_1 =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759050/WhatsApp_Image_2026-09-07_at_10.34.21_AM_bmty5d.jpg';
const IMAGE_2 =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759051/WhatsApp_Image_2026-09-07_at_10.56.07_AM_dskzaj.jpg';

const LegacyOfTaste = () => {
  return (
    <section className="py-10 md:py-16 bg-[#FAF9F6] relative overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 2 Vertical Images Side-by-Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4"
          >
            {/* Image 1 */}
            <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-[#EADBCE]/80 group">
              <Image
                src={IMAGE_1}
                alt="Rajluxmi Sweets artisanal tradition"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Image 2 */}
            <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-[#EADBCE]/80 group">
              <Image
                src={IMAGE_2}
                alt="Rajluxmi Sweets legacy of taste"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Right Column: Story & Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4 sm:space-y-5"
          >
            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#B38B46] font-medium font-orange-avenue block mb-1">
                Heritage Craftsmanship Story
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] text-[#2C1810] font-orange-avenue font-normal tracking-wide leading-tight">
                Our Legacy of Taste
              </h2>
              <p className="text-xs sm:text-sm font-orange-avenue text-[#783838] tracking-wider uppercase mt-1">
                A Taste That Feels Like Home • Sweetness made for every occasion
              </p>
              <div className="w-10 h-0.5 bg-[#B38B46]/40 mt-3" />
            </div>

            <div className="space-y-3.5 text-xs sm:text-[13px] md:text-sm text-[#5D4037]/90 font-light leading-relaxed">
              <p>
                At Rajluxmi Sweets, we bring together the flavours that have been loved for generations. From rich desi ghee laddoos and traditional barfis to indulgent kaju sweets, every mithai is prepared with care and a focus on the taste our customers know and love.
              </p>
              <p>
                Because for us, sweets are not just food — they are a part of celebrations, family moments, festivals, and everyday joys. Whether it’s a box shared with loved ones, a gift for someone special, or simply a sweet treat at the end of the day, Rajluxmi is made to be a part of those moments. Good sweets bring people together, and that is what we have always wanted our mithai to do.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LegacyOfTaste;
