'use client';

import React from 'react';

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
  return (
    <div className={`w-full bg-[#F9F3EA] overflow-hidden border-y border-[#B38B46]/20 relative z-20 ${className}`}>
      <div className="flex w-fit animate-infinite-scroll">
        {/* Render 4 copies for continuous loop on all screens */}
        {[1, 2, 3, 4].map((copyIndex) => (
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
      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: infinite-scroll ${duration} linear infinite;
        }
        .animate-infinite-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MarqueeSection;
