import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import QuickViewModal from '../../../components/QuickViewModal';

const FloatingProductWidget = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    useEffect(() => {
        if (products.length > 1 && !isHovered && !quickViewProduct) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % products.length);
            }, 4000); // Change slide every 4 seconds
            return () => clearInterval(interval);
        }
    }, [products, isHovered, quickViewProduct]);

    const fetchFeaturedProducts = async () => {
        try {
            // Fetch some random/featured products
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .eq('is_bestseller', true) // Show bestsellers in the widget
                .limit(5);

            if (data && data.length > 0) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching widget products:', error);
        }
    };

    const currentProduct = products[currentIndex];

    if (!isVisible || !currentProduct) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="fixed bottom-6 left-6 z-40 w-28 h-40 md:w-36 md:h-52 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden cursor-pointer group border-2 border-white"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => setQuickViewProduct(currentProduct)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsVisible(false);
                            }}
                            className="absolute top-2 right-2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>

                        {/* Content Container */}
                        <div className="relative w-full h-full bg-gray-100">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-black/20 z-30">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "linear" }}
                                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentProduct.id}
                                    src={currentProduct.images?.[0] || currentProduct.image || '/placeholder.svg'}
                                    alt={currentProduct.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </AnimatePresence>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 w-full p-3 text-white pointer-events-none">
                                <div className="flex items-center gap-1 mb-1">
                                    {/* Live/Story indicator icon or similar */}
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                                    <span className="text-[9px] font-instrument font-normal uppercase tracking-wider opacity-90">Trending</span>
                                </div>
                                <h4 className="text-xs font-instrument font-normal leading-tight line-clamp-2 drop-shadow-md">
                                    {currentProduct.name}
                                </h4>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xs font-instrument font-normal">₹{currentProduct.price}</span>
                                    <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                                        <ShoppingBag className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={!!quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                />
            )}
        </>
    );
};

export default FloatingProductWidget;
