'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatPrice } from '@/utils/currency';
import { Button } from '@/components/ui/button';


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
  features?: string[];
  [key: string]: any;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const addToCart = useStore((state) => state.addToCart);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const variants = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants : [];
  const hasVariants = variants.length > 0;
  const initialVariant = variants.find((v: any) => v.is_default) || variants[0] || null;
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        const def = product.variants.find((v: any) => v.is_default) || product.variants[0];
        setSelectedVariant(def);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product]);

  if (!product) return null;

  const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const activeOriginalPrice = selectedVariant?.original_price !== undefined && selectedVariant?.original_price !== null
    ? (selectedVariant.original_price ? Number(selectedVariant.original_price) : undefined)
    : (product.originalPrice || product.original_price);
  const activeWeight = selectedVariant?.weight || product.weight || '';
  const activePieces = selectedVariant?.pieces || product.pieces || '';
  const activeStock = selectedVariant?.stock_quantity !== undefined ? selectedVariant.stock_quantity : product.stock_quantity;

  const images = product.images || [product.image];
  const discount = activeOriginalPrice && activeOriginalPrice > activePrice
    ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const cartItemKey = selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        cartItemId: cartItemKey,
        variantId: selectedVariant?.id,
        variantTitle: selectedVariant?.title,
        selectedVariant: selectedVariant || undefined,
        price: activePrice,
        originalPrice: activeOriginalPrice,
        image: product.images?.[0] || product.image || '/placeholder.svg',
        category: product.category || 'General',
        description: product.description || '',
        inStock: activeStock !== undefined ? activeStock > 0 : true,
        slug: product.slug || product.id,
        weight: activeWeight,
        pieces: activePieces
      } as any);
    }
    onClose();
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative bg-[#FFFDF7] w-full h-full md:h-auto md:max-h-[85vh] md:max-w-5xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            {/* Close Button - Floating */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-[#8B2131] hover:text-white rounded-full shadow-md transition-all duration-300 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>

            {/* LEFT COLUMN: Visuals */}
            <div className="w-full md:w-1/2 bg-[#F9F3EA] relative p-6 flex flex-col justify-center items-center">
              {/* Main Image Container */}
              <div
                className="relative w-full max-w-sm aspect-square bg-white shadow-lg rounded-xl overflow-hidden mb-6 group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.img
                  key={selectedImageIndex}
                  src={images[selectedImageIndex] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0.8, scale: 1.1 }}
                  animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="bg-[#8B2131] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-sm">
                      -{discount}%
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-[#B38B46] text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm shadow-sm">
                      Bestseller
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2 px-1 max-w-full no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                        ? 'border-[#8B2131] opacity-100 scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#D4B6A2]'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Details */}
            <div className="w-full md:w-1/2 bg-white flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">

                {/* Header Info */}
                <div className="mb-6">
                  <span className="text-[#B38B46] font-orange-avenue font-normal text-xs tracking-[0.2em] uppercase mb-3 block">
                    {product.category || 'Signature Collection'}
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl text-[#783838] uppercase font-orange-avenue font-normal tracking-wide leading-tight mb-2">
                    {product.name}
                  </h2>

                  {/* Rating & Stock */}
                  <div className="flex items-center gap-4 mt-2">
                    {product.rating && (
                      <div className="flex items-center gap-1 bg-[#FFFDF7] border border-[#E6D5B8] px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-[#B38B46] fill-current" />
                        <span className="text-xs font-medium text-[#5C4638]">{product.rating}</span>
                      </div>
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${(activeStock !== undefined && activeStock <= 0)
                      ? 'bg-red-50 text-red-700'
                      : 'bg-green-50 text-green-700'
                      }`}>
                      {(activeStock !== undefined && activeStock <= 0) ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>

                {/* Price Block */}
                <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-[#F0E6D9]">
                  <span className="text-3xl font-light text-[#2C1810] font-orange-avenue font-normal">
                    {formatPrice(activePrice)}
                  </span>
                  {activeOriginalPrice && (
                    <span className="text-lg text-[#D4B6A2] line-through decoration-1">
                      {formatPrice(activeOriginalPrice)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold text-[#8B2131] border border-[#8B2131] px-2 py-0.5 rounded-sm">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Variant Options Selector */}
                {hasVariants && (
                  <div className="mb-6 p-3.5 bg-gradient-to-b from-[#FDFCF8] to-[#F7F2E8] border border-[#E8DEC8] rounded-2xl shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B2131]" />
                        <span className="text-[11px] font-semibold text-[#5D4037] uppercase tracking-[0.14em]">
                          Select Option / Weight
                        </span>
                      </div>
                      {selectedVariant && (
                        <span className="text-[11px] font-bold text-[#8B2131] bg-[#8B2131]/10 border border-[#8B2131]/20 px-2 py-0.5 rounded-full">
                          {selectedVariant.title}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v: any) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-white text-[#8B2131] border-[#8B2131] shadow-xs ring-1.5 ring-[#8B2131]/20'
                                : 'bg-white/80 text-[#2C1810] border-[#E6D5B8]/80 hover:border-[#B38B46]/60 hover:bg-white'
                            }`}
                          >
                            <span className="font-bold">{v.title}</span>
                            <span className={`text-[11px] font-normal ${isSelected ? 'text-[#8B2131]' : 'text-[#5D4037]/75'}`}>
                              • {formatPrice(v.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <p className="text-[#5D4037] text-sm md:text-base leading-relaxed font-light">
                    {product.description || "Experience the royal taste of authentic ingredients handcrafted to perfection. A delight for your senses."}
                  </p>

                  {/* Weight/Pieces Feature Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {activeWeight && (
                      <div className="text-xs text-[#5C4638] bg-[#F9F3EA] px-3 py-1.5 rounded-full font-medium">
                        Weight: {activeWeight}
                      </div>
                    )}
                    {activePieces && (
                      <div className="text-xs text-[#5C4638] bg-[#F9F3EA] px-3 py-1.5 rounded-full font-medium">
                        Contains: {activePieces}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#2C1810] uppercase tracking-wider">Quantity</span>
                    <div className="flex items-center bg-[#F9F3EA] rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 hover:bg-white rounded-md transition-colors text-[#5C4638] disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-[#2C1810] text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 hover:bg-white rounded-md transition-colors text-[#5C4638]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity !== undefined && product.stock_quantity <= 0}
                    className="w-full h-14 bg-[#2C1810] hover:bg-[#8B2131] text-white text-sm uppercase tracking-[0.2em] font-medium transition-all duration-300 rounded-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-[#8B2131]/20 group"
                  >
                    <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                    Add to Cart
                  </Button>
                </div>


              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
