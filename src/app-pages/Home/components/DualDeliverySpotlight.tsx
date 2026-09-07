'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Plane, ShieldCheck, MapPin } from 'lucide-react';

const SAME_DAY_DELIVERY_IMG =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759519/ChatGPT_Image_Sep_7_2026_11_08_15_AM_lmhgob.png';
const PAN_INDIA_DELIVERY_IMG =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759519/ChatGPT_Image_Sep_7_2026_11_06_47_AM_ylkfg5.png';

const DualDeliverySpotlight = () => {
  return (
    <section className="py-8 md:py-14 bg-[#FAF9F6]">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center mb-6 md:mb-10 text-center space-y-1">
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#B38B46] font-medium font-orange-avenue">
            Delivery Network
          </span>
          <h2 className="text-base sm:text-lg md:text-xl text-[#2C1810] font-orange-avenue font-normal tracking-wide">
            How We Deliver Freshness
          </h2>
          <div className="w-8 h-0.5 bg-[#B38B46]/30 mt-1"></div>
        </div>

        {/* 2-Card Dual Grid with Rich Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Same Day Lucknow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 min-h-[300px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-8 border border-[#B38B46]/25"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={SAME_DAY_DELIVERY_IMG}
                alt="Same Day Delivery in Lucknow"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Luxury Gradient Overlay for crisp readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C0D08]/90 via-[#1C0D08]/50 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF9F6]/20 backdrop-blur-md text-[#FAF9F6] text-[9.5px] font-orange-avenue uppercase tracking-wider border border-white/20">
                  <Clock className="w-3 h-3 text-[#E6C687]" />
                  <span>2–4 Hours in Lucknow</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#E6C687] font-orange-avenue">

                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-orange-avenue font-normal text-[#FAF9F6] tracking-wide">
                  Same-Day Delivery in Lucknow
                </h3>
                <p className="text-xs sm:text-[13px] text-[#E6D5B8] font-light mt-1 leading-relaxed max-w-md">
                  Freshly made delicacies dispatched straight from our Aashiyana kitchen to your doorstep within hours via store dispatch, Swiggy &amp; Zomato.
                </p>
              </div>

              <div className="pt-1 flex items-center space-x-1.5 text-[10.5px] text-[#E6D5B8] font-orange-avenue">
                <MapPin className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>Dispatched from Aashiyana Store</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Pan-India Express */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 min-h-[300px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-8 border border-[#B38B46]/25"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={PAN_INDIA_DELIVERY_IMG}
                alt="Pan-India Express Shipping"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C0D08]/90 via-[#1C0D08]/50 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF9F6]/20 backdrop-blur-md text-[#FAF9F6] text-[9.5px] font-orange-avenue uppercase tracking-wider border border-white/20">
                  <Plane className="w-3 h-3 text-[#E6C687]" />
                  <span>5–6 Days Pan-India</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#E6C687] font-orange-avenue">

                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-orange-avenue font-normal text-[#FAF9F6] tracking-wide">
                  Pan-India Express Shipping
                </h3>
                <p className="text-xs sm:text-[13px] text-[#E6D5B8] font-light mt-1 leading-relaxed max-w-md">
                  Delivering across India via air express logistics. Sealed in Aroma-Lock protective packaging so each sweet arrives just as fresh as from our kitchen.
                </p>
              </div>

              <div className="pt-1 flex items-center space-x-1.5 text-[10.5px] text-[#E6D5B8] font-orange-avenue">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E6C687]" />
                <span>Vacuum Sealed &amp; Aroma-Lock Fresh</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualDeliverySpotlight;
