'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, Cookie, Gift } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { useProducts, ProductItem } from '@/hooks/useProducts';

type TabKey = 'bestsellers' | 'mithai' | 'namkeen' | 'gifting';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  viewAllLink: string;
}

const tabs: TabConfig[] = [
  {
    key: 'bestsellers',
    label: 'Bestsellers',
    icon: Flame,
    viewAllLink: '/products?sort=bestseller',
  },
  {
    key: 'mithai',
    label: 'Pure Ghee Mithai',
    icon: Sparkles,
    viewAllLink: '/products?category=Mithai',
  },
  {
    key: 'namkeen',
    label: 'Royal Namkeens',
    icon: Cookie,
    viewAllLink: '/products?category=Namkeen',
  },
  {
    key: 'gifting',
    label: 'Curated Hampers',
    icon: Gift,
    viewAllLink: '/celebrate-with-rajluxmi',
  },
];

const TabbedProductShowcase = () => {
  const router = useRouter();
  const { products, loading } = useProducts();
  const [activeTab, setActiveTab] = useState<TabKey>('bestsellers');
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Helper to check if a product has a valid image
  const hasImage = (p: ProductItem) =>
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images.some((img) => typeof img === 'string' && img.trim() !== '');

  const prioritizeImages = (list: ProductItem[]) =>
    [...list].sort((a, b) => {
      const hasA = hasImage(a);
      const hasB = hasImage(b);
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });

  // Filter products per active tab, prioritizing products with real images
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    switch (activeTab) {
      case 'bestsellers': {
        const best = products.filter((p) => p.is_bestseller === true);
        const source = best.length > 0 ? best : products;
        return prioritizeImages(source).slice(0, 8);
      }
      case 'mithai': {
        const mithai = products.filter((p) => {
          const cat = p.categories?.name?.toLowerCase() || '';
          const name = p.name?.toLowerCase() || '';
          return (
            cat.includes('mithai') ||
            cat.includes('sweet') ||
            cat.includes('kaju') ||
            cat.includes('ghee') ||
            name.includes('laddu') ||
            name.includes('katli') ||
            name.includes('barfi') ||
            name.includes('peda')
          );
        });
        const source = mithai.length > 0 ? mithai : products;
        return prioritizeImages(source).slice(0, 8);
      }
      case 'namkeen': {
        const namkeen = products.filter((p) => {
          const cat = p.categories?.name?.toLowerCase() || '';
          const name = p.name?.toLowerCase() || '';
          return (
            cat.includes('namkeen') ||
            cat.includes('snack') ||
            name.includes('bhujiya') ||
            name.includes('mathri') ||
            name.includes('sev') ||
            name.includes('namakpara') ||
            name.includes('mixture') ||
            name.includes('chips')
          );
        });
        const source = namkeen.length > 0 ? namkeen : products;
        return prioritizeImages(source).slice(0, 8);
      }
      case 'gifting': {
        const gift = products.filter((p) => {
          const cat = p.categories?.name?.toLowerCase() || '';
          const name = p.name?.toLowerCase() || '';
          return (
            cat.includes('gift') ||
            cat.includes('hamper') ||
            cat.includes('festiv') ||
            cat.includes('box') ||
            p.new_arrival === true ||
            name.includes('box') ||
            name.includes('pack')
          );
        });
        const source = gift.length > 0 ? gift : products;
        return prioritizeImages(source).slice(0, 8);
      }
      default:
        return prioritizeImages(products).slice(0, 8);
    }
  }, [products, activeTab]);

  const activeTabConfig = tabs.find((t) => t.key === activeTab) || tabs[0];

  const handleQuickView = (product?: any) => {
    if (product) {
      setQuickViewProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  const handleViewDetail = (product: any) => {
    const slug = product.slug || product.sku || product.id;
    if (slug) {
      router.push(`/product/${slug}`);
    } else {
      router.push(`/products`);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-[#FAF9F6] relative">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8 text-center space-y-1">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#B38B46] font-medium font-orange-avenue">
            HANDPICKED SPECIALTIES
          </span>
          <h2 className="text-sm sm:text-base md:text-lg text-[#2C1810] uppercase font-orange-avenue font-normal tracking-[0.18em]">
            EXPLORE OUR CREATIONS
          </h2>
          <div className="w-8 h-0.5 bg-[#B38B46]/30 mt-1"></div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-3 mb-6 no-scrollbar px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-orange-avenue uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#783838] text-white shadow-xs border border-[#783838]'
                    : 'bg-[#F9F3EA] text-[#5D4037] hover:bg-[#EFE8DC] border border-[#B38B46]/20'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-[#B38B46]' : 'text-[#783838]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid with Animated Tab Transition */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#F9F3EA] rounded-xl h-80"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6"
            >
              {filteredProducts.map((product) => {
                const cardProduct = {
                  ...product,
                  images: product.images || [],
                  image: product.images?.[0] || '/placeholder.svg',
                  slug: product.sku || product.id,
                };
                return (
                  <ProductCard
                    key={product.id}
                    product={cardProduct as any}
                    onQuickView={handleQuickView}
                    onViewDetail={() => handleViewDetail(cardProduct)}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 text-[#5D4037]">
            <p className="font-light">No sweets currently listed in this section.</p>
          </div>
        )}

        {/* View All CTA Button */}
        <div className="flex justify-center mt-10 md:mt-12">
          <button
            onClick={() => router.push(activeTabConfig.viewAllLink)}
            className="group inline-flex items-center space-x-2 px-8 py-3.5 bg-transparent border border-[#783838] hover:bg-[#783838] text-[#783838] hover:text-white rounded-full font-orange-avenue text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            <span>View All {activeTabConfig.label}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setQuickViewProduct(null);
          }}
        />
      )}
    </section>
  );
};

export default TabbedProductShowcase;
