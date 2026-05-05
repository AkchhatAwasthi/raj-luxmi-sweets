-- Add SEO fields to products table
-- These are optional fields. If left empty, page.tsx auto-generates
-- meta tags from the product name and description as a fallback.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS meta_title       TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_keywords    TEXT DEFAULT NULL;

-- Helpful comment indexes if you want to search by meta later
COMMENT ON COLUMN products.meta_title       IS 'Custom Google title (max 60 chars). Falls back to product name if empty.';
COMMENT ON COLUMN products.meta_description IS 'Custom Google description (max 160 chars). Falls back to product description if empty.';
COMMENT ON COLUMN products.meta_keywords    IS 'Comma-separated keywords e.g. "kaju katli, mithai, diwali sweets"';
