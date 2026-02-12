import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  features: string[];
  rating: number;
  inStock: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  sortBy: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  categories: string[];
  selectedFilters?: Partial<ProductFilters>;
  className?: string;
}

const ProductFiltersComponent = ({ onFiltersChange, categories, selectedFilters = {}, className = "" }: ProductFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 10000],
    features: [],
    rating: 0,
    inStock: false,
    isBestseller: false,
    isNewArrival: false,
    sortBy: 'name',
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // Sync internal state with external selectedFilters
  useEffect(() => {
    if (selectedFilters && Object.keys(selectedFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...selectedFilters
      }));
    } else {
      // If explicitly passed an empty object or null, we might want to reset,
      // BUT typically this prop is used to "push" state from URL.
      // We will assume if specific keys are passed, we sync them.
      // For resetting categories specifically from "All" button:
      if (selectedFilters && selectedFilters.categories) {
        setFilters(prev => ({ ...prev, categories: selectedFilters.categories! }));
      }
    }
  }, [selectedFilters]);

  useEffect(() => {
    fetchAvailableFeatures();
  }, []);

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to comprehensive default features
      setAvailableFeatures([
        'Bulk Pack',
        'Wholesale Price',
        'Commercial Grade',
        'Energy Efficient',
        'Eco Friendly',
        'Premium Quality',
        'Fast Delivery',
        'Bulk Discount Available',
        'Restaurant Grade',
        'Long Shelf Life',
        'Temperature Controlled',
        'Quality Certified',
        'Hygienically Packed',
        'Antibiotic Free',
        'Organic',
        'Gluten Free',
        'Vegan',
        'Non-GMO',
        'Recyclable Packaging',
        'Made in India'
      ]);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const clearAllFilters = () => {
    const clearedFilters: ProductFilters = {
      categories: [],
      priceRange: [0, 10000],
      features: [],
      rating: 0,
      inStock: false,
      isBestseller: false,
      isNewArrival: false,
      sortBy: 'name',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.isBestseller) count++;
    if (filters.isNewArrival) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-6 pt-2`}>

        {/* Clear Filters (Text Link) */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearAllFilters}
              className="text-[10px] text-[#8B2131] hover:underline uppercase tracking-widest font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Availability */}
        <div className="border-b border-[#E6D5B8]/40 pb-5">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group py-1 cursor-pointer">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#2C1810]">Availability</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2C1810] transition-transform duration-300 group-data-[state=open]:rotate-180 opacity-60" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => updateFilters({ inStock: !!checked })}
                  className="w-4 h-4 rounded-none border-[#2C1810]/40 data-[state=checked]:bg-[#2C1810] data-[state=checked]:border-[#2C1810] data-[state=checked]:text-white"
                />
                <label htmlFor="in-stock" className="text-sm font-light text-[#5D4037] cursor-pointer hover:text-[#2C1810] transition-colors">
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="bestseller"
                  checked={filters.isBestseller}
                  onCheckedChange={(checked) => updateFilters({ isBestseller: !!checked })}
                  className="w-4 h-4 rounded-none border-[#2C1810]/40 data-[state=checked]:bg-[#2C1810] data-[state=checked]:border-[#2C1810] data-[state=checked]:text-white"
                />
                <label htmlFor="bestseller" className="text-sm font-light text-[#5D4037] cursor-pointer hover:text-[#2C1810] transition-colors">
                  Bestsellers Only
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="new-arrival"
                  checked={filters.isNewArrival}
                  onCheckedChange={(checked) => updateFilters({ isNewArrival: !!checked })}
                  className="w-4 h-4 rounded-none border-[#2C1810]/40 data-[state=checked]:bg-[#2C1810] data-[state=checked]:border-[#2C1810] data-[state=checked]:text-white"
                />
                <label htmlFor="new-arrival" className="text-sm font-light text-[#5D4037] cursor-pointer hover:text-[#2C1810] transition-colors">
                  New Arrivals
                </label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Price */}
        <div className="border-b border-[#E6D5B8]/40 pb-5">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group py-1 cursor-pointer">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#2C1810]">Price</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2C1810] transition-transform duration-300 group-data-[state=open]:rotate-180 opacity-60" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-5 px-1">
              <div className="space-y-6">
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#5D4037] font-medium">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Filter By Product Type (Categories) */}
        <div className="border-b border-[#E6D5B8]/40 pb-5">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full group py-1 cursor-pointer">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#2C1810]">Filter by Product Type</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2C1810] transition-transform duration-300 group-data-[state=open]:rotate-180 opacity-60" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              {categories.filter(c => c !== 'All').map((category) => (
                <div key={category} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded-none border-[#2C1810]/40 data-[state=checked]:bg-[#2C1810] data-[state=checked]:border-[#2C1810] data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-light text-[#5D4037] cursor-pointer hover:text-[#2C1810] transition-colors"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Highlights (Features) */}
        <div className="border-b border-[#E6D5B8]/40 pb-5">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full group py-1 cursor-pointer">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#2C1810]">Highlights</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2C1810] transition-transform duration-300 group-data-[state=open]:rotate-180 opacity-60" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                      className="w-4 h-4 rounded-none border-[#2C1810]/40 data-[state=checked]:bg-[#2C1810] data-[state=checked]:border-[#2C1810] data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="text-sm font-light text-[#5D4037] cursor-pointer hover:text-[#2C1810] transition-colors"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

      </div>
    </div>
  );
};

export default ProductFiltersComponent;