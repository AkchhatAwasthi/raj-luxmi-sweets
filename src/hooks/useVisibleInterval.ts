'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Runs a `setInterval` only while the component's root element is visible
 * in the viewport AND the browser tab is active.
 *
 * This prevents off-screen carousels from firing timers that trigger
 * unnecessary React state updates and DOM reconciliation, which over time
 * causes the "page not responsive" error in the browser.
 *
 * @param callback  The function to call on each tick.
 * @param delayMs   Interval delay in milliseconds.
 * @param enabled   Master on/off switch (e.g. `products.length > itemsPerView`).
 * @returns A React ref — attach it to the component's outermost DOM element.
 */
export function useVisibleInterval(
  callback: () => void,
  delayMs: number,
  enabled: boolean = true,
) {
  const containerRef = useRef<HTMLElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep the callback ref up-to-date without re-subscribing the observer.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const start = useCallback(() => {
    if (intervalRef.current !== null) return; // already running
    intervalRef.current = setInterval(() => callbackRef.current(), delayMs);
  }, [delayMs]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!enabled || !node) {
      stop();
      return;
    }

    // ─── IntersectionObserver: pause when off-screen ──────────────────
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    io.observe(node);

    // ─── Page Visibility API: pause when tab is hidden ───────────────
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        // Re-check intersection before restarting
        const rect = node.getBoundingClientRect();
        const inViewport =
          rect.bottom > 0 &&
          rect.top < (window.innerHeight || document.documentElement.clientHeight);
        if (inViewport) start();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, start, stop]);

  return containerRef;
}

export default useVisibleInterval;
