'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Gift, ShieldCheck } from 'lucide-react';

const trustItems = [
  {
    icon: Sparkles,
    title: "100% Pure Desi Ghee",
    subtitle: "Authentic taste & pure ingredients",
  },
  {
    icon: Clock,
    title: "Same Day Lucknow Delivery",
    subtitle: "Express dispatch to your doorstep",
  },
  {
    icon: Gift,
    title: "Luxury Bespoke Gifting",
    subtitle: "Custom hampers & foil boxes",
  },
  {
    icon: ShieldCheck,
    title: "Freshness Guaranteed",
    subtitle: "Aroma-lock tamper-proof seal",
  },
];

const TrustBar = () => {
  return (
    <section className="w-full bg-[#FAF9F6] border-y border-[#B38B46]/20 py-3 sm:py-4">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="flex items-center space-x-2.5 sm:space-x-3 px-2 py-1.5 rounded group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#B38B46]/30 flex items-center justify-center shrink-0 text-[#783838]">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#783838]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-orange-avenue font-normal text-[#2C1810] tracking-wider uppercase truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#783838]/70 font-light truncate">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
