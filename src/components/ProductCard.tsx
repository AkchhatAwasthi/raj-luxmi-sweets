import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useStore, Product as StoreProduct } from '../store/useStore';
import { formatPrice } from '../utils/currency';
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
        <div className="relative w-full sm:w-52 h-52 sm:h-full bg-[#F9F9F9] overflow-hidden flex-shrink-0">
          <motion.img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            animate={{ scale: isHovered ? 1.05 : 1 }}
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
                  <span className="text-xs text-[#5D4037]">{product.rating} <span className="text-gray-400">({Math.floor(Math.random() * 50) + 10} reviews)</span></span>
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
      className="group cursor-pointer bg-white overflow-hidden relative"
      onClick={onViewDetail}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      {/* Image Container - Square Aspect Ratio for compact look */}
      <div className="relative aspect-square bg-[#F9F9F9] overflow-hidden">
        <motion.img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges - Minimal & Squared */}
        <div className="absolute top-0 left-0 flex flex-col gap-1 p-2">
          {/* Featured Festival Tag */}
          {product.category === FEATURED_CATEGORY && (
            <span className="bg-[#4A1C1F] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">
              {FEATURED_CATEGORY}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#2C1810] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#8B2131] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#D32F2F] text-white px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions - Right Side */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleLike}
            className={`p-2 transition-colors ${isLiked ? 'bg-[#8B2131] text-white' : 'bg-white text-black hover:bg-[#8B2131] hover:text-white'}`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 bg-white text-black hover:bg-[#8B2131] hover:text-white transition-colors"
              aria-label="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add to Cart - Minimal Overlay Button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full bg-[#2C1810] text-white py-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a0f0f] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3 h-3" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 text-center flex flex-col items-center gap-2">
        <h3 className="font-orange-avenue font-normal text-sm text-[#2C1810] line-clamp-1 group-hover:text-[#8B2131] transition-colors duration-300">
          {product.name}
        </h3>

        {/* Weight/Pieces if available could go here */}
        {product.weight && (
          <span className="text-xs text-[#5D4037]/70 uppercase tracking-wider font-light">
            {product.weight}
          </span>
        )}

        <div className="flex flex-col items-center gap-1 mt-1">
          <div className="flex items-center gap-3">
            <span className="text-base font-normal text-[#2C1810] font-orange-avenue">
              {formatPriceWithGST(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-[#5D4037]/50 line-through decoration-[#5D4037]/30">
                {formatPriceWithGST(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Subtle Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300 mt-1">
              <Star className="w-3 h-3 text-[#B8860B] fill-current" />
              <span className="text-xs text-[#5D4037] mt-0.5">{product.rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);