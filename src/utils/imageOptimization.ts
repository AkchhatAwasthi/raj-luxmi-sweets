/**
 * Image optimization utilities for supersweets
 * Provides lazy loading, WebP support, and responsive images
 */

// Image optimization configuration
interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  className?: string;
}

// Check if browser supports WebP
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!src) return src;

  // Supabase Storage: use built-in image transformation API
  // See: https://supabase.com/docs/guides/storage/serving/image-transformations
  if (src.includes('supabase.co/storage')) {
    try {
      const url = new URL(src);
      // Only add transform params if not already present
      if (width && !url.searchParams.has('width')) {
        url.searchParams.set('width', width.toString());
      }
      if (height && !url.searchParams.has('height')) {
        url.searchParams.set('height', height.toString());
      }
      if (!url.searchParams.has('quality')) {
        url.searchParams.set('quality', quality.toString());
      }
      // Request WebP format for modern browsers
      if (!url.searchParams.has('format')) {
        url.searchParams.set('format', 'webp');
      }
      return url.toString();
    } catch {
      return src;
    }
  }

  // Unsplash: add their native optimization parameters
  if (src.includes('unsplash.com')) {
    try {
      const url = new URL(src);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    } catch {
      return src;
    }
  }

  // Cloudinary / ImageKit already handle their own URLs
  if (src.includes('cloudinary.com') || src.includes('imagekit.io')) {
    return src;
  }

  // Local or unknown — return as-is
  return src;
}

// Generate responsive image srcSet
// Only generates real srcsets for known image services; avoids useless duplicate entries for blob/local URLs
export function generateSrcSet(src: string, sizes: number[] = [400, 800, 1200]): string {
  if (!src) return '';
  // Only worth generating srcset for services that can actually resize on the fly
  const isResizable =
    src.includes('supabase.co/storage') ||
    src.includes('unsplash.com') ||
    src.includes('cloudinary.com') ||
    src.includes('imagekit.io');

  if (!isResizable) return '';

  return sizes
    .map(size => `${getOptimizedImageUrl(src, size)} ${size}w`)
    .join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizes(breakpoints: { [key: string]: string } = {
  '(max-width: 640px)': '100vw',
  '(max-width: 768px)': '50vw',
  '(max-width: 1024px)': '33vw',
  default: '25vw'
}): string {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`);
  const defaultSize = entries[entries.length - 1][1];

  return [...mediaQueries, defaultSize].join(', ');
}

// Lazy loading intersection observer
let imageObserver: IntersectionObserver | null = null;

export function initImageObserver(): IntersectionObserver {
  if (imageObserver) return imageObserver;

  imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          imageObserver?.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  return imageObserver;
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload multiple images
export async function preloadImages(sources: string[]): Promise<void> {
  const promises = sources.map(src => preloadImage(src));
  await Promise.all(promises);
}

// Generate placeholder for lazy loading
export function generatePlaceholder(width: number, height: number, color: string = '#f3f4f6'): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Image error handler
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  const fallbackSrc = img.dataset.fallback || '/api/placeholder/400/300';

  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc;
  }
}

// Utility to get image dimensions
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}