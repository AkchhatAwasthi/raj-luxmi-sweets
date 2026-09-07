const fs = require('fs');
const path = require('path');
const { createClient } = require('../node_modules/@supabase/supabase-js');

// Load environment variables
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\s]+)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\s]+)/)[1];
const supabase = createClient(url, key);

async function run() {
  console.log('=== STARTING CATEGORY RESTRUCTURING ===\n');

  // -------------------------------------------------------------
  // 1. DELETE THE 4 CATEGORIES & THEIR PRODUCTS (PER USER REQUEST)
  // -------------------------------------------------------------
  console.log('--- Step 1: Deleting Dhokla, Drinks, Maida Sweets, Petha Sweet ---');
  const deleteCategoryPatterns = ['Dhokla', 'Drinks', 'Maida Sweets', 'Petha Sweet'];
  for (const namePattern of deleteCategoryPatterns) {
    const { data: cat } = await supabase.from('categories').select('*').ilike('name', `%${namePattern}%`).maybeSingle();
    if (cat) {
      console.log(`Found category to delete: "${cat.name}" (${cat.id})`);
      const { data: prods, error: pErr } = await supabase.from('products').select('id, name').eq('category_id', cat.id);
      if (prods && prods.length > 0) {
        console.log(`  Deleting ${prods.length} products under "${cat.name}"...`);
        const prodIds = prods.map(p => p.id);
        const { error: delPErr } = await supabase.from('products').delete().in('id', prodIds);
        if (delPErr) console.error(`  Error deleting products:`, delPErr.message);
        else console.log(`  Successfully deleted ${prods.length} products.`);
      }
      const { error: cDelErr } = await supabase.from('categories').delete().eq('id', cat.id);
      if (cDelErr) console.error(`  Error deleting category "${cat.name}":`, cDelErr.message);
      else console.log(`  Successfully deleted category "${cat.name}".`);
    } else {
      console.log(`Category pattern "${namePattern}" not found or already deleted.`);
    }
  }

  // -------------------------------------------------------------
  // 2. CREATE MISSING PRIMARY MAIN CATEGORIES
  // -------------------------------------------------------------
  console.log('\n--- Step 2: Ensuring the 5 Primary Main Categories Exist ---');

  // A. Sweets
  let sweetsCat;
  const { data: existingSweets } = await supabase.from('categories').select('*').eq('slug', 'sweets').maybeSingle();
  if (existingSweets) {
    sweetsCat = existingSweets;
    console.log('Main category "Sweets" already exists:', sweetsCat.id);
  } else {
    const { data: newSweets, error: swErr } = await supabase.from('categories').insert({
      name: 'Sweets',
      slug: 'sweets',
      description: 'Handcrafted traditional Indian sweets, mithai, and authentic royal delicacies',
      is_active: true,
      meta_title: 'Traditional Indian Sweets & Mithai Online | Raj Luxmi',
      meta_description: 'Explore authentic traditional Indian sweets made with pure desi ghee and highest quality ingredients.',
    }).select().single();
    if (swErr) throw swErr;
    sweetsCat = newSweets;
    console.log('Created Main category "Sweets":', sweetsCat.id);
  }

  // B. Namkeen (Existing)
  const { data: namkeenCat } = await supabase.from('categories').select('*').eq('slug', 'namkeen').single();
  console.log('Main category "Namkeen":', namkeenCat.id);

  // C. Dry Fruits (Existing)
  const { data: dryFruitsCat } = await supabase.from('categories').select('*').eq('slug', 'dry-fruits').single();
  console.log('Main category "Dry Fruits":', dryFruitsCat.id);

  // D. Gifting
  let giftingCat;
  const { data: existingGifting } = await supabase.from('categories').select('*').eq('slug', 'gifting').maybeSingle();
  if (existingGifting) {
    giftingCat = existingGifting;
    console.log('Main category "Gifting" already exists:', giftingCat.id);
  } else {
    const { data: newGifting, error: gifErr } = await supabase.from('categories').insert({
      name: 'Gifting',
      slug: 'gifting',
      description: 'Thoughtfully curated luxury gift hampers, festive platters, and celebration boxes',
      is_active: true,
      meta_title: 'Luxury Gift Hampers & Celebration Boxes | Raj Luxmi',
      meta_description: 'Shop luxury festive hampers, dry fruit platters, and custom gift boxes for weddings and celebrations.',
    }).select().single();
    if (gifErr) throw gifErr;
    giftingCat = newGifting;
    console.log('Created Main category "Gifting":', giftingCat.id);
  }

  // E. Festive
  let festiveCat;
  const { data: existingFestive } = await supabase.from('categories').select('*').eq('slug', 'festive').maybeSingle();
  if (existingFestive) {
    festiveCat = existingFestive;
    console.log('Main category "Festive" already exists:', festiveCat.id);
  } else {
    const { data: newFestive, error: fesErr } = await supabase.from('categories').insert({
      name: 'Festive',
      slug: 'festive',
      description: 'Celebratory seasonal mithai, modak sweets, gajak, and traditional festive specials',
      is_active: true,
      meta_title: 'Festive Sweets & Seasonal Mithai | Raj Luxmi',
      meta_description: 'Celebrate Indian festivals with authentic seasonal sweets, modaks, gajak, and treats.',
    }).select().single();
    if (fesErr) throw fesErr;
    festiveCat = newFestive;
    console.log('Created Main category "Festive":', festiveCat.id);
  }

  // -------------------------------------------------------------
  // 3. SUBCATEGORY RENAMES & CREATIONS
  // -------------------------------------------------------------
  console.log('\n--- Step 3: Preparing Subcategories ---');

  // Rename Bengali Sweets -> Bengali Chhena Sweets
  const { data: bengaliCat } = await supabase.from('categories').select('*').ilike('name', '%Bengali Sweets%').maybeSingle();
  if (bengaliCat) {
    await supabase.from('categories').update({
      name: 'Bengali Chhena Sweets',
      slug: 'bengali-chhena-sweets',
    }).eq('id', bengaliCat.id);
    console.log('Renamed "Bengali Sweets" to "Bengali Chhena Sweets"');
  }

  // Rename EXCLUSIVE BAKLAVA -> Mewa Bites & Baklava
  const { data: baklavaCat } = await supabase.from('categories').select('*').ilike('name', '%BAKLAVA%').maybeSingle();
  if (baklavaCat) {
    await supabase.from('categories').update({
      name: 'Mewa Bites & Baklava',
      slug: 'mewa-bites-baklava',
    }).eq('id', baklavaCat.id);
    console.log('Renamed "EXCLUSIVE BAKLAVA" to "Mewa Bites & Baklava"');
  }

  // Rename Baina Bhaji -> Bhayana Bhaji
  const { data: bainaCat } = await supabase.from('categories').select('*').ilike('name', '%Baina Bhaji%').maybeSingle();
  if (bainaCat) {
    await supabase.from('categories').update({
      name: 'Bhayana Bhaji',
      slug: 'bhayana-bhaji',
    }).eq('id', bainaCat.id);
    console.log('Renamed "Baina Bhaji" to "Bhayana Bhaji"');
  }

  // Rename Gajak Sweet -> Gajak Sweets
  const { data: gajakCat } = await supabase.from('categories').select('*').ilike('name', '%Gajak Sweet%').maybeSingle();
  if (gajakCat) {
    await supabase.from('categories').update({
      name: 'Gajak Sweets',
      slug: 'gajak-sweets',
    }).eq('id', gajakCat.id);
    console.log('Renamed "Gajak Sweet" to "Gajak Sweets"');
  }

  // Rename Subh Mangalwar -> Shubh Mangalwar
  const { data: subhCat } = await supabase.from('categories').select('*').ilike('name', '%Subh Mangalwar%').maybeSingle();
  if (subhCat) {
    await supabase.from('categories').update({
      name: 'Shubh Mangalwar',
      slug: 'shubh-mangalwar',
    }).eq('id', subhCat.id);
    console.log('Renamed "Subh Mangalwar" to "Shubh Mangalwar"');
  }

  // Create "Dry Fruit Tray" if not exists
  let dryFruitTrayCat;
  const { data: existingTray } = await supabase.from('categories').select('*').eq('slug', 'dry-fruit-tray').maybeSingle();
  if (existingTray) {
    dryFruitTrayCat = existingTray;
    console.log('"Dry Fruit Tray" category exists:', dryFruitTrayCat.id);
  } else {
    const { data: newTray, error: tErr } = await supabase.from('categories').insert({
      name: 'Dry Fruit Tray',
      slug: 'dry-fruit-tray',
      description: 'Exquisite dry fruit trays, platters, and luxury assortments',
      is_active: true,
    }).select().single();
    if (tErr) throw tErr;
    dryFruitTrayCat = newTray;
    console.log('Created "Dry Fruit Tray" category:', dryFruitTrayCat.id);
  }

  // Create "Thal Box" if not exists
  let thalBoxCat;
  const { data: existingThal } = await supabase.from('categories').select('*').eq('slug', 'thal-box').maybeSingle();
  if (existingThal) {
    thalBoxCat = existingThal;
    console.log('"Thal Box" category exists:', thalBoxCat.id);
  } else {
    const { data: newThal, error: thErr } = await supabase.from('categories').insert({
      name: 'Thal Box',
      slug: 'thal-box',
      description: 'Traditional handcrafted festive thal boxes and ceremonial packaging',
      is_active: true,
    }).select().single();
    if (thErr) throw thErr;
    thalBoxCat = newThal;
    console.log('Created "Thal Box" category:', thalBoxCat.id);
  }

  // -------------------------------------------------------------
  // 4. MERGE PRODUCTS SAFELY
  // -------------------------------------------------------------
  console.log('\n--- Step 4: Merging Products ---');

  // A. Milk Sweets -> Khoya Sweets
  const { data: khoyaCat } = await supabase.from('categories').select('*').eq('slug', 'khoya-sweets').single();
  const { data: milkCat } = await supabase.from('categories').select('*').ilike('name', '%Milk Sweet%').maybeSingle();
  if (milkCat) {
    const { data: milkProds } = await supabase.from('products').select('id, name').eq('category_id', milkCat.id);
    if (milkProds && milkProds.length > 0) {
      console.log(`Moving ${milkProds.length} products from "Milk Sweets" to "Khoya Sweets"...`);
      await supabase.from('products').update({ category_id: khoyaCat.id }).eq('category_id', milkCat.id);
      console.log('Moved all Milk Sweets products into Khoya Sweets successfully.');
    }
    // Delete/deactivate Milk Sweets category
    await supabase.from('categories').delete().eq('id', milkCat.id);
    console.log('Removed "Milk Sweets" category.');
  }

  // B. Ghee Namkeen -> Dry Fruits
  const { data: gheeNamkeenCat } = await supabase.from('categories').select('*').ilike('name', '%Ghee Namkeen%').maybeSingle();
  if (gheeNamkeenCat) {
    const { data: gnProds } = await supabase.from('products').select('id, name').eq('category_id', gheeNamkeenCat.id);
    if (gnProds && gnProds.length > 0) {
      console.log(`Moving ${gnProds.length} products (roasted/salted kaju & badam) from "Ghee Namkeen" to "Dry Fruits"...`);
      await supabase.from('products').update({ category_id: dryFruitsCat.id }).eq('category_id', gheeNamkeenCat.id);
      console.log('Moved all Ghee Namkeen products into Dry Fruits successfully.');
    }
    await supabase.from('categories').delete().eq('id', gheeNamkeenCat.id);
    console.log('Removed "Ghee Namkeen" category.');
  }

  // C. Split Dry Fruit Tray/Thal/Box -> Thal Box vs Dry Fruit Tray
  const { data: oldTrayThalCat } = await supabase.from('categories').select('*').ilike('name', '%Dry Fruit Tray/Thal/Box%').maybeSingle();
  if (oldTrayThalCat) {
    const { data: prods } = await supabase.from('products').select('id, name').eq('category_id', oldTrayThalCat.id);
    if (prods && prods.length > 0) {
      const thalIds = [];
      const trayIds = [];
      prods.forEach(p => {
        const n = p.name.toLowerCase();
        if (n.includes('thal') || n.includes('thaal')) {
          thalIds.push(p.id);
        } else {
          trayIds.push(p.id);
        }
      });
      console.log(`Splitting ${prods.length} products: ${thalIds.length} into "Thal Box", ${trayIds.length} into "Dry Fruit Tray"...`);
      if (thalIds.length > 0) {
        await supabase.from('products').update({ category_id: thalBoxCat.id }).in('id', thalIds);
      }
      if (trayIds.length > 0) {
        await supabase.from('products').update({ category_id: dryFruitTrayCat.id }).in('id', trayIds);
      }
      console.log('Products split completed successfully.');
    }
    await supabase.from('categories').delete().eq('id', oldTrayThalCat.id);
    console.log('Removed old "Dry Fruit Tray/Thal/Box" category.');
  }

  // -------------------------------------------------------------
  // 5. ESTABLISH CLEAN HIERARCHY IN category_relationships
  // -------------------------------------------------------------
  console.log('\n--- Step 5: Updating Category Relationships ---');

  // Fetch all refreshed categories
  const { data: allCats } = await supabase.from('categories').select('id, name, slug');
  const catBySlug = {};
  allCats.forEach(c => { catBySlug[c.slug] = c; });

  // Clear existing relationships
  await supabase.from('category_relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const newRelationships = [];

  // A. Sweets subcategories
  const sweetsChildren = [
    'authentic-ghee-sweets-in-lucknow', // Ghee Sweets
    'khoya-sweets',                     // Khoya Sweets
    'laddu-sweets',                     // Laddu Sweets
    'kaju-sweets',                      // Kaju Sweets
    'bengali-chhena-sweets',            // Bengali Chhena Sweets
    'mewa-bites-baklava',               // Mewa Bites & Baklava
  ];
  sweetsChildren.forEach((childSlug, idx) => {
    const child = catBySlug[childSlug];
    if (child) {
      newRelationships.push({
        parent_id: sweetsCat.id,
        child_id: child.id,
        sort_order: idx + 1,
      });
    } else {
      console.warn('Could not find sweets child with slug:', childSlug);
    }
  });

  // B. Gifting subcategories
  const giftingChildren = [
    'bhayana-bhaji',   // Bhayana Bhaji
    'dry-fruit-tray',  // Dry Fruit Tray
    'thal-box',        // Thal Box
    'gift-boxes',      // Gift Boxes
  ];
  giftingChildren.forEach((childSlug, idx) => {
    const child = catBySlug[childSlug];
    if (child) {
      newRelationships.push({
        parent_id: giftingCat.id,
        child_id: child.id,
        sort_order: idx + 1,
      });
    } else {
      console.warn('Could not find gifting child with slug:', childSlug);
    }
  });

  // C. Festive subcategories
  const festiveChildren = [
    'seasonal-mithai',     // Seasonal Mithai
    'shubh-mangalwar',     // Shubh Mangalwar
    'modak-sweets',        // Modak Sweets
    'best-ghewar-in-india', // Ghewar Sweets
    'gajak-sweets',        // Gajak Sweets
  ];
  festiveChildren.forEach((childSlug, idx) => {
    const child = catBySlug[childSlug];
    if (child) {
      newRelationships.push({
        parent_id: festiveCat.id,
        child_id: child.id,
        sort_order: idx + 1,
      });
    } else {
      console.warn('Could not find festive child with slug:', childSlug);
    }
  });

  // Insert into category_relationships table
  console.log(`Inserting ${newRelationships.length} relationships into category_relationships table...`);
  const { error: relInsErr } = await supabase.from('category_relationships').insert(newRelationships);
  if (relInsErr) {
    console.error('Error inserting into category_relationships:', relInsErr.message);
  } else {
    console.log('Successfully inserted relationships into category_relationships.');
  }

  // Also sync to settings table fallback
  const { error: setErr } = await supabase.from('settings').upsert({
    key: 'category_relationships_map',
    value: JSON.stringify(newRelationships),
  }, { onConflict: 'key' });
  if (setErr) {
    console.error('Error updating settings fallback:', setErr.message);
  } else {
    console.log('Successfully updated category_relationships_map in settings.');
  }

  // -------------------------------------------------------------
  // 6. FINAL VERIFICATION REPORT
  // -------------------------------------------------------------
  console.log('\n=== FINAL VERIFICATION ===');
  const { data: finalCats } = await supabase.from('categories').select('*').order('name');
  console.log(`Total Active Categories: ${finalCats.length}`);

  for (const c of finalCats) {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', c.id);
    const parents = newRelationships.filter(r => r.child_id === c.id);
    const children = newRelationships.filter(r => r.parent_id === c.id);
    const type = children.length > 0 ? `[MAIN (${children.length} subcats)]` : parents.length > 0 ? '[SUBCAT]' : '[MAIN (direct products)]';
    console.log(`${type.padEnd(26)} ${c.name.padEnd(25)} | products: ${String(count).padStart(3)} | slug: ${c.slug}`);
  }

  const { count: totalProds } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\nTotal products remaining in store: ${totalProds}`);
  console.log('=== CATEGORY RESTRUCTURING COMPLETED SUCCESSFULLY ===');
}

run().catch(console.error);
