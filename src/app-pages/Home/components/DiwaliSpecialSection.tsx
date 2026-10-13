'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryTree } from '@/hooks/useCategories';

const DiwaliSpecialSection: React.FC = () => {
  const router = useRouter();
  const { products, loading: productsLoading } = useProducts();
  const { categories, subcategoriesByParentId, loading: categoriesLoading } = useCategoryTree();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // 1. Identify the main "Diwali Specials" category from the database
  const diwaliMainCategory = useMemo(() => {
    return (
      categories.find((c) => {
        const n = (c.name || '').trim().toLowerCase();
        const s = (c.slug || '').trim().toLowerCase();
        return (
          n === 'diwali specials' ||
          s === 'diwali-specials' ||
          n === 'diwali special' ||
          s === 'diwali-special'
        );
      }) ||
      categories.find((c) => {
        const n = (c.name || '').toLowerCase();
        const s = (c.slug || '').toLowerCase();
        return n.includes('diwali') || s.includes('diwali');
      })
    );
  }, [categories]);

  // 2. Discover all subcategories placed under this main category
  const subcategories = useMemo(() => {
    if (!diwaliMainCategory) return [];

    const subMap = new Map<string, { id: string; name: string; slug: string | null }>();

    // Relationships from categoryHierarchy tree
    const fromMap = subcategoriesByParentId[diwaliMainCategory.id] || [];
    const fromTree = diwaliMainCategory.subcategories || [];
    const fromParents = categories.filter(
      (c) => c.parent_ids?.includes(diwaliMainCategory.id) && c.id !== diwaliMainCategory.id
    );

    [...fromMap, ...fromTree, ...fromParents].forEach((c) => {
      if (c && c.id && c.id !== diwaliMainCategory.id) {
        subMap.set(c.id, { id: c.id, name: c.name, slug: c.slug || null });
      }
    });

    // Also include any categories explicitly prefixed/tagged with 'diwali' if not main
    categories.forEach((c) => {
      if (c.id !== diwaliMainCategory.id) {
        const n = (c.name || '').toLowerCase();
        if (n.startsWith('diwali ') || n.endsWith(' diwali')) {
          subMap.set(c.id, { id: c.id, name: c.name, slug: c.slug || null });
        }
      }
    });

    return Array.from(subMap.values());
  }, [diwaliMainCategory, subcategoriesByParentId, categories]);

  // 3. Filter real database products according to the selected tab
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (!diwaliMainCategory) return [];

    const subcategoryIds = new Set(subcategories.map((s) => s.id));
    const subcategoryNames = new Set(subcategories.map((s) => (s.name || '').toLowerCase()));

    if (activeTab === 'all') {
      // Products belonging to the main category OR any of its subcategories
      return products.filter((p) => {
        if (p.category_id === diwaliMainCategory.id) return true;
        if (p.category_id && subcategoryIds.has(p.category_id)) return true;
        const catName = (p.categories?.name || '').toLowerCase();
        if (catName === (diwaliMainCategory.name || '').toLowerCase()) return true;
        if (subcategoryNames.has(catName)) return true;
        if (catName.includes('diwali')) return true;
        return false;
      });
    }

    // A specific subcategory tab is active
    const activeSubcat = subcategories.find((s) => s.id === activeTab);
    return products.filter((p) => {
      if (p.category_id === activeTab) return true;
      if (activeSubcat && (p.categories?.name || '').toLowerCase() === activeSubcat.name.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [products, diwaliMainCategory, subcategories, activeTab]);

  const handleQuickView = (product?: any) => {
    if (product) {
      setQuickViewProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  const handleViewDetail = (product: any) => {
    const slug = product.sku || product.slug || product.id;
    if (slug) {
      router.push(`/product/${slug}`);
    } else {
      router.push('/products');
    }
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <section
      id="diwali-specials"
      className="py-12 md:py-20 bg-[#FAF7F2] relative border-b border-[#B38B46]/20"
      aria-label="Raj Luxmi Sweets Diwali Collection"
    >
      {/* Decorative Warm Festive Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-40 bg-radial from-[#E5B56E]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Heading & Royal Motif */}
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E5B56E]/15 border border-[#E5B56E]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B38B46]" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#8C5E1B] uppercase font-orange-avenue">
              Shubh Deepavali &middot; 2026
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#2C1810] tracking-wide font-normal mb-3 uppercase font-orange-avenue">
            {diwaliMainCategory?.name || 'Diwali Specials'}
          </h2>

          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#B38B46] to-transparent mb-3" />

          <p className="text-xs sm:text-sm text-[#6E4F39] max-w-2xl font-normal leading-relaxed font-orange-avenue">
            Curated festive hampers, handcrafted pure desi ghee mithai, and imperial dry fruit boxes created to celebrate Diwali the royal Lucknowi way.
          </p>

          {/* Subcategory Filter Tabs */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-7">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-normal tracking-wider uppercase font-orange-avenue transition-all duration-300 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#2C1810] text-[#E5B56E] shadow-md scale-105'
                    : 'bg-white/80 hover:bg-white text-[#5D4037] border border-[#B38B46]/20'
                }`}
              >
                All Specials
              </button>
              {subcategories.map((sub) => {
                const isActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-normal tracking-wider uppercase font-orange-avenue transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#2C1810] text-[#E5B56E] shadow-md scale-105'
                        : 'bg-white/80 hover:bg-white text-[#5D4037] border border-[#B38B46]/20'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Products Grid: displays only real items, or blank when empty */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#F2EDE4] rounded-xl h-80 border border-[#E5D8C3]"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
            {filteredProducts.map((product) => {
              const cardProduct = {
                ...product,
                images: product.images || [],
                image: product.images?.[0] || '/placeholder.svg',
                slug: product.sku || product.id,
              };
              return (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={cardProduct as any}
                    onQuickView={handleQuickView}
                    onViewDetail={() => handleViewDetail(cardProduct)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Blank display if the category/subcategory has no items */
          <div className="min-h-[60px]" />
        )}

        {/* Bottom CTA / Custom Corporate Gifting link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 md:mt-14">
          <a
            href="https://res.cloudinary.com/dmj0smemf/image/upload/v1791800492/Rajluxmi_Diwali_Catalogue_1__compressed_aumrdz.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-2.5 px-8 py-3.5 bg-[#2C1810] hover:bg-[#432316] text-[#E5B56E] rounded-md text-xs sm:text-sm font-normal tracking-[0.16em] uppercase font-orange-avenue transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
          >
            <span>Download Diwali Catalogue (PDF)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </a>

          <a
            href="https://wa.me/918448447408?text=Hi%20Raj%20Luxmi%20Sweets%2C%20I%20am%20interested%20in%20Bulk%20Diwali%20Gifting%20and%20Custom%20Hampers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white hover:bg-[#FAF5EC] text-[#2C1810] border border-[#B38B46]/40 rounded-md text-xs sm:text-sm font-normal tracking-wider uppercase font-orange-avenue transition-all duration-300 cursor-pointer shadow-sm"
          >
            <Gift className="w-4 h-4 text-[#B38B46]" />
            <span>Customize Corporate Diwali Boxes</span>
          </a>
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

export default DiwaliSpecialSection;
