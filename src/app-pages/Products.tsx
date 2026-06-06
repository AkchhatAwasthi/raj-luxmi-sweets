// @ts-nocheck

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, Cookie, Candy, LayoutGrid } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';

const HOLI_SPECIAL_CATEGORY = 'Holi Special';
const HOLI_TABS = [
  { id: 'gujiya', label: 'Gujiya', emoji: '🍮', settingKey: 'holi_gujiya_ids' },
  { id: 'namkeen', label: 'Namkeen', emoji: '🥨', settingKey: 'holi_namkeen_ids' },
];

interface ProductsProps {
  /** When set, products are filtered by this exact DB category_id.
   *  Passed from the server-rendered /category/[slug] page.
   *  When absent (e.g. /products page), URL query-param logic is used. */
  forcedCategoryId?: string;
  forcedCategoryName?: string;
}

const Products = ({ forcedCategoryId, forcedCategoryName }: ProductsProps = {}) => {
  const { setSelectedCategory } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Sort / view state ──────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('name');
  const [gridCols, setGridCols] = useState<1 | 3 | 4>(4);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Product / category data ────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Version counter: prevents stale in-flight responses from overwriting correct data
  const fetchVersionRef = useRef(0);

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
  }, [forcedCategoryId, forcedCategoryName, searchParams]);

  // ── Core fetch ─────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (pageNum: number) => {
    console.log('fetchProducts called', { forcedCategoryId, forcedCategoryName, searchParams: searchParams?.toString() });
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

          setProducts(ordered);
          setTotalProducts(ordered.length);
          setHasMore(false);
          return;
        }
      }

      // ── Normal: build query ───────────────────────────────────────────────
      const sortParam = searchParams?.get('sort') || sortBy;
      const catQP = searchParams?.get('category'); // e.g. from /products?category=Mithai

      // Resolve the category_id to filter by:
      // 1. forcedCategoryId (from server page) — highest priority
      // 2. ?category= query param — look it up by name
      let filterCategoryId: string | null = forcedCategoryId || null;

      if (!filterCategoryId && catQP && catQP !== 'All') {
        // 1️⃣ Try human‑readable name (e.g. "dry fruits")
        const decodedName = decodeURIComponent(catQP)
          .replace(/\+/g, ' ')   // plus signs → space
          .replace(/-/g, ' ')    // hyphens → space
          .replace(/_/g, ' ')    // underscores → space
          .replace(/\s+/g, ' ') // collapse multiple spaces
          .trim();
        const { data: catRowByName } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', decodedName)
          .eq('is_active', true)
          .maybeSingle();
        if (myVersion !== fetchVersionRef.current) return;
        if (catRowByName?.id) {
          filterCategoryId = catRowByName.id;
        } else {
          // 2️⃣ Fallback: treat the original param as a slug (replace spaces with hyphens)
          const slugCandidate = decodedName.replace(/\s+/g, '-').toLowerCase();
          const { data: catRowBySlug } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', slugCandidate)
            .eq('is_active', true)
            .maybeSingle();
          if (myVersion !== fetchVersionRef.current) return;
          filterCategoryId = catRowBySlug?.id || null;
        }
      }

      // Count query
      let countQ = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (searchTerm) countQ = countQ.ilike('name', `%${searchTerm}%`);
      if (filterCategoryId) countQ = countQ.eq('category_id', filterCategoryId);

      const { count } = await countQ;
      if (myVersion !== fetchVersionRef.current) return;
      setTotalProducts(count || 0);

      // Data query
      let q = supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('is_active', true)
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      if (searchTerm) q = q.ilike('name', `%${searchTerm}%`);
      if (filterCategoryId) q = q.eq('category_id', filterCategoryId);

      switch (sortParam) {
        case 'name-desc': q = q.order('name', { ascending: false }); break;
        case 'price-low': q = q.order('price', { ascending: true }); break;
        case 'price-high': q = q.order('price', { ascending: false }); break;
        case 'rating': q = q.order('rating', { ascending: false }); break;
        case 'newest': q = q.order('created_at', { ascending: false }); break;
        case 'bestseller': q = q.order('is_bestseller', { ascending: false }); break;
        default: q = q.order('name', { ascending: true });
      }

      const { data, error } = await q;
      if (error) throw error;
      if (myVersion !== fetchVersionRef.current) return;

      if (pageNum === 1) setProducts(data || []);
      else setProducts(prev => [...prev, ...(data || [])]);

      setHasMore((data?.length ?? 0) === 10);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      if (myVersion === fetchVersionRef.current) {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [forcedCategoryId, searchParams, searchTerm, sortBy, isHoliSpecial, activeHoliTab]);

  // ── Trigger fetch whenever key deps change ─────────────────────────────────
  useEffect(() => {
    scrollToTopInstant();
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [fetchProducts]);

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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-orange-avenue font-normal text-[#2C1810] mb-10 mt-4 uppercase tracking-wider text-left border-b border-[#D4C3A3]/30 pb-6">
              {forcedCategoryName
                ? forcedCategoryName
                : isHoliSpecial
                  ? 'Holi Special Collection'
                  : 'Our Sweets Collection'}
            </h1>

            {/* Holi Special Sub-Category Tabs */}
            <AnimatePresence>
              {isHoliSpecial && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="mb-8"
                >
                  <div
                    className="flex items-center"
                    style={{
                      border: '1px solid #D4C3A3',
                      background: '#FFFDF7',
                      boxShadow: '0 2px 12px rgba(139, 33, 49, 0.07)',
                    }}
                  >
                    {HOLI_TABS.map((tab, index) => (
                      <button
                        key={tab.id}
                        id={`holi-tab-${tab.id}`}
                        onClick={() => setActiveHoliTab(tab.id)}
                        className="relative flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300"
                        style={{
                          color: activeHoliTab === tab.id ? '#FFFDF7' : '#783838',
                          background: activeHoliTab === tab.id ? '#8B2131' : 'transparent',
                          borderRight: index < HOLI_TABS.length - 1 ? '1px solid #D4C3A3' : 'none',
                          letterSpacing: '0.18em',
                        }}
                      >
                        <span className="text-sm">{tab.emoji}</span>
                        <span>{tab.label}</span>
                        {activeHoliTab === tab.id && (
                          <motion.span
                            layoutId="holi-tab-underline"
                            className="absolute bottom-0 left-0 right-0 h-[2px]"
                            style={{ background: '#D4C3A3' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <motion.p
                    key={activeHoliTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-center mt-3 text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: '#9B4E4E' }}
                  >
                    {activeHoliTab
                      ? `Showing ${HOLI_TABS.find(t => t.id === activeHoliTab)?.label} collection`
                      : ''}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Controls */}
            <div className="flex justify-between items-center mb-6 border-b border-[#D4C3A3]/30 pb-4">
              <div className="flex justify-end w-full lg:w-auto items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9B4E4E] font-medium hidden sm:block font-inter">View Options</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-2 transition-colors ${gridCols === 4 ? 'text-[#8B2131] bg-[#F9F3EA]' : 'text-[#D4C3A3] hover:text-[#8B2131]'}`}
                    title="Small Grid"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-2 transition-colors ${gridCols === 3 ? 'text-[#8B2131] bg-[#F9F3EA]' : 'text-[#D4C3A3] hover:text-[#8B2131]'}`}
                    title="Grid"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridCols(1)}
                    className={`p-2 transition-colors ${gridCols === 1 ? 'text-[#8B2131] bg-[#F9F3EA]' : 'text-[#D4C3A3] hover:text-[#8B2131]'}`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <motion.div
              className={`grid gap-6 ${gridCols === 4 ? 'grid-cols-2 lg:grid-cols-4' :
                gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1'
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {loading && products.length === 0 ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted h-[250px] rounded-sm mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {products.map((product: any, index) => (
                    <motion.div
                      key={product.id}
                      ref={index === products.length - 1 ? lastProductElementRef : null}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          image: product.images?.[0] || '/placeholder.svg',
                          slug: product.sku || product.id,
                          category: product.categories?.name || product.category?.name || 'General'
                        }}
                        onViewDetail={() => router.push(`/product/${product.sku || product.id}`)}
                        variant={gridCols === 1 ? 'list' : 'grid'}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && totalProducts === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-border/50">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                <Button
                  variant="link"
                  onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                  className="mt-4 text-primary"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
