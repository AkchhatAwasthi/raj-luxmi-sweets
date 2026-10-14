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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
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
      className="overflow-hidden max-w-[100vw] text-nowrap flex-nowrap flex relative select-none"
    >
      <div
        className={cn(
          'flex flex-nowrap text-nowrap shrink-0',
          className
        )}
        style={{
          animation: `footer-marquee ${animationDuration} linear infinite ${
            isRight ? 'reverse' : 'normal'
          }`,
          animationPlayState: isVisible ? 'running' : 'paused',
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
          animationPlayState: isVisible ? 'running' : 'paused',
        }}
      >
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
        <span className="inline-block me-10">{children}</span>
      </div>
    </div>
  );
}

export { MarqueeAnimation };
