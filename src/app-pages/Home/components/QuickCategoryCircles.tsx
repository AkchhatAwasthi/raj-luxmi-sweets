'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCategoryTree } from '@/hooks/useCategories';

interface FallbackMeta {
  name: string;
  slug: string;
  subtitle: string;
  image: string;
}

const DEFAULT_MAIN_CATEGORIES: FallbackMeta[] = [
  {
    name: 'Sweets',
    slug: 'sweets',
    subtitle: 'Pure Desi Ghee & Khoya',
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412897/DSC08529.jpg',
  },
  {
    name: 'Namkeen',
    slug: 'namkeen',
    subtitle: 'Mathri, Bhujiya & Sev',
    // Product listed inside Namkeen: Namkeen Kaju Samosa
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412968/Namkeen_Kaju_Samosa.jpg',
  },
  {
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    subtitle: 'Premium Roasted & Plain',
    image: 'https://res.cloudinary.com/dil74qcsx/image/upload/f_auto,q_auto/v1784279498/dry_fruit_licbr1.png',
  },
  {
    name: 'Gifting',
    slug: 'gifting',
    subtitle: 'Celebration Boxes & Hampers',
    // Product listed inside Gifting: Luxury Festive Gift Box 1
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412964/DSC07955.jpg',
  },
  {
    name: 'Festive',
    slug: 'festive',
    subtitle: 'Seasonal Specials & Mithai',
    image: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788240115/DSC07987_1_1_ujxahs.jpg',
  },
];

// Product image mappings for main categories (using actual products from store)
const CATEGORY_PRODUCT_IMAGES: Record<string, string> = {
  'namkeen': 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412968/Namkeen_Kaju_Samosa.jpg',
  'gifting': 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412964/DSC07955.jpg',
};

const CATEGORY_META: Record<string, { subtitle: string; image: string }> = {
  'sweets': {
    subtitle: 'Pure Desi Ghee & Khoya',
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412897/DSC08529.jpg',
  },
  'namkeen': {
    subtitle: 'Mathri, Bhujiya & Sev',
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412968/Namkeen_Kaju_Samosa.jpg',
  },
  'dry-fruits': {
    subtitle: 'Premium Roasted & Plain',
    image: 'https://res.cloudinary.com/dil74qcsx/image/upload/f_auto,q_auto/v1784279498/dry_fruit_licbr1.png',
  },
  'gifting': {
    subtitle: 'Celebration Boxes & Hampers',
    image: 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412964/DSC07955.jpg',
  },
  'festive': {
    subtitle: 'Seasonal Specials & Mithai',
    image: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788240115/DSC07987_1_1_ujxahs.jpg',
  },
};

const MAIN_CATEGORY_ORDER = ['sweets', 'namkeen', 'dry-fruits', 'gifting', 'festive'];

const QuickCategoryCircles = () => {
  const router = useRouter();
  const { rootCategories, loading } = useCategoryTree();

  // Dynamically map from DB root categories, preserving luxury presentation
  const displayCategories = React.useMemo(() => {
    if (!rootCategories || rootCategories.length === 0) {
      return DEFAULT_MAIN_CATEGORIES.map(c => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        description: c.subtitle,
        image_url: c.image,
      }));
    }

    // Sort to primary brand order
    const sorted = [...rootCategories].sort((a, b) => {
      const idxA = MAIN_CATEGORY_ORDER.indexOf(a.slug?.toLowerCase() || '');
      const idxB = MAIN_CATEGORY_ORDER.indexOf(b.slug?.toLowerCase() || '');
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return sorted;
  }, [rootCategories]);

  return (
    <section className="py-8 md:py-12 bg-[#FAF9F6]">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Minimal Section Header */}
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8 text-center space-y-1.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#B38B46] font-medium font-orange-avenue">
            CURATED SELECTIONS
          </span>
          <h2 className="text-base sm:text-lg md:text-xl text-[#2C1810] uppercase font-orange-avenue font-normal tracking-[0.2em]">
            SHOP BY CATEGORY
          </h2>
          <div className="w-10 h-0.5 bg-[#B38B46]/40 mt-1"></div>
        </div>

        {/* Category Circles (Dynamic from Database) */}
        <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-8 md:gap-12 overflow-x-auto pb-4 pt-1 no-scrollbar px-3">
          {displayCategories.map((cat, idx) => {
            const slugKey = cat.slug?.toLowerCase() || '';
            const meta = CATEGORY_META[slugKey] || {
              subtitle: cat.description || 'Authentic Royal Delicacy',
              image: cat.image_url || 'https://images.unsplash.com/photo-1599354607481-99c75a02797e?auto=format&fit=crop&q=80',
            };
            const imageSrc = CATEGORY_PRODUCT_IMAGES[slugKey] || cat.image_url || meta.image;

            return (
              <motion.button
                key={cat.id || idx}
                onClick={() => router.push(`/category/${cat.slug || cat.id}`)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
              >
                {/* Circle Image with Luxury Double Ring */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 border border-[#B38B46]/30 group-hover:border-[#B38B46] transition-all duration-300 shadow-xs group-hover:scale-105 bg-white">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF6F0]">
                    <Image
                      src={imageSrc}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                    />
                    <div className="absolute inset-0 bg-[#4A1C1F]/0 group-hover:bg-[#4A1C1F]/10 transition-colors duration-300" />
                  </div>
                </div>

                {/* Category Name */}
                <h3 className="mt-3 text-xs sm:text-sm font-orange-avenue font-normal text-[#2C1810] group-hover:text-[#4A1C1F] transition-colors tracking-widest text-center uppercase">
                  {cat.name}
                </h3>

                {/* Subtitle */}
                <p className="text-[10px] sm:text-[11px] text-[#783838]/70 font-light text-center max-w-[140px] leading-tight mt-0.5">
                  {meta.subtitle}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickCategoryCircles;
