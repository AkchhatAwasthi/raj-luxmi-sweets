'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ArrowRight } from 'lucide-react';

// Official graphic images provided by user with text already integrated
const DESKTOP_HERO_IMAGE =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791805384/rajluxmi_hero_1920x1080_ywwcl2.png';

const MOBILE_HERO_IMAGE =
  'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791809119/Rajluxmi_Diwali_Gift_Exchange_md8ite.png';

const DiwaliHeroSection: React.FC = () => {
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCloseModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsFilmModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (isFilmModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFilmModalOpen]);

  const scrollToDiwaliSpecials = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById('diwali-specials');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section
        id="diwali-hero"
        className="relative w-screen overflow-hidden select-none bg-[#140A07] pt-[72px] sm:pt-[76px] md:pt-0"
        style={{ marginLeft: 'calc(-50vw + 50%)' }}
        aria-label="Ye Diwali, Rajluxmi Wali - The Festive Collection 2026"
      >
        {/* Visually hidden H1 for SEO */}
        <h1 className="sr-only">
          Ye Diwali, Rajluxmi Wali - Raj Luxmi Sweets Festive Collection 2026
        </h1>

        {/* ── DESKTOP (md+): 1920x1080 Full Bleed Banner ── */}
        <div className="hidden md:block relative w-full">
          <Image
            src={DESKTOP_HERO_IMAGE}
            alt="Ye Diwali, Rajluxmi Wali - Raj Luxmi Festive Shoot"
            width={1920}
            height={1080}
            priority
            sizes="100vw"
            className="w-full h-auto block object-cover"
          />

          {/* Desktop Action Buttons shifted up below tagline and aligned with left text */}
          <div className="absolute left-[5%] top-[63.5%] flex items-center gap-2.5 z-20 pointer-events-auto">
            {/* 1. View Diwali Specials */}
            <button
              onClick={scrollToDiwaliSpecials}
              className="group inline-flex items-center space-x-1.5 px-3.5 lg:px-4 py-1.5 lg:py-2 bg-[#E5B56E] hover:bg-[#F2C785] text-[#2C1810] rounded font-orange-avenue text-[10.5px] lg:text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>View Diwali Specials</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>

            {/* 2. Play Film */}
            <button
              onClick={() => setIsFilmModalOpen(true)}
              className="group inline-flex items-center space-x-1.5 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded border border-[#E5B56E]/60 bg-black/60 hover:bg-[#E5B56E]/20 text-[#FFF6E9] hover:text-white font-orange-avenue text-[10.5px] lg:text-[11px] tracking-[0.14em] uppercase transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-sm hover:border-[#E5B56E] active:scale-95 whitespace-nowrap"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-[#E5B56E] text-[#2C1810] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="w-2 h-2 fill-current ml-0.5" />
              </span>
              <span>Play Film</span>
            </button>
          </div>
        </div>

        {/* ── MOBILE (< md): 941x1672 Portrait Banner ── */}
        <div className="block md:hidden relative w-full">
          <Image
            src={MOBILE_HERO_IMAGE}
            alt="Ye Diwali, Rajluxmi Wali - Raj Luxmi Festive Mobile Shoot"
            width={941}
            height={1672}
            priority
            sizes="100vw"
            className="w-full h-auto block object-cover"
          />

          {/* Mobile Action Buttons centered in the bottom middle */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 sm:bottom-8 flex items-center justify-center gap-2 sm:gap-2.5 z-20 pointer-events-auto w-full px-3">
            {/* 1. View Diwali Specials */}
            <button
              onClick={scrollToDiwaliSpecials}
              className="group inline-flex items-center space-x-1 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#E5B56E] hover:bg-[#F2C785] text-[#2C1810] rounded font-orange-avenue text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-200 shadow-xl active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>View Diwali Specials</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2. Play Film */}
            <button
              onClick={() => setIsFilmModalOpen(true)}
              className="group inline-flex items-center space-x-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded border border-[#E5B56E]/80 bg-black/75 hover:bg-[#E5B56E]/20 text-[#FFF6E9] font-orange-avenue text-[10px] sm:text-[11px] tracking-[0.12em] uppercase transition-all duration-200 backdrop-blur-md cursor-pointer shadow-xl active:scale-95 whitespace-nowrap"
            >
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#E5B56E] text-[#2C1810] flex items-center justify-center">
                <Play className="w-1.5 h-1.5 fill-current ml-0.5" />
              </span>
              <span>Play Film</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brand Film Modal Popup - NOT prerendered, mounted on demand */}
      <AnimatePresence>
        {isFilmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#1A0B06] border border-[#B38B46]/40 rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              <div className="flex items-center justify-between p-3.5 px-5 border-b border-[#B38B46]/20 bg-[#120704]">
                <div className="flex items-center space-x-2">
                  <span className="font-orange-avenue text-xs sm:text-sm uppercase tracking-widest text-[#E5B56E]">
                    Ye Diwali, Rajluxmi Wali &middot; Festive Film
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Video Player - Only renders when modal is open */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  <source src="/videos/RAJLUXMI_Final_v2.HUMOUR%20(1).mp4" type="video/mp4" />
                  <source src="/videos/rajluxmi_film.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DiwaliHeroSection;
