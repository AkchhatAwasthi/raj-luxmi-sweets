-- =====================================================
-- CATEGORY RELATIONSHIPS (MANY-TO-MANY HIERARCHY)
-- Allows subcategories to belong to multiple main categories
-- or other subcategories, supporting arbitrary nesting.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.category_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_id, child_id),
  CONSTRAINT chk_no_self_parent CHECK (parent_id <> child_id)
);

-- Indexes for lightning-fast lookups
CREATE INDEX IF NOT EXISTS idx_cat_rel_parent ON public.category_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_cat_rel_child ON public.category_relationships(child_id);

-- Enable Row Level Security
ALTER TABLE public.category_relationships ENABLE ROW LEVEL SECURITY;

-- Everyone can read category relationships for navigation & storefront
CREATE POLICY "category_relationships_select_all" 
  ON public.category_relationships 
  FOR SELECT 
  USING (true);

-- Authenticated users / Admins can manage relationships
CREATE POLICY "category_relationships_admin_all" 
  ON public.category_relationships 
  FOR ALL 
  USING (public.is_admin() OR auth.role() = 'authenticated');
