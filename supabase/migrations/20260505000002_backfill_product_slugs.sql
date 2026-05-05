-- Backfill SKU slugs for products that currently have no SKU.
-- Converts the product name into a URL-friendly slug:
--   "Kaju Katli (500g)" → "kaju-katli-500g"
-- A numeric suffix is added on conflicts to keep slugs unique.

-- Step 1: Generate a slug from the product name for products with no SKU
UPDATE products
SET sku = regexp_replace(
            regexp_replace(
              regexp_replace(
                lower(trim(name)),
                '[^\w\s-]', '', 'g'   -- remove special chars
              ),
              '[\s_]+', '-', 'g'      -- spaces/underscores → hyphens
            ),
            '-+', '-', 'g'            -- collapse multiple hyphens
          )
WHERE (sku IS NULL OR sku = '');

-- Step 2: Resolve any duplicates by appending the first 6 chars of the ID
-- (only affects products that ended up with the same slug)
UPDATE products p
SET sku = p.sku || '-' || substring(p.id::text, 1, 6)
WHERE p.id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY sku ORDER BY created_at) AS rn
    FROM products
    WHERE sku IS NOT NULL AND sku != ''
  ) sub
  WHERE rn > 1
);
