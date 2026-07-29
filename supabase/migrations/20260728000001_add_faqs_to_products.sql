-- Add faqs column to products table if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.faqs IS 'Array of JSON objects containing question and answer pairs for product FAQs.';
