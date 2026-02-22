-- =====================================================
-- MIGRATION: Switch Payment Gateway from Razorpay to Cashfree
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Add Cashfree payment ID columns to orders table
--    (IF NOT EXISTS means it's safe to run multiple times)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cf_order_id TEXT,
  ADD COLUMN IF NOT EXISTS cf_payment_id TEXT;

-- 2. Add index for fast lookups by Cashfree payment ID
CREATE INDEX IF NOT EXISTS idx_orders_cf_payment_id
  ON public.orders(cf_payment_id)
  WHERE cf_payment_id IS NOT NULL;

-- 3. Add cashfree_enabled setting to the settings table
--    ON CONFLICT (key) means it's safe to run multiple times
INSERT INTO public.settings (key, value, description, category, is_public)
VALUES ('cashfree_enabled', 'true', 'Enable Cashfree payments', 'payment', false)
ON CONFLICT (key) DO UPDATE SET value = 'true';

-- 4. Disable old razorpay_enabled setting
--    We keep the row so existing admin panels don't crash,
--    but set it to false so online checkout shows Cashfree
UPDATE public.settings
SET value = 'false'
WHERE key = 'razorpay_enabled';

-- 5. Verify changes (optional - you can remove these lines)
-- SELECT key, value FROM public.settings WHERE category = 'payment';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('cf_order_id', 'cf_payment_id', 'razorpay_order_id', 'razorpay_payment_id');

-- =====================================================
-- DONE! What was changed:
--   ✅ orders table: new cf_order_id and cf_payment_id columns added
--   ✅ settings: cashfree_enabled = true
--   ✅ settings: razorpay_enabled = false
--   ✅ The old razorpay_order_id / razorpay_payment_id columns are
--      kept in place (won't cause errors for existing orders)
-- =====================================================
