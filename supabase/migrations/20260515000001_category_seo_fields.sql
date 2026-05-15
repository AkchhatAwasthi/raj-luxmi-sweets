-- Add SEO fields + URL slug to categories
-- Mirrors the pattern used for products (meta_title, meta_description, meta_keywords)

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug             TEXT,
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords    TEXT;

-- Back-fill slugs from existing category names
-- e.g. "Holi Special" → "holi-special"
UPDATE public.categories
SET slug = LOWER(REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Ensure slug is unique (for SEO-safe URLs)
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON public.categories (slug);
