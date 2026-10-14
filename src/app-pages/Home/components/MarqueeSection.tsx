'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MarqueeSectionProps {
  items?: string[];
  duration?: string;
  className?: string;
}

const MarqueeSection: React.FC<MarqueeSectionProps> = ({
  items = [
    "100% PURE DESI GHEE",
    "TRADITIONAL RECIPES",
    "PREMIUM INGREDIENTS",
    "LUXURY GIFTING",
    "AUTHENTIC TASTE",
    "ROYAL HERITAGE",
    "FRESHLY MADE"
  ],
  duration = "30s",
  className = "py-2.5"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting && !document.hidden);
    }, { threshold: 0 });
    io.observe(node);

    const onVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#F9F3EA] overflow-hidden border-y border-[#B38B46]/20 relative z-20 ${className}`}
    >
      <div
        className="flex w-max select-none"
        style={{
          animation: `infinite-marquee-scroll ${duration} linear infinite`,
          animationPlayState: isVisible ? 'running' : 'paused',
        }}
      >
        {/* Render 2 copies for smooth continuous loop */}
        {[1, 2].map((copyIndex) => (
          <div key={copyIndex} className="flex items-center space-x-8 sm:space-x-12 px-4 sm:px-6 flex-nowrap shrink-0">
            {items.map((item, i) => (
              <div key={`${copyIndex}-${i}`} className="flex items-center space-x-8 sm:space-x-12 flex-nowrap shrink-0">
                <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-orange-avenue font-normal text-[#783838]/85 uppercase whitespace-nowrap">
                  {item}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#B38B46]/60 shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeSection;
