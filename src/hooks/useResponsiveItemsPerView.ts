'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Returns the responsive `itemsPerView` count for product carousels,
 * debounced so that rapid window resize events (e.g. dragging a window
 * edge) don't fire dozens of setState calls in quick succession.
 *
 * All carousel components can share this single hook instead of each
 * one attaching its own raw `resize` listener.
 */
export function useResponsiveItemsPerView(
  breakpoints?: { sm?: number; md?: number; lg?: number },
) {
  const bp = {
    sm: breakpoints?.sm ?? 2,     // < 640px
    md: breakpoints?.md ?? 2.5,   // < 1024px
    lg: breakpoints?.lg ?? 4,     // >= 1024px
  };

  const getCount = () => {
    if (typeof window === 'undefined') return bp.lg;
    if (window.innerWidth < 640) return bp.sm;
    if (window.innerWidth < 1024) return bp.md;
    return bp.lg;
  };

  const [itemsPerView, setItemsPerView] = useState(getCount);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setItemsPerView(getCount());
      }, 150); // 150ms debounce — fast enough to feel responsive
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return itemsPerView;
}

export default useResponsiveItemsPerView;
