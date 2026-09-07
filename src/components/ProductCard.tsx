'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useStore, Product as StoreProduct } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { FEATURED_CATEGORY } from '@/config/featuredCategory';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  weight?: string;
  pieces?: string;
  rating?: number;
  stock_quantity?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  features?: string[];

  // Store compatibility fields
  category?: string;
  description?: string;
  inStock?: boolean;
  slug?: string;

  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
  onQuickView?: (product?: Product) => void;
  variant?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onQuickView, variant = 'grid' }) => {
  const addToCart = useStore((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [hoverLoaded, setHoverLoaded] = useState(false);

  // Always use the first image as the primary image
  const primaryImage = product.images?.[0] || product.image || '/placeholder.svg';

  // Get the second image for hover effect, or fallback to the first
  const hoverImage = product.images && product.images.length > 1
    ? product.images[1]
    : primaryImage;

  const displayImage = isHovered ? hoverImage : primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure product matches StoreProduct requirements
    const cartProduct: StoreProduct = {
      ...product,
      image: primaryImage,
      category: product.category || 'General',
      description: product.description || '',
      inStock: product.inStock ?? (product.stock_quantity !== undefined ? product.stock_quantity > 0 : true),
      slug: product.slug || product.id,
      weight: product.weight || '',
      pieces: product.pieces || '',
      rating: product.rating || 0,
      // Handle features type mismatch (local string[] vs store object)
      features: undefined
    };

    addToCart(cartProduct);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  const formatPriceWithGST = (price: number): string => {
    return `${formatPrice(price)}`;
  };

  if (variant === 'list') {
    return (
      <motion.div
        className="group cursor-pointer bg-white overflow-hidden relative flex flex-col sm:flex-row border border-[#E6D5B8]/30 hover:shadow-lg transition-all duration-300 rounded-none h-auto sm:h-52"
        onClick={onViewDetail}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* List View Image */}
        <div className="relative w-full sm:w-52 h-52 sm:h-full bg-[#F0EBE0] overflow-hidden flex-shrink-0">
          {/* Shimmer skeleton */}
          {!primaryLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0EBE0] via-[#FFF8F0] to-[#F0EBE0] animate-pulse" />
          )}
          <motion.img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${primaryLoaded ? 'opacity-100' : 'opacity-0'}`}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            onLoad={() => setPrimaryLoaded(true)}
          />
          {/* Badges */}
          <div className="absolute top-0 left-0 flex flex-col gap-1 p-2">
            {product.isBestSeller && (
              <span className="bg-[#2C1810] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">Bestseller</span>
            )}
            {discount > 0 && (
              <span className="bg-[#D32F2F] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">-{discount}%</span>
            )}
          </div>
        </div>

        {/* List View Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-orange-avenue font-normal text-xl text-[#2C1810] group-hover:text-[#8B2131] transition-colors duration-300">
                {product.name}
              </h3>
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#B8860B] fill-current" />
                  <span className="text-xs text-[#5D4037]">{product.rating}</span>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-colors ${isLiked ? 'text-[#8B2131] bg-[#F9F3EA]' : 'text-gray-400 hover:text-[#8B2131] hover:bg-gray-100'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-normal text-[#2C1810] font-orange-avenue">
                  {formatPriceWithGST(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#5D4037]/50 line-through decoration-[#5D4037]/30">
                    {formatPriceWithGST(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.weight && (
                <span className="text-xs text-[#5D4037] uppercase tracking-wider font-light block">
                  {product.weight} {product.pieces ? `• ${product.pieces}` : ''}
                </span>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 sm:flex-none bg-[#2C1810] text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#8B2131] transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {onQuickView && (
                <button
                  onClick={handleQuickView}
                  className="p-3 border border-[#E6D5B8] hover:bg-[#F9F3EA] transition-colors text-[#2C1810]"
                  aria-label="Quick view"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group cursor-pointer bg-white overflow-hidden relative flex flex-col border border-[#E8DED1]/50 hover:border-[#B38B46]/40 hover:shadow-md transition-all duration-300 rounded-sm"
      onClick={onViewDetail}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F7F3EB] overflow-hidden">
        {/* Shimmer skeleton */}
        {!primaryLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EB] via-[#FFFDF9] to-[#F7F3EB] animate-pulse" />
        )}
        <motion.img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            isHovered && hoverImage !== primaryImage ? 'opacity-0' : primaryLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          animate={{ scale: isHovered ? 1.04 : 1 }}
          onLoad={() => setPrimaryLoaded(true)}
        />
        {/* Hover image */}
        {hoverImage !== primaryImage && (
          <motion.img
            src={hoverImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered && hoverLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            animate={{ scale: isHovered ? 1.04 : 1 }}
            onLoad={() => setHoverLoaded(true)}
          />
        )}

        {/* Badges - Minimal & Refined */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
          {product.category === FEATURED_CATEGORY && (
            <span className="bg-[#783838]/90 text-[#FAF9F6] px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-orange-avenue backdrop-blur-xs">
              {FEATURED_CATEGORY}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#2C1810]/90 text-[#FAF9F6] px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-orange-avenue backdrop-blur-xs">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#B38B46]/90 text-[#2C1810] px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-orange-avenue backdrop-blur-xs font-medium">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#A02D2D]/90 text-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-orange-avenue backdrop-blur-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions - Top Right */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              isLiked ? 'bg-[#783838] text-white' : 'bg-white/90 text-[#2C1810] hover:bg-[#783838] hover:text-white'
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-1.5 rounded-full bg-white/90 text-[#2C1810] hover:bg-[#783838] hover:text-white backdrop-blur-sm transition-colors"
              aria-label="Quick View"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Add to Cart - Minimal Bottom Slide-up */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-10">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-[#2C1810]/95 hover:bg-[#783838] text-white py-2 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.18em] font-orange-avenue transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3 h-3" />
            {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Product Details - Compact & Minimal */}
      <div className="p-3 text-center flex flex-col items-center justify-between flex-1 gap-1">
        <h3 className="font-orange-avenue font-normal text-xs sm:text-[13px] text-[#2C1810] group-hover:text-[#783838] transition-colors duration-200 line-clamp-1 w-full truncate">
          {product.name}
        </h3>

        {product.weight && (
          <span className="text-[10px] text-[#783838]/70 uppercase tracking-wider font-light">
            {product.weight}
          </span>
        )}

        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-xs sm:text-sm font-normal text-[#2C1810] font-orange-avenue">
            {formatPriceWithGST(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-[#5D4037]/50 line-through decoration-[#5D4037]/30">
              {formatPriceWithGST(product.originalPrice)}
            </span>
          )}
        </div>

        {product.rating && (
          <div className="flex items-center gap-1 opacity-70 mt-0.5">
            <Star className="w-2.5 h-2.5 text-[#B8860B] fill-current" />
            <span className="text-[10px] text-[#5D4037]">{product.rating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);
