-- =========================================================================
-- RAJLUXMI SWEETS: SEO RE-OPTIMIZATION FOR 4 BENGALI CHHENA PRODUCTS
-- Target Products: Rasgulla, Raj Bhog, Rasmalai, Malai Chumchum
-- Date: 2026-10-09
-- =========================================================================

-- 1. Create backup table of target rows before any modifications
CREATE TABLE IF NOT EXISTS products_backup_seo_20261009 AS
SELECT * FROM products
WHERE name IN ('Rasgulla', 'Raj Bhog', 'Rasmalai', 'Malai Chumchum');

-- 2. Add image_alt column if not already existing
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_alt TEXT DEFAULT NULL;

COMMENT ON COLUMN products.image_alt IS 'Descriptive SEO alt text for the primary product image';

-- 3. Execute atomic transaction to update metadata and descriptions for exactly 4 rows
DO $$
DECLARE
  v_updated_count INT;
BEGIN
  -- Perform updates
  UPDATE products
  SET
    meta_title = CASE name
      WHEN 'Rasgulla' THEN 'Kolkata Style Rasgulla in Lucknow | Rajluxmi Sweets'
      WHEN 'Raj Bhog' THEN 'Authentic Rajbhog in Lucknow | Rajluxmi Sweets'
      WHEN 'Rasmalai' THEN 'Fresh Rasmalai in Lucknow | Rajluxmi Sweets'
      WHEN 'Malai Chumchum' THEN 'Malai Chum Chum in Lucknow | Rajluxmi Sweets'
    END,
    meta_description = CASE name
      WHEN 'Rasgulla' THEN 'Craving Kolkata style rasgulla in Lucknow? Enjoy sponge chhena dumplings simmered daily in light cardamom syrup. Order fresh for home delivery.'
      WHEN 'Raj Bhog' THEN 'Looking for authentic rajbhog in Lucknow? Savor saffron-infused cottage cheese sweets stuffed with pistachios and almonds. Order online today.'
      WHEN 'Rasmalai' THEN 'Taste melt-in-mouth rasmalai in Lucknow, soaked in slow-simmered saffron-pistachio rabri and freshly prepared chhena. Order fresh online now.'
      WHEN 'Malai Chumchum' THEN 'Delight in Bengali malai chum chum in Lucknow, handcrafted from poached chhena and layered with rich clotted cream. Order for fast local delivery.'
    END,
    meta_keywords = CASE name
      WHEN 'Rasgulla' THEN 'Kolkata style rasgulla in Lucknow, Bengali rasgulla Lucknow, fresh chhena rasgulla Ashiyana, sponge rasgulla delivery'
      WHEN 'Raj Bhog' THEN 'Rajbhog in Lucknow, Bengali kesar rajbhog Lucknow, dry fruit stuffed rajbhog, traditional chhena sweets Lucknow'
      WHEN 'Rasmalai' THEN 'Rasmalai in Lucknow, Kolkata style rasmalai Lucknow, kesar pistachio rasmalai delivery, fresh Bengali sweets Lucknow'
      WHEN 'Malai Chumchum' THEN 'Malai chum chum in Lucknow, Bengali malai cham cham Lucknow, chhena chamcham sweet Lucknow, fresh mawa malai sweets'
    END,
    image_alt = CASE name
      WHEN 'Rasgulla' THEN 'Kolkata style white spongy rasgulla soaked in light sugar syrup by Rajluxmi Sweets Lucknow'
      WHEN 'Raj Bhog' THEN 'Authentic kesar rajbhog chhena sweet stuffed with pistachios and almonds at Rajluxmi Sweets Lucknow'
      WHEN 'Rasmalai' THEN 'Fresh Kolkata style rasmalai chhena discs in saffron pistachio rabri milk by Rajluxmi Sweets Lucknow'
      WHEN 'Malai Chumchum' THEN 'Traditional Bengali malai chumchum layered with rich cream and pistachios from Rajluxmi Sweets Lucknow'
    END,
    description = CASE name
      WHEN 'Rasgulla' THEN 'Rajluxmi Sweets in Lucknow makes Kolkata style rasgulla using fresh cows milk chhena curdled in small daily batches. Each spongy sweet is cooked in clarified light sugar syrup scented with subtle green cardamom following classic Bengali confectionery methods. The result is a resilient, porous texture that releases sweet syrup with every bite without feeling excessively sugary or dense. Prepared fresh every morning at our Ashiyana sweet shop, this traditional delicacy brings authentic Kolkata sweetness to sweet lovers across Lucknow.

What makes it Kolkata style:
Kolkata style rasgulla differs fundamentally from commercial rasgullas due to its pure cow milk chhena base and specific temperature-controlled boiling. Authentic Bengali makers knead the curd until free of graininess, allowing the spheres to expand freely in boiling thin syrup rather than heavy sugar concentrate. This creates the signature springy sponge that bounces back when pressed, retaining a light, juicy mouthfeel that feels clean rather than sticky.'
      WHEN 'Raj Bhog' THEN 'Rajluxmi Sweets prepares traditional Raj Bhog in Lucknow by hand-kneading pure cottage cheese and infusing it with natural Kashmiri saffron. This royal festive sweet contains a concealed heart of crushed pistachios, California almonds, and aromatic cardamom wrapped inside a golden chhena sphere. Slowly boiled in saffron-infused syrup, each generous portion retains a tender bite with rich nutty textures in every mouthful. Crafted daily by experienced halwais, our Raj Bhog brings timeless Bengali culinary craftsmanship directly to your celebrations in Lucknow.

What makes it Kolkata style:
The Kolkata heritage of Raj Bhog lies in its dual-stage craftsmanship and larger spherical shape compared to plain rasgulla. Authentic Bengali confectioners hand-fill fresh chhena dough with dry fruits and saffron paste before slow poaching in aromatic saffron syrup. This technique produces an unmistakable golden-yellow hue, distinct saffron fragrance, and a rich crumbly centre that honors Kolkata''s iconic sweet-making tradition right here in Lucknow.'
      WHEN 'Rasmalai' THEN 'Rajluxmi Sweets in Lucknow crafts fresh Rasmalai from scratch using flattened discs of cottage cheese simmered in velvety, saffron-scented milk. The dessert pairs feather-soft chhena patties with a slow-reduced rabri infused with crushed green cardamom, slivered almonds, and golden pistachios. Each serving delivers a delicate balance of gentle sweetness and creamy richness that dissolves effortlessly on the palate. Made fresh every day without artificial essence or chemical stabilizers, our Rasmalai delivers an authentic Bengali milk sweet experience throughout Lucknow.

What makes it Kolkata style:
Authentic Kolkata style rasmalai relies on fresh milk reduction rather than thickened condensed bases or commercial starches. The chhena dumplings are poached until airy and springy, then immersed in warm, cardamom-spiced sweetened milk to drink in the liquid core. This gradual absorption creates a lush, porous consistency that releases rich dairy flavours upon the first touch, recreating the classic taste celebrated across Bengal''s historic sweet shops.'
      WHEN 'Malai Chumchum' THEN 'Rajluxmi Sweets produces authentic Malai Chumchum in Lucknow by gently cooking cylindrical chhena pieces before stuffing them with clotted cream malai. The sweet incorporates hand-separated paneer curd, mild raw sugar, and rich dairy solids garnished with aromatic saffron threads and pistachio shavings. Its dense yet yielding texture offers a creamy contrast between the juicy cooked curd exterior and the velvety malai filling inside. Prepared daily for celebrations and family gatherings, this quintessential Bengali confection provides an authentic regional dessert for Lucknow households.

What makes it Kolkata style:
Traditional Kolkata chumchum is shaped into elongated oval batons and cooked in fragrant sugar syrup until firm yet tender. Master Bengali artisans then slice along the centre to fold in slow-cooked mawa malai, finished with saffron strands and dry fruits. The balance of a slightly chewy chhena crust and luxurious dairy filling defines genuine Kolkata sweet artistry, avoiding synthetic essences or excessive artificial colors.'
    END,
    faqs = CASE name
      WHEN 'Rasgulla' THEN '[
        {"question": "How does Rajluxmi Sweets ensure rasgullas stay soft and spongy?", "answer": "We prepare our rasgullas exclusively from freshly curdled cow milk chhena kneaded by hand every morning. The chhena spheres are simmered in light sugar syrup at steady rolling heat, ensuring maximum expansion and a delicate, springy sponge texture that holds syrup without collapsing or turning rubbery."},
        {"question": "Is your Kolkata style rasgulla available for same-day delivery in Lucknow?", "answer": "Yes, Rajluxmi Sweets offers prompt same-day local delivery across Lucknow for orders placed through our website or store hotline. Each batch is packed in food-grade, leak-proof containers directly from our kitchen to ensure your sweets reach your doorstep fresh, fragrant, and intact."},
        {"question": "How should I store Kolkata style rasgulla and what is its shelf life?", "answer": "Keep rasgullas submerged in their syrup inside an airtight container in the refrigerator. When chilled properly, they stay fresh and tender for up to four days. For the most authentic melt-in-mouth experience, bring them to room temperature or warm slightly before serving."},
        {"question": "Are there any artificial preservatives or colors in your rasgulla?", "answer": "No, our Kolkata style rasgulla contains strictly zero artificial food preservatives, chemical stabilizers, or synthetic coloring agents. We rely entirely on pure cow milk curd, filtered water, refined sugar, and natural green cardamom to preserve the authentic, clean taste of traditional Bengali mithai."}
      ]'::jsonb
      WHEN 'Raj Bhog' THEN '[
        {"question": "What ingredients are inside the filling of Rajluxmi Sweets Raj Bhog?", "answer": "Our Raj Bhog features a fragrant core filled with finely chopped California almonds, premium pistachios, natural Kashmiri saffron, and freshly ground cardamom. This wholesome nut filling is sealed inside pure chhena dough before cooking, giving each piece a distinct aromatic surprise in every bite."},
        {"question": "How is Raj Bhog different from regular rasgulla?", "answer": "While rasgulla is smaller, plain, and cooked in clear syrup, Raj Bhog is noticeably larger and infused with saffron and cardamom. Raj Bhog also includes an internal filling of dry fruits and chhena, giving it a richer, festive texture and a vibrant golden color."},
        {"question": "How many pieces of Raj Bhog come in an order from Lucknow?", "answer": "Our Raj Bhog is sold in standard 10-piece packs as well as kilogram measurements depending on your requirement. Every pack is carefully weighed and cushioned in airtight, food-grade packaging so the delicate chhena spheres stay intact and juicy during local transit across Lucknow."},
        {"question": "What is the recommended shelf life and storage method for Raj Bhog?", "answer": "Because Raj Bhog contains rich dairy chhena and dry fruits, it should be stored in the refrigerator in a sealed container with its saffron syrup. It remains delicious and fresh for up to five days. We recommend consuming it within three days for optimal flavour."}
      ]'::jsonb
      WHEN 'Rasmalai' THEN '[
        {"question": "What makes Rajluxmi Sweets rasmalai rich without being heavy?", "answer": "We simmer pure whole milk slowly until it naturally thickens into rabri, avoiding commercial thickeners, artificial starches, or heavy creams. Hand-crafted chhena discs soak up this saffron-pistachio reduction, giving you a silky dessert that feels luxurious yet light and clean on the palate."},
        {"question": "How is fresh rasmalai packed for delivery in Lucknow?", "answer": "Our rasmalai is packed in tamper-proof, spill-resistant food containers with secure sealing to keep the chilled rabri and tender chhena patties completely safe. We dispatch local Lucknow orders via temperature-conscious packaging to maintain fresh dairy quality right to your doorstep."},
        {"question": "How long can I keep rasmalai in the refrigerator?", "answer": "Fresh rasmalai should always be kept continuously refrigerated between 2°C and 5°C. Since we never add chemical preservatives, it is best consumed within two to three days of delivery. Serve it nicely chilled for the ultimate refreshing dessert experience."},
        {"question": "Does Rajluxmi Sweets accept bulk orders for rasmalai for events in Lucknow?", "answer": "Yes, we cater fresh rasmalai for weddings, family functions, festivals, and corporate gatherings across Lucknow. Please reach out to our concierge team at least 24 to 48 hours in advance so our halwais can prepare your batch fresh on the day of your event."}
      ]'::jsonb
      WHEN 'Malai Chumchum' THEN '[
        {"question": "What ingredients are used in the malai filling of your chumchum?", "answer": "The filling inside our Malai Chumchum is made from slow-cooked whole milk solids (mawa) blended with clotted cream malai, subtle cardamom powder, and saffron. It contains no artificial thickening agents or synthetic flavorings, providing a genuine homemade richness that complements the chhena casing."},
        {"question": "Is Malai ChumChum overly sweet or dry?", "answer": "Not at all. The outer chhena sponge is poached in light syrup to retain moisture without becoming soggy, while the creamy malai layer offers a smooth, balanced sweetness. This ensures a satisfying bite that feels creamy and luscious rather than cloying or dry."},
        {"question": "How should I store Malai ChumChum at home?", "answer": "Store Malai ChumChum inside an airtight container in the refrigerator immediately upon arrival. Because of its fresh milk cream and chhena composition, it stays at peak freshness for three to four days. Avoid keeping it exposed at room temperature for prolonged periods."},
        {"question": "Can I order Malai ChumChum in Lucknow for gifting and festive hampers?", "answer": "Yes, Malai ChumChum is one of our most popular festive sweets for Diwali, Rakhi, and family celebrations in Lucknow. We arrange specialized festive gift packaging and sweet boxes with custom assortments. Contact our Lucknow team directly for customized gift box orders."}
      ]'::jsonb
    END,
    updated_at = NOW()
  WHERE name IN ('Rasgulla', 'Raj Bhog', 'Rasmalai', 'Malai Chumchum');

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count <> 4 THEN
    RAISE EXCEPTION 'Safety check failed: Expected to update exactly 4 rows, but updated % rows. Rolling back.', v_updated_count;
  END IF;

  RAISE NOTICE 'Success: Exactly 4 products updated with SEO content and FAQs.';
END $$;
