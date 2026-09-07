'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

interface HeroSlide {
  image: string;
  link: string;
  ctaText: string;
  title: string;
}

const slides: HeroSlide[] = [
  {
    image: "https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1775500759/9_3_1_skdh3p.png",
    link: "/products",
    ctaText: "Explore Collection",
    title: "Handcrafted Desi Ghee Sweets",
  },
  {
    image: "https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1775500628/10_3_fqowfk.png",
    link: "/products?category=Namkeen",
    ctaText: "Shop Savouries",
    title: "Royal Lucknowi Namkeens",
  },
  {
    image: "https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1775500627/1_igkhhk.png",
    link: "/celebrate-with-rajluxmi",
    ctaText: "Discover Hampers",
    title: "Bespoke Gifting Hampers",
  },
];

const AUTOPLAY_INTERVAL = 5000;

const CuratedGiftingHero = () => {
  const router = useRouter();
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

  const currentSlide = slides[current];

  return (
    <section
      className="relative w-screen bg-[#FAF9F6] overflow-hidden select-none"
      style={{ marginLeft: 'calc(-50vw + 50%)' }}
      aria-label="Hero Slideshow"
    >
      {/* Visually hidden H1 for SEO optimization */}
      <h1 className="sr-only">Raj Luxmi Sweets - Premium Indian Mithai & Namkeens</h1>

      {/* Space-holder: reserves height from the actual image's natural dimensions */}
      <div className="w-full relative invisible pointer-events-none">
        <Image
          src={slides[0].image}
          alt=""
          aria-hidden="true"
          className="w-full h-auto block"
          sizes="100vw"
          width={1920}
          height={800}
        />
      </div>

      {/* Animated slides */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
          className="absolute inset-0 cursor-pointer group"
          onClick={() => router.push(currentSlide.link)}
        >
          <Image
            src={currentSlide.image}
            alt={currentSlide.title}
            fill
            className="w-full h-full object-contain block transition-transform duration-700 group-hover:scale-[1.01]"
            sizes="100vw"
            priority={current === 0}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prev arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Next arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              goTo(idx, idx > current ? 1 : -1);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === current
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
