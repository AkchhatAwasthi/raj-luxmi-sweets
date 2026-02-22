import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, Search, Cookie, X, Candy, ChevronLeft, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import ProductFiltersComponent, { ProductFilters } from '../components/ProductFilters';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { scrollToTopInstant } from '@/utils/scrollToTop';
import { Button } from '@/components/ui/button';

const HOLI_SPECIAL_CATEGORY = 'Holi Special';
const HOLI_TABS = [
  { id: 'gujiya', label: 'Gujiya', emoji: '🍮', settingKey: 'holi_gujiya_ids' },
  { id: 'namkeen', label: 'Namkeen', emoji: '🥨', settingKey: 'holi_namkeen_ids' },
];

const Products = () => {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('name');
  const [gridCols, setGridCols] = useState<1 | 3 | 4>(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeHoliTab, setActiveHoliTab] = useState<string | null>(null);

  // Determine if we're on the Holi Special page
  const isHoliSpecial = useMemo(() => {
    const categoryParam = searchParams.get('category');
    return categoryParam === HOLI_SPECIAL_CATEGORY;
  }, [searchParams]);

  // Calculate initial filters from URL params to prevent flash
  const initialFilters = useMemo(() => {
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    return {
      categories: categoryParam && categoryParam !== 'All' ? [categoryParam] : [],
      priceRange: [0, 10000] as [number, number],
      features: [],
      rating: 0,
      inStock: false,
      isBestseller: sortParam === 'bestseller',
      isNewArrival: sortParam === 'newest',
      sortBy: sortParam || 'name',
    };
  }, []); // Empty deps - only run on mount

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Initial data fetch
  useEffect(() => {
    fetchCategories();

    // Set initial category from URL on mount
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'All') {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, []);

  // Sync state with URL params
  // Sync state with URL params
  useEffect(() => {
    scrollToTopInstant();
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    const newFilters: Partial<ProductFilters> = {};
    let shouldUpdateFilters = false;

    if (categoryParam && categoryParam !== 'All') {
      // If URL has a specific category, enforce it
      setSelectedCategory(categoryParam);
      newFilters.categories = [categoryParam];
      shouldUpdateFilters = true;
    } else if (!categoryParam || categoryParam === 'All') {
      // Only clear if we really want to reset (e.g. Nav "All Products")
      // But we need to be careful not to overwrite if we are just changing sort
      // Actually, if category is missing, we usually default to All.
      // But if we are deep linking to ?sort=newest without category, we imply All.
      if (selectedCategory !== 'All') {
        setSelectedCategory('All');
        newFilters.categories = [];
        shouldUpdateFilters = true;
      }
    }

    if (sortParam) {
      newFilters.sortBy = sortParam;
      shouldUpdateFilters = true;

      // Automatically check checkboxes based on sort/nav
      if (sortParam === 'bestseller') {
        newFilters.isBestseller = true;
      }
      if (sortParam === 'newest') {
        newFilters.isNewArrival = true;
      }
    }

    if (shouldUpdateFilters) {
      setFilters(prev => ({
        ...prev,
        ...newFilters
      }));
    }

    // We don't call fetchProducts here because updating filters will trigger the other useEffect
  }, [searchParams]);

  // Auto-select first Holi tab when entering Holi Special page, reset when leaving
  useEffect(() => {
    if (isHoliSpecial) {
      // Default to gujiya tab if no tab is active
      setActiveHoliTab(prev => prev ?? 'gujiya');
    } else {
      setActiveHoliTab(null);
    }
  }, [isHoliSpecial]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    fetchProducts(1);
  }, [searchTerm, filters, activeHoliTab]); // Removed selectedCategory - it's already in filters.categories

  const fetchProducts = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // ── Holi tab active: fetch by curated product IDs from settings ──────
      if (isHoliSpecial && activeHoliTab) {
        const activeTab = HOLI_TABS.find(t => t.id === activeHoliTab);
        if (activeTab) {
          const { data: settingsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', activeTab.settingKey)
            .maybeSingle();

          const productIds: string[] = (settingsData?.value as any)?.product_ids || [];

          if (productIds.length === 0) {
            setProducts([]);
            setTotalProducts(0);
            setHasMore(false);
            return;
          }

          const { data, error } = await supabase
            .from('products')
            .select(`*, categories(id, name)`)
            .in('id', productIds)
            .eq('is_active', true);

          if (error) throw error;

          // Preserve the admin-defined order
          const ordered = productIds
            .map(id => data?.find((p: any) => p.id === id))
            .filter(Boolean) as any[];

          setProducts(pageNum === 1 ? ordered : prev => [...prev, ...ordered]);
          setTotalProducts(ordered.length);
          setHasMore(false); // curated lists show all at once
          return;
        }
      }

      // ── Normal filtering (non-Holi tab) ──────────────────────────────────
      // First, get the total count
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (searchTerm) {
        countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      }

      if (filters && filters.categories.length > 0) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .in('name', filters.categories);

        if (categoryData && categoryData.length > 0) {
          countQuery = countQuery.in('category_id', categoryData.map(c => c.id));
        }
      }

      if (filters.priceRange[0] > 0) countQuery = countQuery.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 10000) countQuery = countQuery.lte('price', filters.priceRange[1]);
      if (filters.inStock) countQuery = countQuery.gt('stock_quantity', 0);
      if (filters.isBestseller) countQuery = countQuery.eq('is_bestseller', true);
      if (filters.isNewArrival) countQuery = countQuery.eq('new_arrival', true);

      const { count, error: countError } = await countQuery;
      if (!countError) setTotalProducts(count || 0);

      // Now fetch the paginated data
      let query = supabase
        .from('products')
        .select(`*, categories(id, name)`)
        .eq('is_active', true)
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);

      if (filters && filters.categories.length > 0) {
        const { data: categoryData } = await supabase.from('categories').select('id').in('name', filters.categories);
        if (categoryData && categoryData.length > 0) query = query.in('category_id', categoryData.map(c => c.id));
      }

      if (filters.priceRange[0] > 0) query = query.gte('price', filters.priceRange[0]);
      if (filters.priceRange[1] < 10000) query = query.lte('price', filters.priceRange[1]);
      if (filters.inStock) query = query.gt('stock_quantity', 0);
      if (filters.isBestseller) query = query.eq('is_bestseller', true);
      if (filters.isNewArrival) query = query.eq('new_arrival', true);

      const sortOption = filters.sortBy || sortBy;
      switch (sortOption) {
        case 'name-desc': query = query.order('name', { ascending: false }); break;
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'bestseller': query = query.order('is_bestseller', { ascending: false }); break;
        default: query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (pageNum === 1) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
      }

      setHasMore(data?.length === 10);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true);

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const sortedProducts = products;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [page, hasMore, isLoadingMore]);

  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isLoadingMore, hasMore, loadMore]);

  const getCategoryIcon = (category: string) => {
    if (category === 'Mithai') return <Candy className="w-4 h-4" />;
    return <Cookie className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-muted/30 relative">

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div
            className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-primary" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ProductFiltersComponent
                onFiltersChange={setFilters}
                categories={categories}
                selectedFilters={filters}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar (Left) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFiltersComponent
                onFiltersChange={setFilters}
                categories={categories}
                selectedFilters={filters}
              />
            </div>
          </aside>

          {/* Product Grid Area (Right/Center) */}
          <div className="flex-1">

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
                  {/* Tab bar — royal maroon/gold theme */}
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
                        {/* Active underline accent */}
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

                  {/* Subtle label */}
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

            {/* View Controls - Minimalist & Royal Font */}
            <div className="flex justify-between items-center mb-6 border-b border-[#D4C3A3]/30 pb-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" /> Filters
              </Button>

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

            {/* Grid */}
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
                  {sortedProducts.map((product: any, index) => (
                    <motion.div
                      key={product.id}
                      ref={index === sortedProducts.length - 1 ? lastProductElementRef : null}
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
                        onViewDetail={() => navigate(`/product/${product.sku || product.id}`)}
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