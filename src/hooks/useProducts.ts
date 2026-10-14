'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  weight?: string | null;
  pieces?: string | null;
  stock_quantity?: number | null;
  sku?: string | null;
  is_default?: boolean | null;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  category_id?: string | null;
  weight?: string | null;
  pieces?: string | null;
  serves?: number | null;
  storage_instructions?: string | null;
  description?: string | null;
  stock_quantity?: number | null;
  is_active?: boolean | null;
  is_bestseller?: boolean | null;
  new_arrival?: boolean | null;
  images?: string[] | null;
  sku?: string | null;
  features?: any;
  categories?: {
    name: string;
  } | null;
  variants?: ProductVariant[] | null;
  [key: string]: any;
}

const hasProductImage = (p: ProductItem): boolean => {
  return (
    Array.isArray(p.images) &&
    p.images.length > 0 &&
    p.images.some(img => typeof img === 'string' && img.trim() !== '')
  );
};

async function fetchActiveProducts(): Promise<ProductItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const items: ProductItem[] = (data as any) ?? [];

  // Always prioritize products with images first
  return items.sort((a, b) => {
    const hasA = hasProductImage(a);
    const hasB = hasProductImage(b);
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;
    return 0;
  });
}

const EMPTY_PRODUCTS: ProductItem[] = [];

export const useProducts = () => {
  const { data, isLoading, error, refetch } = useQuery<ProductItem[], Error>({
    queryKey: ['active_products'],
    queryFn: fetchActiveProducts,
    staleTime: 5 * 60 * 1000, // Cache valid for 5 minutes
    gcTime: 10 * 60 * 1000,    // Keep in cache for 10 minutes
    retry: 1,
  });

  const products = data ?? EMPTY_PRODUCTS;

  const bestSellers = React.useMemo(
    () => products.filter(p => p.is_bestseller === true),
    [products]
  );
  const newArrivals = React.useMemo(
    () => products.filter(p => p.new_arrival === true),
    [products]
  );

  return {
    products,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    // Helper filtered lists
    bestSellers,
    newArrivals,
  };
};

export default useProducts;
