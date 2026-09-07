// @ts-nocheck
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, LayoutGrid, SlidersHorizontal, Package, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';
import { fetchCategoryRelationships } from '@/lib/categoryHierarchy';
import { isBengaliSweetItem } from '@/utils/deliveryCalculator';

const HOLI_SPECIAL_CATEGORY = 'Holi Special';
const HOLI_TABS = [
  { id: 'gujiya', label: 'Gujiya', emoji: '🍮', settingKey: 'holi_gujiya_ids' },
  { id: 'namkeen', label: 'Namkeen', emoji: '🥨', settingKey: 'holi_namkeen_ids' },
];

interface ProductsProps {
  forcedCategoryId?: string;
  forcedCategoryName?: string;
  forcedCategoryDescription?: string;
}

const Products = ({
  forcedCategoryId,
  forcedCategoryName,
  forcedCategoryDescription,
}: ProductsProps = {}) => {
  const { setSelectedCategory, deliveryMode, setDeliveryMode } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isDeliveryPanIndia =
    searchParams?.get('delivery') === 'pan-india' || deliveryMode === 'pan-india';

  const isSweetsCategory =
    (forcedCategoryName || searchParams?.get('category') || '').toLowerCase().includes('sweet') ||
    (forcedCategoryName || searchParams?.get('category') || '').toLowerCase().includes('mithai');

  const [showPanIndiaSweetsAlert, setShowPanIndiaSweetsAlert] = useState(false);

  useEffect(() => {
    if (isDeliveryPanIndia && isSweetsCategory) {
      setShowPanIndiaSweetsAlert(true);
    }
  }, [isDeliveryPanIndia, isSweetsCategory]);

  // ── Sort / view state ──────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('name');
  const [gridCols, setGridCols] = useState<1 | 3 | 4>(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewOptions, setShowViewOptions] = useState(false);

  // ── Product / category data ────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // ── Subcategory hierarchy state ────────────────────────────────────────────
  const [categoryMeta, setCategoryMeta] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [childCategoryIds, setChildCategoryIds] = useState<string[]>([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Cached sorted list for current filter to allow instant infinite scrolling with image priority
  const allProductsRef = useRef<any[]>([]);

  // Version counter: prevents stale in-flight responses from overwriting correct data
  const fetchVersionRef = useRef(0);

  // Helper to determine if a product has a real, non-empty image
  const hasProductImage = (p: any) =>
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images.some((img: any) => typeof img === 'string' && img.trim() !== '');

  // ── Holi Special ───────────────────────────────────────────────────────────
  const isHoliSpecial =
    forcedCategoryName === HOLI_SPECIAL_CATEGORY ||
    searchParams?.get('category') === HOLI_SPECIAL_CATEGORY;

  const [activeHoliTab, setActiveHoliTab] = useState<string | null>(
    isHoliSpecial ? 'gujiya' : null
  );

  useEffect(() => {
    if (isHoliSpecial) {
      setActiveHoliTab(prev => prev ?? 'gujiya');
    } else {
      setActiveHoliTab(null);
    }
  }, [isHoliSpecial]);

  // ── Sync store selected category ───────────────────────────────────────────
  useEffect(() => {
    setSelectedCategory(forcedCategoryName || searchParams?.get('category') || 'All');
  }, [forcedCategoryId, forcedCategoryName, searchParams, setSelectedCategory]);

  // ── Fetch active category and its subcategories ────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    async function loadCategoryHierarchy() {
      let catId = forcedCategoryId || null;
      let catName = forcedCategoryName || '';
      let catDesc = forcedCategoryDescription || '';

      const catQP = searchParams?.get('category');

      // If category wasn't forced from server props, resolve from searchParams
      if (!catId && catQP && catQP !== 'All') {
        const decodedName = decodeURIComponent(catQP).replace(/[-+_]/g, ' ').trim();

        // Try by name
        const { data: byName } = await supabase
          .from('categories')
          .select('id, name, description')
          .ilike('name', decodedName)
          .eq('is_active', true)
          .maybeSingle();

        if (byName) {
          catId = byName.id;
          catName = byName.name;
          catDesc = byName.description || '';
        } else {
          // Try by slug
          const slugCandidate = decodedName.replace(/\s+/g, '-').toLowerCase();
          const { data: bySlug } = await supabase
            .from('categories')
            .select('id, name, description')
            .eq('slug', slugCandidate)
            .eq('is_active', true)
            .maybeSingle();
          if (bySlug) {
            catId = bySlug.id;
            catName = bySlug.name;
            catDesc = bySlug.description || '';
          }
        }
      }

      if (isCancelled) return;

      if (catId) {
        setCategoryMeta({ id: catId, name: catName, description: catDesc });

        try {
          // Fetch relationships to discover all child subcategories
          const rels = await fetchCategoryRelationships();
          const children = rels.filter(r => r.parent_id === catId).map(r => r.child_id);
          
          if (!isCancelled) {
            setChildCategoryIds(children);

            if (children.length > 0) {
              const { data: subCats } = await supabase
                .from('categories')
                .select('id, name, slug, description')
                .in('id', children)
                .eq('is_active', true)
                .order('name');

              if (!isCancelled && subCats) {
                const finalSubCats = (isDeliveryPanIndia && isSweetsCategory)
                  ? subCats.filter(s => {
                      const sSlug = (s.slug || '').toLowerCase();
                      const sName = (s.name || '').toLowerCase();
                      return !sSlug.includes('bengali') && !sSlug.includes('chena') && !sSlug.includes('chhena') &&
                             !sName.includes('bengali') && !sName.includes('chena') && !sName.includes('chhena');
                    })
                  : subCats;
                setSubcategories(finalSubCats);

                // If URL has ?subCategory=..., preselect it
                const subParam = searchParams?.get('subCategory');
                if (subParam) {
                  const match = finalSubCats.find(s => s.id === subParam || s.slug === subParam || s.name.toLowerCase() === subParam.toLowerCase());
                  if (match) setSelectedSubCategoryId(match.id);
                }
              }
            } else {
              setSubcategories([]);
              setSelectedSubCategoryId(null);
            }
          }
        } catch (err) {
          console.warn('Error loading subcategories:', err);
        }
      } else {
        setCategoryMeta(null);
        setSubcategories([]);
        setChildCategoryIds([]);
        setSelectedSubCategoryId(null);
      }
    }

    loadCategoryHierarchy();

    return () => {
      isCancelled = true;
    };
  }, [forcedCategoryId, forcedCategoryName, forcedCategoryDescription, searchParams]);

  // ── Core fetch products ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (pageNum: number) => {
    fetchVersionRef.current += 1;
    const myVersion = fetchVersionRef.current;

    if (pageNum === 1) setLoading(true);
    else setIsLoadingMore(true);

    try {
      // ── Holi Special: fetch by curated IDs ──────────────────────────────
      if (isHoliSpecial && activeHoliTab) {
        const activeTab = HOLI_TABS.find(t => t.id === activeHoliTab);
        if (activeTab) {
          const { data: settingsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', activeTab.settingKey)
            .maybeSingle();

          if (myVersion !== fetchVersionRef.current) return;

          const productIds: string[] = (settingsData?.value as any)?.product_ids || [];

          if (productIds.length === 0) {
            allProductsRef.current = [];
            setProducts([]);
            setTotalProducts(0);
            setHasMore(false);
            return;
          }

          const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name)')
            .in('id', productIds)
            .eq('is_active', true);

          if (error) throw error;
          if (myVersion !== fetchVersionRef.current) return;

          const ordered = productIds
            .map(id => data?.find((p: any) => p.id === id))
            .filter(Boolean) as any[];

          // Prioritize items with images first
          const sortedHoli = [...ordered].sort((a, b) => {
            const hasA = hasProductImage(a);
            const hasB = hasProductImage(b);
            if (hasA && !hasB) return -1;
            if (!hasA && hasB) return 1;
            return 0;
          });

          allProductsRef.current = sortedHoli;
          setProducts(sortedHoli.slice(0, 12));
          setTotalProducts(sortedHoli.length);
          setHasMore(sortedHoli.length > 12);
          return;
        }
      }

      // ── Normal: build query ───────────────────────────────────────────────
      const sortParam = searchParams?.get('sort') || sortBy;
      const catQP = searchParams?.get('category');

      let resolvedCatId: string | null = forcedCategoryId || categoryMeta?.id || null;

      if (!resolvedCatId && catQP && catQP !== 'All') {
        const decodedName = decodeURIComponent(catQP).replace(/[-+_]/g, ' ').trim();
        const { data: catRow } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', decodedName)
          .eq('is_active', true)
          .maybeSingle();
        if (myVersion !== fetchVersionRef.current) return;
        resolvedCatId = catRow?.id || null;
      }

      // On page 1: fetch all matching products for this category / subcategory
      // and sort strictly: [PRODUCTS WITH IMAGES FIRST] -> [PRODUCTS WITHOUT IMAGES]
      if (pageNum === 1) {
        let q = supabase
          .from('products')
          .select('*, categories(id, name)')
          .eq('is_active', true);

        if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);

        if (selectedSubCategoryId) {
          q = q.eq('category_id', selectedSubCategoryId);
        } else if (resolvedCatId) {
          if (childCategoryIds.length > 0) {
            const allIds = [resolvedCatId, ...childCategoryIds];
            q = q.in('category_id', allIds);
          } else {
            q = q.eq('category_id', resolvedCatId);
          }
        }

        const { data, error } = await q;
        if (error) throw error;
        if (myVersion !== fetchVersionRef.current) return;

        let rawList = data || [];
        if (isDeliveryPanIndia && isSweetsCategory) {
          rawList = rawList.filter((p: any) => !isBengaliSweetItem(p));
        }

        // Sort: Products WITH images ALWAYS first, then secondary sort
        const sorted = [...rawList].sort((a, b) => {
          const hasA = hasProductImage(a);
          const hasB = hasProductImage(b);
          if (hasA && !hasB) return -1;
          if (!hasA && hasB) return 1;

          // Within same image status, apply chosen sort criterion
          switch (sortParam) {
            case 'name-desc':
              return (b.name || '').localeCompare(a.name || '');
            case 'price-low':
              return (a.price || 0) - (b.price || 0);
            case 'price-high':
              return (b.price || 0) - (a.price || 0);
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'newest':
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            case 'bestseller':
              return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
            case 'name':
            default:
              return (a.name || '').localeCompare(b.name || '');
          }
        });

        allProductsRef.current = sorted;
        setTotalProducts(sorted.length);
        setProducts(sorted.slice(0, 12));
        setHasMore(sorted.length > 12);
      } else {
        // Page > 1: Load next slice from cached sorted list
        const nextBatchCount = pageNum * 12;
        const nextBatch = allProductsRef.current.slice(0, nextBatchCount);
        setProducts(nextBatch);
        setHasMore(nextBatch.length < allProductsRef.current.length);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      if (myVersion === fetchVersionRef.current) {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [
    forcedCategoryId,
    categoryMeta,
    selectedSubCategoryId,
    childCategoryIds,
    searchParams,
    searchTerm,
    sortBy,
    isHoliSpecial,
    activeHoliTab,
  ]);

  // ── Trigger fetch on dependencies change ───────────────────────────────────
  useEffect(() => {
    scrollToTopInstant();
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [fetchProducts]);

  // ── Subcategory Pill Click Handler ─────────────────────────────────────────
  const handleSubcategoryClick = (subId: string | null) => {
    setSelectedSubCategoryId(subId);
    setPage(1);
    setProducts([]);
    setHasMore(true);

    // Update URL shallowly without full refresh
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (subId) {
        const subObj = subcategories.find(s => s.id === subId);
        url.searchParams.set('subCategory', subObj?.slug || subObj?.name || subId);
      } else {
        url.searchParams.delete('subCategory');
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  // ── Infinite scroll ────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [page, hasMore, isLoadingMore, fetchProducts]);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore, loadMore]);

  const rawCategoryTitle =
    categoryMeta?.name ||
    forcedCategoryName ||
    (isHoliSpecial ? 'Holi Special Collection' : 'Our Sweets Collection');

  // Format title in clean Title Case (not forced uppercase)
  const formatCategoryTitle = (str: string) => {
    if (!str) return '';
    if (str === str.toUpperCase() && str !== str.toLowerCase()) {
      return str
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return str;
  };

  const activeCategoryTitle = formatCategoryTitle(rawCategoryTitle);

  const categoryDescFromData = categoryMeta?.description || forcedCategoryDescription;
  const displayDescription =
    categoryDescFromData ||
    (rawCategoryTitle.toLowerCase().includes('mithai') || rawCategoryTitle.toLowerCase().includes('sweet')
      ? "From India's finest mithai to timeless festive favourites, every order is packed with care to reach you fresh, wherever you are in the world. Authentic taste, delivered globally."
      : rawCategoryTitle.toLowerCase().includes('namkeen')
      ? "From classic crunchy mixtures to savoury festive favourites, every order is packed fresh with care to reach you crisp and flavorful."
      : "Handcrafted with pure ingredients and timeless recipes, prepared fresh with care to bring authentic sweetness and joy to every celebration.");

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col">

          {/* Minimal Brand Category Hero Section */}
          <div className="text-center max-w-2xl mx-auto pt-1 pb-1 mb-5 sm:mb-6">
            {/* Category Name in Brand Font - Compact & Elegant */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-orange-avenue font-normal text-[#2C1810] tracking-[0.06em] uppercase mb-1.5">
              {activeCategoryTitle}
            </h1>

            {/* Category Description - Compact */}
            {displayDescription && (
              <p className="text-[11px] sm:text-xs md:text-[13px] font-orange-avenue text-[#5D4037]/90 leading-relaxed max-w-lg mx-auto font-normal mb-2.5 sm:mb-3">
                {displayDescription}
              </p>
            )}

            {/* Minimal Trust & Quality Tags - Small & Subtle */}
            <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-1 font-orange-avenue text-[10px] sm:text-[11px] md:text-xs text-[#2C1810] tracking-wide">
              <span>Made fresh daily</span>
              <span className="text-[#B38B46]">·</span>
              <span>No preservatives</span>
              <span className="text-[#B38B46]">·</span>
              <span>Trusted by 10,000+ customers</span>
            </div>
          </div>

          {/* Minimal & Elegant Subcategory Pills Bar */}
          {subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar scroll-smooth justify-start sm:justify-center">
              {/* Minimal Maroon & Gold Filter Button */}
              <button
                onClick={() => setShowViewOptions(!showViewOptions)}
                className={`w-8 h-8 rounded-full ${
                  showViewOptions
                    ? 'bg-[#6B1D2F] text-[#FFFDF7] ring-1 ring-[#B38B46]'
                    : 'bg-[#4A1C1F] text-[#D4AF37]'
                } border border-[#B38B46]/50 hover:bg-[#5E1E22] flex items-center justify-center shadow-xs shrink-0 transition-transform active:scale-95`}
                title="Toggle Filters & View Options"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>

              {/* "All [Category Name]" Pill */}
              <button
                onClick={() => handleSubcategoryClick(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all shrink-0 ${
                  selectedSubCategoryId === null
                    ? 'bg-[#4A1C1F] text-[#FFFDF7] border border-[#B38B46]/60 shadow-xs'
                    : 'bg-white/80 text-[#5C4638] border border-[#D4C3A3]/50 hover:bg-[#F3EAD9] hover:text-[#4A1C1F]'
                }`}
              >
                All {categoryMeta?.name || 'Items'}
              </button>

              {/* Subcategory Pills */}
              {subcategories.map(sub => {
                const isActive = selectedSubCategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(sub.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#4A1C1F] text-[#FFFDF7] border border-[#B38B46]/60 shadow-xs'
                        : 'bg-white/80 text-[#5C4638] border border-[#D4C3A3]/50 hover:bg-[#F3EAD9] hover:text-[#4A1C1F]'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Holi Special Sub-Category Tabs (if on Holi Special) */}
          <AnimatePresence>
            {isHoliSpecial && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mb-6"
              >
                <div
                  className="flex items-center rounded-sm overflow-hidden"
                  style={{
                    border: '1px solid #D4C3A3',
                    background: '#FFFDF7',
                  }}
                >
                  {HOLI_TABS.map((tab, index) => (
                    <button
                      key={tab.id}
                      id={`holi-tab-${tab.id}`}
                      onClick={() => setActiveHoliTab(tab.id)}
                      className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs uppercase tracking-[0.15em] font-medium transition-colors"
                      style={{
                        color: activeHoliTab === tab.id ? '#FFFDF7' : '#783838',
                        background: activeHoliTab === tab.id ? '#4A1C1F' : 'transparent',
                        borderRight: index < HOLI_TABS.length - 1 ? '1px solid #D4C3A3' : 'none',
                      }}
                    >
                      <span className="text-xs">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal View & Sort Controls */}
          <div className="flex justify-between items-center mb-6 border-b border-[#D4C3A3]/25 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#8C7462] font-medium">
                {totalProducts} items available
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'text-[#4A1C1F] bg-[#EFE6D8]' : 'text-[#C4B29E] hover:text-[#4A1C1F]'}`}
                title="Small Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'text-[#4A1C1F] bg-[#EFE6D8]' : 'text-[#C4B29E] hover:text-[#4A1C1F]'}`}
                title="Standard Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setGridCols(1)}
                className={`p-1.5 rounded transition-colors ${gridCols === 1 ? 'text-[#4A1C1F] bg-[#EFE6D8]' : 'text-[#C4B29E] hover:text-[#4A1C1F]'}`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <motion.div
            className={`grid gap-6 ${
              gridCols === 4
                ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : gridCols === 3
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {loading && products.length === 0 ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-[#FAF9F6] border border-[#D4B6A2]/20 h-[250px] rounded-sm mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[#E5D8C6]/40 rounded w-3/4"></div>
                    <div className="h-3 bg-[#E5D8C6]/30 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {products.map((product: any, index) => (
                  <motion.div
                    key={product.id}
                    ref={index === products.length - 1 ? lastProductElementRef : null}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: product.images?.[0] || '/placeholder.svg',
                        slug: product.sku || product.id,
                        category: product.categories?.name || product.category?.name || 'General',
                      }}
                      onViewDetail={() => router.push(`/product/${product.sku || product.id}`)}
                      variant={gridCols === 1 ? 'list' : 'grid'}
                    />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          {/* Loading More Spinner */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B2131]"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && totalProducts === 0 && (
            <div className="text-center py-16 bg-[#FBF6EE] rounded-2xl border border-[#B38B46]/30 max-w-lg mx-auto shadow-sm p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#4A1C1F]/10 border border-[#B38B46]/40 flex items-center justify-center">
                <Filter className="w-6 h-6 text-[#B38B46]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4A1C1F] font-orange-avenue">No products in this selection</h3>
              <p className="text-sm text-[#684C3F] mt-2">
                {selectedSubCategoryId ? 'There are currently no products listed under this subcategory.' : 'Try selecting another category or clear filters.'}
              </p>
              {selectedSubCategoryId && (
                <Button
                  variant="outline"
                  onClick={() => handleSubcategoryClick(null)}
                  className="mt-5 border-[#B38B46] text-[#4A1C1F] hover:bg-[#4A1C1F] hover:text-[#FFFDF7] font-kugile tracking-wider uppercase text-xs"
                >
                  View All {activeCategoryTitle}
                </Button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Pan-India Bengali & Chena Sweets Restriction Alert Modal */}
      <AnimatePresence>
        {showPanIndiaSweetsAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-[#FFFDF7] border border-[#D4B6A2]/60 shadow-2xl rounded-2xl max-w-md w-full p-6 text-center space-y-4 relative"
            >
              <button
                onClick={() => setShowPanIndiaSweetsAlert(false)}
                className="absolute top-4 right-4 text-[#5D4037]/60 hover:text-[#2C1810] p-1.5 rounded-full hover:bg-[#E5D8C6]/20 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#B38B46]/15 flex items-center justify-center mx-auto text-[#B38B46]">
                <Package className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-orange-avenue uppercase tracking-[0.2em] text-[#B38B46] block mb-1">
                  Pan-India Freshness Notice
                </span>
                <h3 className="text-lg sm:text-xl font-orange-avenue text-[#2C1810] uppercase tracking-wide">
                  Bengali &amp; Chena Sweets Not Available
                </h3>
              </div>

              <p className="text-xs sm:text-[13px] text-[#5D4037]/90 font-orange-avenue leading-relaxed">
                Due to delicate cottage cheese preparation and limited shelf life, Bengali &amp; Chena sweets are exclusively delivered within Lucknow.
                <br /><br />
                For Pan-India delivery, please enjoy our traditional Pure Desi Ghee Mithai, Kaju specialities, Laddu, and festive gift boxes!
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => setShowPanIndiaSweetsAlert(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#B38B46] hover:bg-[#C59B55] text-[#2C1810] font-orange-avenue text-xs uppercase tracking-wider font-medium rounded-full shadow-sm transition-all cursor-pointer"
                >
                  Shop Pan-India Sweets
                </button>
                <button
                  onClick={() => {
                    setDeliveryMode('lucknow');
                    setShowPanIndiaSweetsAlert(false);
                    router.push('/category/sweets?delivery=lucknow');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 border border-[#B38B46]/60 text-[#2C1810] hover:bg-[#F3EAD9] font-orange-avenue text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  Switch to Lucknow
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
