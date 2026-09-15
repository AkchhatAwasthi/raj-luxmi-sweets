'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { useProducts, ProductItem } from '@/hooks/useProducts';

const MODAK_CATEGORY_ID = '41177486-826b-43f2-b1eb-de91125a430e';

const FALLBACK_MODAK_PRODUCTS: ProductItem[] = [
  {
    id: '2bcce959-c5d4-493b-8b9f-95a5c2c4af0b',
    name: 'Assorted Modak',
    description: 'An exquisite assortment of handcrafted modak varieties prepared with pure desi ghee and rich dry fruits.',
    price: 1000,
    original_price: 1250,
    weight: '1kg',
    sku: 'mix-modak-all-flavour-box-',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445119/IMG_9348_onlq3y.png'],
    is_active: true,
    is_bestseller: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: 'f11460f7-046d-4d27-b9e3-6b930d4efeb1',
    name: 'Kaju Modak',
    description: 'Cashew-based modak offering soft outer layer and rich nutty filling.',
    price: 1400,
    original_price: 1820,
    weight: '1kg',
    sku: 'best-kaju-modak-in-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445113/WhatsApp_Image_2026-09-15_at_9.31.02_AM_1_tsbfv9.jpg'],
    is_active: true,
    is_bestseller: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: 'c06591b9-fc82-4a8e-9afb-22db76ef566f',
    name: 'Khoya Modak',
    description: 'Khoya modak infused with kesar offering rich aroma and soft texture.',
    price: 800,
    original_price: 1060,
    weight: '1kg',
    sku: 'best-modak-in-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445112/WhatsApp_Image_2026-09-15_at_9.31.02_AM_2_anoazv.jpg'],
    is_active: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: '3e4cff11-5620-42dd-8a66-eff9d85a790c',
    name: 'Motichoor Modak',
    description: 'Motichoor-shaped modak offering soft pearls and rich sweetness.',
    price: 800,
    original_price: 1060,
    weight: '1kg',
    sku: 'best-motichoor-modak-in-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445112/WhatsApp_Image_2026-09-15_at_9.33.17_AM_mxhhpe.jpg'],
    is_active: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: 'b2d53503-7a1d-433b-afb8-988c306ff1ae',
    name: 'Chocolate Modak',
    description: 'Chocolate-flavored modak offering rich cocoa taste and soft texture.',
    price: 800,
    original_price: 1060,
    weight: '1kg',
    sku: 'choclate-modak-in-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445113/WhatsApp_Image_2026-09-15_at_9.31.02_AM_1_tsbfv9.jpg'],
    is_active: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: '2b91db25-16e6-4ae4-9e29-a7e266cb537a',
    name: 'Coconut Modak',
    description: 'Coconut-based modak offering soft texture and rich coconut flavor.',
    price: 800,
    original_price: 1060,
    weight: '1kg',
    sku: 'coconut-modak-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445115/WhatsApp_Image_2026-09-15_at_9.31.01_AM_1_gl4juv.jpg'],
    is_active: true,
    categories: { name: 'Modak Sweets' },
  },
  {
    id: '1c4a34a3-ecb5-4167-952d-b93a16230e03',
    name: 'Pan Modak',
    description: 'Pan-flavored modak offering aromatic sweetness and smooth texture.',
    price: 800,
    original_price: 1060,
    weight: '1kg',
    sku: 'pan-flavoured-modakin-lucknow',
    category_id: MODAK_CATEGORY_ID,
    images: ['https://res.cloudinary.com/dmj0smemf/image/upload/v1789445113/WhatsApp_Image_2026-09-15_at_9.31.02_AM_t2cte0.jpg'],
    is_active: true,
    categories: { name: 'Modak Sweets' },
  },
];

const ModakSpecialSection = () => {
  const router = useRouter();
  const { products, loading } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const modakProducts = useMemo(() => {
    if (!products || products.length === 0) return FALLBACK_MODAK_PRODUCTS;
    const filtered = products.filter(
      (p) =>
        p.category_id === MODAK_CATEGORY_ID ||
        (p.categories?.name || '').toLowerCase().includes('modak') ||
        (p.name || '').toLowerCase().includes('modak')
    );
    return filtered.length > 0 ? filtered : FALLBACK_MODAK_PRODUCTS;
  }, [products]);

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
      router.push('/category/modak-sweets');
    }
  };

  return (
    <section id="modak-special" className="py-8 md:py-12 bg-[#FAF9F6] relative border-b border-[#B38B46]/15">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center mb-6 md:mb-10 text-center space-y-1">
          <span className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.25em] text-[#B38B46] font-medium font-orange-avenue">
            ganpati bappa morya
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#2C1810] uppercase font-orange-avenue font-normal tracking-[0.18em]">
            Modak Special
          </h2>
          <div className="w-10 sm:w-14 h-0.5 bg-[#B38B46]/40 mt-1"></div>
          <p className="text-xs sm:text-[13px] text-[#5D4037] font-light mt-2 max-w-lg text-center">
            Handcrafted festive modaks prepared with 100% pure desi ghee, premium nuts & timeless devotion for Ganesh Utsav.
          </p>
        </div>

        {/* Products Grid */}
        {loading && modakProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#F9F3EA] rounded-xl h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {modakProducts.map((product) => {
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
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-8 md:mt-12">
          <button
            onClick={() => router.push('/category/modak-sweets')}
            className="group inline-flex items-center space-x-2 px-8 py-3.5 bg-transparent border border-[#783838] hover:bg-[#783838] text-[#783838] hover:text-white rounded-full font-orange-avenue text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <span>Explore Modak Sweets</span>
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

export default ModakSpecialSection;
