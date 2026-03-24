'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Hero slideshow images
import hero1 from '@/assets/1.png';
import hero2 from '@/assets/10 (3).png';
import hero3 from '@/assets/3.png';
import hero4 from '@/assets/9 (3).png';

const slides = [
  { image: hero1 },
  { image: hero2 },
  { image: hero3 },
  { image: hero4 },
];

const AUTOPLAY_INTERVAL = 4500;

const CuratedGiftingHero = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index: number, dir = 1) => {
    setDirection(dir);
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const goNext = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [goNext]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section
      className="relative w-screen bg-[#FAF9F6] overflow-hidden"
      style={{ marginLeft: 'calc(-50vw + 50%)' }}
      aria-label="Hero Slideshow"
    >
      {/* Visually hidden H1 for SEO optimization */}
      <h1 className="sr-only">Raj Luxmi Sweets - Premium Indian Mithai & Namkeens</h1>

      {/*
        The outer div is the "slide track" — it takes the natural height of the image.
        We use a stack with relative + the hidden img to reserve space,
        while the animated slides are positioned absolute on top.
      */}

      {/* Space-holder: invisible image that reserves the correct height */}
      <div className="w-full relative invisible pointer-events-none">
        <Image
          src={slides[0].image}
          alt=""
          aria-hidden="true"
          className="w-full h-auto block"
          sizes="100vw"
          priority
        />
      </div>

      {/* Animated slides — absolutely stacked over the space-holder */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={`Slide ${current + 1}`}
            fill
            className="w-full h-full object-contain block"
            sizes="100vw"
            priority={current === 0}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prev arrow */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Next arrow */}
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${idx === current
                ? 'w-8 h-2 bg-[#B38B46]'
                : 'w-2 h-2 bg-black/30 hover:bg-black/50'
              }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10 z-20">
        <motion.div
          key={current}
          className="h-full bg-[#B38B46]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
        />
      </div>
    </section>
  );
};

export default CuratedGiftingHero;
