'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '@/data/testimonials';

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  const duration = props.duration || 25;
  const colRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const node = colRef.current;
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
    <div ref={colRef} className={props.className}>
      <div
        className="flex flex-col gap-6 pb-6 select-none"
        style={{
          animation: `testimonials-scroll ${duration}s linear infinite`,
          animationPlayState: isVisible ? 'running' : 'paused',
        }}
      >
        {/* Create two sets of testimonials for infinite scrolling effect */}
        {[0, 1].map((setIndex) => (
          <div key={`testimonial-set-${setIndex}`} className="flex flex-col gap-6">
            {props.testimonials.map(({ text, image, name, role, company }, i) => {
              const key = `testimonial-${setIndex}-${i}`;
              return (
                <div
                  key={key}
                  className="p-8 rounded-xl border border-[#F5E6D3] shadow-sm hover:shadow-md transition-shadow duration-300 max-w-xs w-full bg-white flex flex-col justify-between"
                >
                  <div className="relative">
                    {/* Quote Icon */}
                    <span className="absolute -top-4 -left-2 text-6xl text-[#E6D5B8] opacity-30 font-instrument leading-none">
                      "
                    </span>
                    <p className="text-[#5D4037] relative z-10 italic leading-relaxed pt-4 font-instrument font-light">
                      {text}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#F5E6D3]/50">
                    <img
                      width={48}
                      height={48}
                      src={image}
                      alt={name}
                      className="h-12 w-12 rounded-full object-cover border border-[#E6D5B8]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          name
                        )}&background=random&color=fff`;
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="font-instrument font-normal text-lg text-[#2C1810]">
                        {name}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-[#8B2131] opacity-80 font-instrument font-normal">
                        {role}
                        {company ? `, ${company}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes testimonials-scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};
