'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean | null;
}

// ---------------------------------------------------------------------------
// Standalone fetch function — extracted so it can be used by useQuery.
// React Query deduplicates all simultaneous callers sharing the key
// ('categories'), so Header + SearchSidebar + CategoriesCarousel all mount
// at the same time but only ONE network request is made.
// ---------------------------------------------------------------------------
async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// useCategories — backed by React Query.
// Cache is valid for 10 minutes; categories change rarely.
// ---------------------------------------------------------------------------
export const useCategories = () => {
  const { data, isLoading, error, refetch } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,  // 10 minutes — categories change rarely
    gcTime: 15 * 60 * 1000,     // keep in cache 15 minutes after last use
    retry: 1,
    placeholderData: [],
  });

  return {
    categories: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export default useCategories;
