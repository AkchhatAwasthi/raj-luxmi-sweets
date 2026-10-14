'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchCategoryRelationships,
  buildCategoryTree,
  CategoryTreeItem,
  CategoryRelationship,
} from '@/lib/categoryHierarchy';

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean | null;
  parent_ids?: string[];
  parents?: Category[];
  subcategories?: Category[];
}

const EMPTY_ARRAY: any[] = [];
const EMPTY_RECORD: Record<string, any> = {};

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
  });

  return {
    categories: data ?? EMPTY_ARRAY,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

// ---------------------------------------------------------------------------
// useCategoryTree — fetches categories and their many-to-many relationships
// ---------------------------------------------------------------------------
export const useCategoryTree = () => {
  const { data, isLoading, error, refetch } = useQuery<{
    allWithMeta: CategoryTreeItem[];
    rootCategories: CategoryTreeItem[];
    subcategoriesList: CategoryTreeItem[];
    subcategoriesByParentId: Record<string, CategoryTreeItem[]>;
    parentsByChildId: Record<string, CategoryTreeItem[]>;
    relationships: CategoryRelationship[];
  }, Error>({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      const [categories, relationships] = await Promise.all([
        fetchCategories(),
        fetchCategoryRelationships(),
      ]);

      const tree = buildCategoryTree(categories, relationships);
      return {
        ...tree,
        relationships,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    categories: data?.allWithMeta ?? EMPTY_ARRAY,
    rootCategories: data?.rootCategories ?? EMPTY_ARRAY,
    subcategories: data?.subcategoriesList ?? EMPTY_ARRAY,
    subcategoriesByParentId: data?.subcategoriesByParentId ?? EMPTY_RECORD,
    parentsByChildId: data?.parentsByChildId ?? EMPTY_RECORD,
    relationships: data?.relationships ?? EMPTY_ARRAY,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export default useCategories;
