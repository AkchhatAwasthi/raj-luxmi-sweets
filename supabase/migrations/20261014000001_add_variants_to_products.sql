-- Add variants column to products table if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.variants IS 'Array of JSON objects representing product variants: [{"id": "var_1", "title": "500g", "price": 450, "original_price": 500, "weight": "500g", "pieces": "16 pcs", "stock_quantity": 50, "sku": "...", "is_default": true}]';
