'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const DIWALI_CATALOGUE_URL =
  'https://drive.google.com/file/d/1cabybdl6c3TVbjy96MNJzIkvNEf4s-lR/view?usp=sharing';

const FloatingCatalogueButton: React.FC = () => {
  return (
    <aside
      aria-label="Diwali '26 Catalogue Quick Order"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 select-none pointer-events-auto"
    >
      <motion.a
        href={DIWALI_CATALOGUE_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.85, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center justify-end cursor-pointer drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        aria-label="Order from Rajluxmi - View Diwali '26 Catalogue"
      >
        {/* ========================================================================= */}
        {/* 1. LEFT ATTACHED PILL TAG: "Diwali '26 Catalogue ✦"                      */}
        {/* ========================================================================= */}
        <div className="relative -mr-2 z-10 flex items-center">
          <div className="px-2.5 sm:px-3 py-1 rounded-full bg-[#1C0E0A] border border-[#B38B46]/80 text-[#FFF6E9] shadow-md flex items-center space-x-1 group-hover:border-[#E5B56E] transition-colors">
            <span className="text-[9.5px] sm:text-[10.5px] font-orange-avenue font-normal tracking-wide whitespace-nowrap text-[#F7E7CE]">
              Diwali &apos;26 Catalogue
            </span>
            <span className="text-[#E5B56E] text-[10px]">✦</span>
          </div>
          {/* Subtle triangle arrow pointing into medallion */}
          <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[5px] border-l-[#B38B46]/80 -ml-[1px]" />
        </div>

        {/* ========================================================================= */}
        {/* 2. CIRCULAR MEDALLION BADGE: "This Diwali GIFT — ✦ — RAJLUXMI"            */}
        {/* ========================================================================= */}
        <div className="relative w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#997334] via-[#F2D08A] to-[#8C6228] shadow-[0_6px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_26px_rgba(229,181,110,0.5)] transition-shadow flex-shrink-0">
          {/* Outer concentric subtle aura ring */}
          <div className="absolute -inset-1 rounded-full border border-[#E5B56E]/30 pointer-events-none group-hover:scale-105 transition-transform" />

          {/* Inner Medallion Disk */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4D1510] via-[#350F0B] to-[#200806] flex flex-col items-center justify-center p-1.5 text-center border border-[#E5B56E]/40 shadow-inner overflow-hidden relative">
            {/* Subtle radial gloss overlay */}
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

            {/* "This" script */}
            <span className="text-[8px] sm:text-[9px] text-[#FFE8C2] font-orange-avenue uppercase tracking-wider leading-none">
              This
            </span>

            {/* "Diwali" */}
            <span className="text-[9px] sm:text-[10px] font-orange-avenue text-white uppercase tracking-wider leading-tight mt-0.5">
              Diwali
            </span>

            {/* "GIFT" */}
            <span className="text-[9px] sm:text-[10px] font-orange-avenue text-[#FFE8C2] font-semibold uppercase tracking-[0.16em] leading-tight">
              GIFT
            </span>

            {/* Decorative divider with ornament */}
            <div className="flex items-center space-x-1 w-6 sm:w-7 my-0.5">
              <span className="h-[0.5px] flex-1 bg-[#E5B56E]/60" />
              <span className="text-[5px] text-[#E5B56E] leading-none">✦</span>
              <span className="h-[0.5px] flex-1 bg-[#E5B56E]/60" />
            </div>

            {/* Brand Name: "RAJLUXMI" */}
            <span className="text-[7.5px] sm:text-[8.5px] font-orange-avenue font-bold uppercase tracking-[0.18em] text-[#E5B56E] leading-none">
              RAJLUXMI
            </span>
          </div>
        </div>
      </motion.a>
    </aside>
  );
};

export default FloatingCatalogueButton;
