'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type MarqueeAnimationProps = {
  children: string;
  className?: string;
  direction?: 'left' | 'right';
  baseVelocity?: number;
};

function MarqueeAnimation({
  children,
  className,
  direction = 'left',
  baseVelocity = -0.5,
}: MarqueeAnimationProps) {
  const isRight = direction === 'right' || baseVelocity > 0;
  const animationDuration = '28s';

  return (
    <div className="overflow-hidden max-w-[100vw] text-nowrap flex-nowrap flex relative select-none">
      <div
        className={cn(
          'flex flex-nowrap text-nowrap shrink-0',
          className
        )}
        style={{
          animation: `footer-marquee ${animationDuration} linear infinite ${
            isRight ? 'reverse' : 'normal'
          }`,
          willChange: 'transform',
        }}
      >
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'flex flex-nowrap text-nowrap shrink-0',
          className
        )}
        style={{
          animation: `footer-marquee ${animationDuration} linear infinite ${
            isRight ? 'reverse' : 'normal'
          }`,
          willChange: 'transform',
        }}
      >
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
      </div>

      <style jsx global>{`
        @keyframes footer-marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

export { MarqueeAnimation };
