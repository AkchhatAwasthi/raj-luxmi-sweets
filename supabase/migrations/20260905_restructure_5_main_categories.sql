-- =========================================================================
-- RAJ LUXMI SWEETS - 5-PILLAR CATEGORY HIERARCHY RESTRUCTURING
-- Run this script in Supabase Dashboard -> SQL Editor
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. DELETE THE 4 UNWANTED CATEGORIES & THEIR PRODUCTS (AS REQUESTED)
-- -------------------------------------------------------------------------
-- Delete products in Dhokla, Drinks, Maida Sweets, Petha Sweet
DELETE FROM public.products 
WHERE category_id IN (
  SELECT id FROM public.categories 
  WHERE name ILIKE '%Dhokla%' 
     OR name ILIKE '%Drinks%' 
     OR name ILIKE '%Maida Sweets%' 
     OR name ILIKE '%Petha Sweet%'
);

-- Delete the categories themselves
DELETE FROM public.categories 
WHERE name ILIKE '%Dhokla%' 
   OR name ILIKE '%Drinks%' 
   OR name ILIKE '%Maida Sweets%' 
   OR name ILIKE '%Petha Sweet%';


-- -------------------------------------------------------------------------
-- 2. CREATE PRIMARY MAIN CATEGORIES IF NOT ALREADY PRESENT
-- -------------------------------------------------------------------------

-- A. Sweets
INSERT INTO public.categories (name, slug, description, is_active, meta_title, meta_description)
SELECT 
  'Sweets', 
  'sweets', 
  'Handcrafted traditional Indian sweets, pure desi ghee mithai, and authentic royal delicacies', 
  true,
  'Traditional Indian Sweets & Mithai Online | Raj Luxmi',
  'Explore authentic traditional Indian sweets made with pure desi ghee and highest quality ingredients.'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sweets');

-- B. Gifting
INSERT INTO public.categories (name, slug, description, is_active, meta_title, meta_description)
SELECT 
  'Gifting', 
  'gifting', 
  'Thoughtfully curated luxury gift hampers, festive platters, and celebration boxes', 
  true,
  'Luxury Gift Hampers & Celebration Boxes | Raj Luxmi',
  'Shop luxury festive hampers, dry fruit platters, and custom gift boxes for weddings and celebrations.'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'gifting');

-- C. Festive
INSERT INTO public.categories (name, slug, description, is_active, meta_title, meta_description)
SELECT 
  'Festive', 
  'festive', 
  'Celebratory seasonal mithai, modak sweets, gajak, and traditional festive specials', 
  true,
  'Festive Sweets & Seasonal Mithai | Raj Luxmi',
  'Celebrate Indian festivals with authentic seasonal sweets, modaks, gajak, and treats.'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'festive');


-- -------------------------------------------------------------------------
-- 3. CREATE NEW SUBCATEGORIES FOR GIFTING
-- -------------------------------------------------------------------------

-- Dry Fruit Tray
INSERT INTO public.categories (name, slug, description, is_active)
SELECT 
  'Dry Fruit Tray', 
  'dry-fruit-tray', 
  'Exquisite dry fruit trays, platters, and luxury assortments', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'dry-fruit-tray');

-- Thal Box
INSERT INTO public.categories (name, slug, description, is_active)
SELECT 
  'Thal Box', 
  'thal-box', 
  'Traditional handcrafted festive thal boxes and ceremonial packaging', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'thal-box');


-- -------------------------------------------------------------------------
-- 4. RENAME SUBCATEGORIES ACCORDING TO SPECIFICATION
-- -------------------------------------------------------------------------

-- Bengali Sweets -> Bengali Chhena Sweets
UPDATE public.categories 
SET name = 'Bengali Chhena Sweets', slug = 'bengali-chhena-sweets'
WHERE slug = 'bengali-sweets' OR name ILIKE '%Bengali Sweets%';

-- EXCLUSIVE BAKLAVA -> Mewa Bites & Baklava
UPDATE public.categories 
SET name = 'Mewa Bites & Baklava', slug = 'mewa-bites-baklava'
WHERE slug = 'exclusive-baklava' OR name ILIKE '%BAKLAVA%';

-- Baina Bhaji -> Bhayana Bhaji
UPDATE public.categories 
SET name = 'Bhayana Bhaji', slug = 'bhayana-bhaji'
WHERE slug = 'baina-bhaji' OR name ILIKE '%Baina Bhaji%';

-- Gajak Sweet -> Gajak Sweets
UPDATE public.categories 
SET name = 'Gajak Sweets', slug = 'gajak-sweets'
WHERE slug = 'gajak-sweet' OR name ILIKE '%Gajak Sweet%';

-- Subh Mangalwar -> Shubh Mangalwar
UPDATE public.categories 
SET name = 'Shubh Mangalwar', slug = 'shubh-mangalwar'
WHERE slug = 'subh-mangalwar' OR name ILIKE '%Subh Mangalwar%';


-- -------------------------------------------------------------------------
-- 5. SAFELY MERGE PRODUCTS BETWEEN CATEGORIES
-- -------------------------------------------------------------------------

-- A. Merge Milk Sweets -> Khoya Sweets
DO $$
DECLARE
  v_khoya_id UUID;
  v_milk_id UUID;
BEGIN
  SELECT id INTO v_khoya_id FROM public.categories WHERE slug = 'khoya-sweets' LIMIT 1;
  SELECT id INTO v_milk_id FROM public.categories WHERE slug = 'milk-sweets' OR name ILIKE '%Milk Sweet%' LIMIT 1;
  
  IF v_khoya_id IS NOT NULL AND v_milk_id IS NOT NULL THEN
    UPDATE public.products SET category_id = v_khoya_id WHERE category_id = v_milk_id;
    DELETE FROM public.categories WHERE id = v_milk_id;
  END IF;
END $$;

-- B. Move Ghee Namkeen products -> Dry Fruits (Masala Kaju, Roasted Badam, etc.)
DO $$
DECLARE
  v_dry_fruits_id UUID;
  v_ghee_namkeen_id UUID;
BEGIN
  SELECT id INTO v_dry_fruits_id FROM public.categories WHERE slug = 'dry-fruits' LIMIT 1;
  SELECT id INTO v_ghee_namkeen_id FROM public.categories WHERE slug = 'ghee-namkeen' OR name ILIKE '%Ghee Namkeen%' LIMIT 1;
  
  IF v_dry_fruits_id IS NOT NULL AND v_ghee_namkeen_id IS NOT NULL THEN
    UPDATE public.products SET category_id = v_dry_fruits_id WHERE category_id = v_ghee_namkeen_id;
    DELETE FROM public.categories WHERE id = v_ghee_namkeen_id;
  END IF;
END $$;

-- C. Split Dry Fruit Tray/Thal/Box -> Thal Box and Dry Fruit Tray
DO $$
DECLARE
  v_thal_id UUID;
  v_tray_id UUID;
  v_old_box_id UUID;
BEGIN
  SELECT id INTO v_thal_id FROM public.categories WHERE slug = 'thal-box' LIMIT 1;
  SELECT id INTO v_tray_id FROM public.categories WHERE slug = 'dry-fruit-tray' LIMIT 1;
  SELECT id INTO v_old_box_id FROM public.categories WHERE slug = 'dry-fruit-tray-thal-box' OR name ILIKE '%Dry Fruit Tray/Thal/Box%' LIMIT 1;
  
  IF v_old_box_id IS NOT NULL THEN
    -- Products with Thal / Thaal go to Thal Box
    UPDATE public.products 
    SET category_id = v_thal_id 
    WHERE category_id = v_old_box_id 
      AND (name ILIKE '%thal%' OR name ILIKE '%thaal%');
    
    -- Remaining products go to Dry Fruit Tray
    UPDATE public.products 
    SET category_id = v_tray_id 
    WHERE category_id = v_old_box_id;

    DELETE FROM public.categories WHERE id = v_old_box_id;
  END IF;
END $$;


-- -------------------------------------------------------------------------
-- 6. CONFIGURE HIERARCHY IN category_relationships TABLE
-- -------------------------------------------------------------------------

-- Clear any old relationships
DELETE FROM public.category_relationships;

-- Sweets -> 6 Subcategories
INSERT INTO public.category_relationships (parent_id, child_id, sort_order)
SELECT p.id, c.id, s.ord
FROM public.categories p
CROSS JOIN (
  VALUES 
    ('authentic-ghee-sweets-in-lucknow', 1),
    ('khoya-sweets', 2),
    ('laddu-sweets', 3),
    ('kaju-sweets', 4),
    ('bengali-chhena-sweets', 5),
    ('mewa-bites-baklava', 6)
) AS s(slug, ord)
JOIN public.categories c ON c.slug = s.slug
WHERE p.slug = 'sweets';

-- Gifting -> 4 Subcategories
INSERT INTO public.category_relationships (parent_id, child_id, sort_order)
SELECT p.id, c.id, s.ord
FROM public.categories p
CROSS JOIN (
  VALUES 
    ('bhayana-bhaji', 1),
    ('dry-fruit-tray', 2),
    ('thal-box', 3),
    ('gift-boxes', 4)
) AS s(slug, ord)
JOIN public.categories c ON c.slug = s.slug
WHERE p.slug = 'gifting';

-- Festive -> 5 Subcategories
INSERT INTO public.category_relationships (parent_id, child_id, sort_order)
SELECT p.id, c.id, s.ord
FROM public.categories p
CROSS JOIN (
  VALUES 
    ('seasonal-mithai', 1),
    ('shubh-mangalwar', 2),
    ('modak-sweets', 3),
    ('best-ghewar-in-india', 4),
    ('gajak-sweets', 5)
) AS s(slug, ord)
JOIN public.categories c ON c.slug = s.slug
WHERE p.slug = 'festive';


-- -------------------------------------------------------------------------
-- 7. UPDATE SIGNATURE PRODUCT IMAGES FOR MAIN CATEGORIES
-- -------------------------------------------------------------------------
UPDATE public.categories 
SET image_url = 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412968/Namkeen_Kaju_Samosa.jpg'
WHERE slug = 'namkeen';

UPDATE public.categories 
SET image_url = 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412964/DSC07955.jpg'
WHERE slug = 'gifting';

UPDATE public.categories 
SET image_url = 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412897/DSC08529.jpg'
WHERE slug = 'sweets';

UPDATE public.categories 
SET image_url = 'https://res.cloudinary.com/dil74qcsx/image/upload/f_auto,q_auto/v1784279498/dry_fruit_licbr1.png'
WHERE slug = 'dry-fruits';

UPDATE public.categories 
SET image_url = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788240115/DSC07987_1_1_ujxahs.jpg'
WHERE slug = 'festive';

COMMIT;
