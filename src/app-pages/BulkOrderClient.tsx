// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Phone, FileText, CheckCircle2, Truck, Gift,
  Sparkles, Award, ShieldCheck, Clock, MapPin, ChevronRight,
  Eye, Star, Heart, Calendar, Users, Building, HeartHandshake,
  PackageCheck, Send, X, ArrowRight, Check, HelpCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { fetchCategoryRelationships } from '@/lib/categoryHierarchy';
import { DIWALI_CATALOGUE_URL } from '@/components/FloatingCatalogueButton';

// Authentic website imagery & user-provided assets
const HERO_BANNER_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1792763546/Gourmet_Gift_Hamper_Collection_Display_u9fzpk.png';
const CURATE_HAMPER_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788779457/ChatGPT_Image_Sep_7_2026_04_40_28_PM_ujwucm.png';
const HALWAI_SWEETS_IMG = 'https://res.cloudinary.com/danag6hn5/image/upload/q_auto/f_auto/v1775412897/DSC08529.jpg';
const HALWAI_ARTISAN_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759051/WhatsApp_Image_2026-09-07_at_10.56.07_AM_dskzaj.jpg';
const PACKAGING_FRESH_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788240115/DSC07987_1_1_ujxahs.jpg';
const DELIVERY_PAN_INDIA_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1788759519/ChatGPT_Image_Sep_7_2026_11_06_47_AM_ylkfg5.png';
const TASTING_BOX_SAMPLE_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1792046639/Luxury_Diwali_Mithai_Gift_Box_s3ynam.png';
const FALLBACK_BOX_IMG = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1792733544/Luxurious_Golden_Confectionery_Gift_Box_bjzrkz.png';

const WHATSAPP_NUMBER = '918448447408';

export default function BulkOrderClient() {
  const [diwaliBoxes, setDiwaliBoxes] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; slug: string | null }[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchDiwaliBoxes();
  }, []);

  const fetchDiwaliBoxes = async () => {
    try {
      setLoading(true);

      // 1. Fetch all active categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug, is_active')
        .eq('is_active', true);

      if (catError) throw catError;

      // 2. Fetch category relationships to find subcategories under Diwali Special
      const relsData = await fetchCategoryRelationships();

      // 3. Identify the main Diwali Special category
      const diwaliMain = (categoriesData || []).find((c: any) => {
        const n = (c.name || '').trim().toLowerCase();
        const s = (c.slug || '').trim().toLowerCase();
        return (
          n === 'diwali specials' ||
          s === 'diwali-specials' ||
          n === 'diwali special' ||
          s === 'diwali-special' ||
          n.includes('diwali') ||
          s.includes('diwali')
        );
      });

      // 4. Discover subcategories under Diwali Specials (e.g. MDF Boxes, Gift Hampers, etc.)
      const subMap = new Map<string, { id: string; name: string; slug: string | null }>();
      if (diwaliMain) {
        (relsData || [])
          .filter((r: any) => r.parent_id === diwaliMain.id)
          .forEach((r: any) => {
            const childCat = (categoriesData || []).find((c: any) => c.id === r.child_id);
            if (childCat) {
              subMap.set(childCat.id, {
                id: childCat.id,
                name: childCat.name,
                slug: childCat.slug || null,
              });
            }
          });
      }

      // Also include any categories explicitly mentioning mdf or diwali (except main)
      (categoriesData || []).forEach((c: any) => {
        if (diwaliMain && c.id === diwaliMain.id) return;
        const n = (c.name || '').toLowerCase();
        const s = (c.slug || '').toLowerCase();
        if (n.includes('mdf box') || s.includes('mdf-box')) {
          subMap.set(c.id, { id: c.id, name: c.name, slug: c.slug || null });
        }
      });

      const discoveredSubcats = Array.from(subMap.values());
      setSubcategories(discoveredSubcats);

      const targetCategoryIds = new Set<string>([
        ...(diwaliMain ? [diwaliMain.id] : []),
        ...discoveredSubcats.map((s) => s.id),
      ]);

      // 5. Fetch all active products
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (prodError) throw prodError;

      if (productsData) {
        // Strict filter to exclude any previous box from subcategory "Gift Boxes", parent "Gifting"
        const isOldGiftBox = (p: any) => {
          const catName = (p.categories?.name || p.category || '').toLowerCase().trim();
          const catSlug = (p.categories?.slug || '').toLowerCase().trim();
          const prodName = (p.name || '').toLowerCase().trim();

          // Reject if in category "gift boxes"
          if (catName === 'gift boxes' || catSlug === 'gift-boxes') return true;
          // Reject if named "Gift Box 1", "Gift Box 2", etc.
          if (/^gift\s*box\s*\d+/i.test(prodName)) return true;
          if (prodName.startsWith('gift box')) return true;
          return false;
        };

        // Filter products belonging to Diwali Special category and its subcategories
        const filtered = productsData.filter((p: any) => {
          // Strictly exclude previous boxes
          if (isOldGiftBox(p)) return false;

          // Check category ID matching Diwali main or its subcategories
          if (p.category_id && targetCategoryIds.has(p.category_id)) return true;

          const catName = (p.categories?.name || p.category || '').toLowerCase();
          const catSlug = (p.categories?.slug || '').toLowerCase();

          if (diwaliMain && catName === (diwaliMain.name || '').toLowerCase()) return true;
          if (catName.includes('diwali') || catSlug.includes('diwali')) return true;
          if (catName.includes('mdf') || catSlug.includes('mdf')) return true;

          return false;
        });

        // Sort so that MDF Boxes and Hampers appear first, followed by ascending price
        const sorted = filtered.sort((a: any, b: any) => {
          const aIsBox = (a.categories?.name || '').toLowerCase().includes('box') || (a.name || '').toLowerCase().includes('box');
          const bIsBox = (b.categories?.name || '').toLowerCase().includes('box') || (b.name || '').toLowerCase().includes('box');
          if (aIsBox && !bIsBox) return -1;
          if (!aIsBox && bIsBox) return 1;
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        });

        setDiwaliBoxes(sorted);
      }
    } catch (err) {
      console.error('Error fetching Diwali boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayedBoxes = useMemo(() => {
    if (activeTab === 'all') {
      return diwaliBoxes;
    }
    return diwaliBoxes.filter((box: any) => {
      if (box.category_id === activeTab) return true;
      const subcat = subcategories.find((s) => s.id === activeTab);
      if (subcat && (box.categories?.name || '').toLowerCase() === subcat.name.toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [diwaliBoxes, activeTab, subcategories]);

  const openWhatsApp = (customText?: string) => {
    const text =
      customText ||
      "Hello Raj Luxmi Sweets team! I am interested in bulk ordering gift boxes for an upcoming event. Please send me your complete bulk catalogue and pricing.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openBoxEnquiry = (boxName: string) => {
    const text = `Hello Raj Luxmi Sweets! I would like to inquire about bulk ordering '${boxName}' for our upcoming celebration. Please share catalogue and bulk pricing options.`;
    openWhatsApp(text);
  };

  return (
    <div className="bulk-order-page w-full bg-[#FFFDF7] text-[#2C1810]">

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO IMAGE (No Text, No Filter, Responsive)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full relative overflow-hidden bg-[#FFFDF7]">
        <div className="w-full">
          <img
            src={HERO_BANNER_IMG}
            alt="Bulk Orders and Bespoke Gifting"
            className="w-full h-auto block object-cover"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: 4-STEP WHATSAPP ORDERING PROCESS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-[#FAF6EE] border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-2 font-orange-avenue">
              Hassle-free concierge service
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              How bulk ordering works
            </h2>
            <div className="w-14 h-0.5 bg-[#8B2131] mx-auto mt-3" />
            <p className="text-xs sm:text-sm text-[#5D4037] mt-3 font-light">
              To guarantee bespoke customization, freshness, and optimal corporate pricing, all bulk orders are handled one-on-one exclusively via WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#E6D5B8] p-6 rounded-sm shadow-xs hover:border-[#8B2131] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#8B2131] text-[#FAF6EE] flex items-center justify-center font-orange-avenue text-base font-bold">
                    1
                  </div>
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                  Text us on WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed font-light">
                  Drop us a quick message with your event type, required date, and approximate box count. Our gifting specialist responds promptly.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E6D5B8]/60 text-[11px] font-medium text-[#8B2131] flex items-center gap-1">
                <span>Instant response</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E6D5B8] p-6 rounded-sm shadow-xs hover:border-[#8B2131] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#8B2131] text-[#FAF6EE] flex items-center justify-center font-orange-avenue text-base font-bold">
                    2
                  </div>
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                  We send the catalogue
                </h3>
                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed font-light">
                  We share our comprehensive seasonal PDF catalogue with high-definition photos, box sizes, sweet assortments, and wholesale pricing tiers.
                </p>
              </div>
              <a
                href={DIWALI_CATALOGUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 pt-3 border-t border-[#E6D5B8]/60 text-[11px] font-medium text-[#8B2131] hover:text-[#6d1a26] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Diwali &apos;26 Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E6D5B8] p-6 rounded-sm shadow-xs hover:border-[#8B2131] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#8B2131] text-[#FAF6EE] flex items-center justify-center font-orange-avenue text-base font-bold">
                    3
                  </div>
                  <Gift className="w-5 h-5 text-[#8B2131]" />
                </div>
                <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                  You select &amp; customize
                </h3>
                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed font-light">
                  Pick your favorite boxes and curate sweets, savouries, or dry fruits. We customize gift sleeves, gold foiling, monograms, and personalized cards.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E6D5B8]/60 text-[11px] font-medium text-[#8B2131] flex items-center gap-1">
                <span>Tailored presentation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#E6D5B8] p-6 rounded-sm shadow-xs hover:border-[#8B2131] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#8B2131] text-[#FAF6EE] flex items-center justify-center font-orange-avenue text-base font-bold">
                    4
                  </div>
                  <Truck className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                  Fresh preparation &amp; delivery
                </h3>
                <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed font-light">
                  Handcrafted fresh on the day of dispatch by master halwais, safely packaged, and delivered directly to your venue, office, or client addresses.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#E6D5B8]/60 text-[11px] font-medium text-[#8B2131] flex items-center gap-1">
                <span>On-time guaranteed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Action Bar */}
          <div className="mt-10 bg-white border border-[#E6D5B8] p-5 sm:p-6 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <MessageCircle className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-orange-avenue font-normal text-[#2C1810]">
                  Ready to start your bulk order consultation?
                </h4>
                <p className="text-xs text-[#5D4037] font-light">
                  Our wedding and corporate concierge is available 7 days a week from 9:00 AM to 10:00 PM.
                </p>
              </div>
            </div>

            <button
              onClick={() => openWhatsApp()}
              className="px-6 py-3 bg-[#8B2131] hover:bg-[#6d1a26] text-white text-xs font-medium transition-all shadow-xs flex items-center gap-2 whitespace-nowrap cursor-pointer font-orange-avenue"
            >
              <MessageCircle className="w-4 h-4" /> Message concierge on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: DIWALI SPECIAL BOX COLLECTION (Curated Viewing, WhatsApp Orders)
      ───────────────────────────────────────────────────────────── */}
      <section id="all-gift-boxes" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E6D5B8]">
          <div>
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-1 font-orange-avenue">
              Exclusive Diwali &amp; Bulk Gifting Catalogue
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              Diwali Special Box Collection
            </h2>
            <p className="text-xs sm:text-sm text-[#5D4037] mt-1 font-light max-w-xl">
              Curated for royal celebrations, weddings, and executive corporate gifting. All Diwali boxes &amp; hampers are bespoke and ordered exclusively through our WhatsApp concierge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={DIWALI_CATALOGUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#8B2131] font-semibold bg-[#FAF6EE] hover:bg-[#8B2131] hover:text-white border border-[#8B2131] px-3.5 py-1.5 rounded-sm transition-all font-orange-avenue cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diwali PDF Catalogue</span>
            </a>
            <div className="flex items-center gap-2 text-xs text-[#8B2131] font-semibold bg-[#FAF6EE] border border-[#E6D5B8] px-3.5 py-1.5 rounded-sm font-orange-avenue">
              <Sparkles className="w-3.5 h-3.5 text-[#8B2131]" />
              <span>Viewing only &bull; Inquire on WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Subcategory Filter Tabs */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 mb-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer font-orange-avenue ${
                activeTab === 'all'
                  ? 'bg-[#8B2131] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#5D4037] hover:bg-[#8B2131]/10 border border-[#E6D5B8]'
              }`}
            >
              All Diwali Specials ({diwaliBoxes.length})
            </button>
            {subcategories.map((sub) => {
              const count = diwaliBoxes.filter(
                (b) => b.category_id === sub.id || (b.categories?.name || '').toLowerCase() === sub.name.toLowerCase()
              ).length;
              const isActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer font-orange-avenue ${
                    isActive
                      ? 'bg-[#8B2131] text-white shadow-xs'
                      : 'bg-[#FAF6EE] text-[#5D4037] hover:bg-[#8B2131]/10 border border-[#E6D5B8]'
                  }`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-[#FAF6EE] border border-[#E6D5B8] h-96 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : displayedBoxes.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF6EE] border border-[#E6D5B8] rounded-sm p-8">
            <Gift className="w-10 h-10 text-[#8B2131] mx-auto mb-3" />
            <h3 className="font-orange-avenue text-lg text-[#2C1810] mb-1">No items found in this tab</h3>
            <p className="text-xs text-[#5D4037] mb-4">Please explore all Diwali specials or contact our concierge directly on WhatsApp.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="px-4 py-2 bg-[#8B2131] text-white text-xs font-orange-avenue rounded-sm"
            >
              Show all Diwali specials
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {displayedBoxes.map((box) => {
              const primaryImage = box.images?.[0] || FALLBACK_BOX_IMG;
              const categoryBadge = box.categories?.name?.trim() || 'Diwali Special';
              return (
                <div
                  key={box.id}
                  className="bg-white border border-[#E6D5B8] rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#8B2131] hover:shadow-md transition-all duration-300 group"
                >
                  {/* Card Image */}
                  <div className="relative aspect-square bg-[#FAF6EE] overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={box.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#8B2131] text-white text-[10px] font-orange-avenue font-normal px-2.5 py-0.5 tracking-wider shadow-xs rounded-xs">
                      {categoryBadge}
                    </div>
                    {box.sku && (
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 text-[10px] font-mono text-[#5D4037] px-2 py-0.5 border border-[#E6D5B8] shadow-xs">
                        SKU: {box.sku}
                      </div>
                    )}
                    <button
                      onClick={() => setPreviewProduct(box)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-[#8B2131] hover:text-white text-[#2C1810] flex items-center justify-center transition-colors shadow-xs border border-[#E6D5B8] cursor-pointer"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
                    <div>
                      <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-1 line-clamp-1 group-hover:text-[#8B2131] transition-colors">
                        {box.name}
                      </h3>
                      <p className="text-xs text-[#5D4037] line-clamp-2 font-light leading-relaxed">
                        {box.description || 'Luxury assorted box crafted for royal celebrations, weddings, and executive gifting.'}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#E6D5B8]/60 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-[#5D4037]/70 block font-light">Starting at</span>
                        <span className="text-lg font-orange-avenue font-normal text-[#8B2131]">
                          {formatPrice(box.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5D4037]/80 font-orange-avenue">
                        {box.nutritional_info?.weight_per_unit || box.weight || 'Assorted Pack'}
                      </span>
                    </div>

                    {/* Action Button: Inquire on WhatsApp ONLY */}
                    <div className="pt-1">
                      <button
                        onClick={() => openBoxEnquiry(box.name)}
                        className="w-full py-2.5 bg-[#FAF6EE] hover:bg-[#8B2131] text-[#2C1810] hover:text-white border border-[#8B2131] text-xs font-semibold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-xs cursor-pointer font-orange-avenue"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Inquire on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assistance Note */}
        <div className="mt-12 p-5 bg-[#FAF6EE] border border-[#E6D5B8] text-center max-w-xl mx-auto rounded-sm">
          <p className="text-xs text-[#5D4037] font-light">
            Need a custom box size or a special sweet combination not listed above? We tailor every hamper to match your budget and taste preferences.
          </p>
          <button
            onClick={() => openWhatsApp("Hello Raj Luxmi Sweets, I need a customized gift hamper design with a specific sweet assortment. Please assist me.")}
            className="mt-2 text-xs font-semibold tracking-wider text-[#8B2131] hover:underline inline-flex items-center gap-1 font-orange-avenue"
          >
            <span>Request custom box configuration</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: OCCASIONS WE CELEBRATE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-t border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-2 font-orange-avenue">
              Tailored for every milestone
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              Occasions we celebrate
            </h2>
            <div className="w-14 h-0.5 bg-[#8B2131] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative rounded-sm border border-[#E6D5B8] bg-[#FAF6EE] p-6 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-full bg-white border border-[#E6D5B8] flex items-center justify-center text-[#8B2131] mb-4 group-hover:bg-[#8B2131] group-hover:text-white transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                Grand weddings
              </h3>
              <p className="text-xs text-[#5D4037] leading-relaxed font-light mb-3">
                Invitation card accompaniments, Shubh Vivah sweets, bridal party favors, and elegant return gifts for guests.
              </p>
              <ul className="text-[11px] text-[#5D4037] space-y-1 pt-2.5 border-t border-[#E6D5B8]/60">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Bride &amp; Groom Monograms
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Velvet &amp; Gold Keepsake Boxes
                </li>
              </ul>
            </div>

            <div className="group relative rounded-sm border border-[#E6D5B8] bg-[#FAF6EE] p-6 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-full bg-white border border-[#E6D5B8] flex items-center justify-center text-[#8B2131] mb-4 group-hover:bg-[#8B2131] group-hover:text-white transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                Corporate gifting
              </h3>
              <p className="text-xs text-[#5D4037] leading-relaxed font-light mb-3">
                Diwali executive hampers, Annual Day felicitation boxes, client appreciation hampers, and employee celebration gifts.
              </p>
              <ul className="text-[11px] text-[#5D4037] space-y-1 pt-2.5 border-t border-[#E6D5B8]/60">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Corporate Logo Embossing
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Multi-City Split Dispatch
                </li>
              </ul>
            </div>

            <div className="group relative rounded-sm border border-[#E6D5B8] bg-[#FAF6EE] p-6 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-full bg-white border border-[#E6D5B8] flex items-center justify-center text-[#8B2131] mb-4 group-hover:bg-[#8B2131] group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                Festive celebrations
              </h3>
              <p className="text-xs text-[#5D4037] leading-relaxed font-light mb-3">
                Diwali, Holi, Raksha Bandhan, Eid, Ganesh Chaturthi, and New Year handcrafted limited-edition celebration boxes.
              </p>
              <ul className="text-[11px] text-[#5D4037] space-y-1 pt-2.5 border-t border-[#E6D5B8]/60">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Traditional Festive Delicacies
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Tamper-Proof Protective Packing
                </li>
              </ul>
            </div>

            <div className="group relative rounded-sm border border-[#E6D5B8] bg-[#FAF6EE] p-6 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-full bg-white border border-[#E6D5B8] flex items-center justify-center text-[#8B2131] mb-4 group-hover:bg-[#8B2131] group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810] mb-2">
                Life milestones
              </h3>
              <p className="text-xs text-[#5D4037] leading-relaxed font-light mb-3">
                Baby birth announcements, Griha Pravesh (housewarming), milestone birthdays, and silver/golden jubilee celebrations.
              </p>
              <ul className="text-[11px] text-[#5D4037] space-y-1 pt-2.5 border-t border-[#E6D5B8]/60">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Personalized Announcement Inserts
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-700" /> Custom Satin Ribbon Colors
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: CURATE YOUR OWN HAMPER (With User Hamper Image)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-24 text-white overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={CURATE_HAMPER_IMG}
            alt="Curate Your Own Hamper Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2B0A10]/95 via-[#45121B]/90 to-[#2B0A10]/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border-2 border-[#E6C687]/40 shadow-2xl">
                <img
                  src={CURATE_HAMPER_IMG}
                  alt="Curate Your Own Hamper"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#8B2131] border border-[#E6C687]/40 text-white p-5 rounded-sm shadow-xl hidden sm:block max-w-xs">
                <span className="text-[10px] font-semibold tracking-wider text-[#E6C687] block mb-1">
                  Bespoke Excellence
                </span>
                <p className="text-xs leading-relaxed font-light text-[#E6D5B8]">
                  Tailored gold foiling, corporate monograms &amp; personalized greeting ribbons for every box.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-[#E6C687] tracking-wider block mb-2 font-orange-avenue">
                  Tailored to perfection
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-white leading-tight">
                  Curate your own hamper
                </h2>
                <div className="w-14 h-0.5 bg-[#E6C687] mt-3 mb-4" />
                <p className="text-xs sm:text-sm text-[#E6D5B8] leading-relaxed font-light">
                  Your celebration deserves a personalized signature. From metallic gold foil embossing to custom confectionery menus, we create hampers that distinctly represent you or your organization.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 bg-white/10 border border-[#E6C687]/30 rounded-sm">
                  <Award className="w-4 h-4 text-[#E6C687] mb-2" />
                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Custom monogram &amp; logo</h4>
                  <p className="text-[11px] text-[#E6D5B8] font-light">
                    Gold-foil hot stamped family initials or corporate branding on box covers.
                  </p>
                </div>

                <div className="p-4 bg-white/10 border border-[#E6C687]/30 rounded-sm">
                  <Gift className="w-4 h-4 text-[#E6C687] mb-2" />
                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Curated sweets menu</h4>
                  <p className="text-[11px] text-[#E6D5B8] font-light">
                    Mix and match pure desi ghee sweets, artisanal baklava, and jumbo dry fruits.
                  </p>
                </div>

                <div className="p-4 bg-white/10 border border-[#E6C687]/30 rounded-sm">
                  <FileText className="w-4 h-4 text-[#E6C687] mb-2" />
                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Greeting cards &amp; ribbons</h4>
                  <p className="text-[11px] text-[#E6D5B8] font-light">
                    Personalized printed message inserts with tailored luxury satin ribbons.
                  </p>
                </div>

                <div className="p-4 bg-white/10 border border-[#E6C687]/30 rounded-sm">
                  <Truck className="w-4 h-4 text-[#E6C687] mb-2" />
                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Pan-India multi-drop</h4>
                  <p className="text-[11px] text-[#E6D5B8] font-light">
                    Dispatched directly to separate client or family addresses across India.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openWhatsApp("Hello Raj Luxmi Sweets, I am interested in exploring custom branding and personalized packaging for our bulk gift hampers.")}
                  className="px-6 py-3.5 bg-[#C69A4E] hover:bg-[#b5893e] text-[#2C1810] text-xs font-semibold tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 font-orange-avenue"
                >
                  <MessageCircle className="w-4 h-4" /> Discuss customization on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: THE HALWAI CRAFT & KITCHEN HERITAGE
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-2 font-orange-avenue">
              Generational culinary mastery
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              Handcrafted fresh in Lucknow
            </h2>
            <div className="w-14 h-0.5 bg-[#8B2131] mx-auto mt-3" />
            <p className="text-xs sm:text-sm text-[#5D4037] mt-3 font-light">
              Unlike commercial factory sweets that sit in warehouses for weeks, every Raj Luxmi bulk order is handcrafted fresh on the day of dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[#E6D5B8]">
                <img
                  src={HALWAI_SWEETS_IMG}
                  alt="Pure Desi Ghee Craft"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810]">
                100% Pure desi ghee
              </h3>
              <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed">
                Slow-churned pure cow and buffalo desi ghee gives our traditional mithai an authentic Awadhi fragrance and incomparable melt-in-the-mouth texture.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[#E6D5B8]">
                <img
                  src={HALWAI_ARTISAN_IMG}
                  alt="Generational Halwais"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810]">
                Generational master halwais
              </h3>
              <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed">
                Recipes preserved and perfected over decades in Lucknow by master sweetmakers who honor heritage methods with zero shortcuts.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-[#E6D5B8]">
                <img
                  src={PACKAGING_FRESH_IMG}
                  alt="Aroma-Lock Fresh Packaging"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-orange-avenue font-normal text-lg text-[#2C1810]">
                Aroma-lock safe packaging
              </h3>
              <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed">
                Individually sealed food-grade containers protect each piece against moisture and breakage, ensuring flawless presentation upon arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: PAN-INDIA LOGISTICS & VENUE DELIVERY
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-[#FAF6EE] border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E6D5B8] p-6 sm:p-10 rounded-sm shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-1 font-orange-avenue">
                    White-glove distribution
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810] leading-tight">
                    Pan-India express &amp; venue delivery
                  </h2>
                  <div className="w-14 h-0.5 bg-[#8B2131] mt-3 mb-4" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#5D4037]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#8B2131] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2C1810] block font-orange-avenue text-base">Lucknow venue direct</strong>
                      <span className="font-light">Direct delivery to banquet halls, hotels, and residences within Lucknow with on-site handling.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-[#8B2131] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2C1810] block font-orange-avenue text-base">Pan-India express logistics</strong>
                      <span className="font-light">Fast air express transit across major cities and towns nationwide with protective packaging.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2C1810] block font-orange-avenue text-base">Shockproof protective packaging</strong>
                      <span className="font-light">Heavy-duty corrugated master cartons cushion every single luxury box.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#2C1810] block font-orange-avenue text-base">Corporate multi-address shipping</strong>
                      <span className="font-light">Send us your recipient sheet; we handle individual labelling and home dispatches.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative aspect-[4/3] rounded-sm overflow-hidden border border-[#E6D5B8]">
                <img
                  src={DELIVERY_PAN_INDIA_IMG}
                  alt="Pan India Delivery Logistics"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: TASTING BOX EXPERIENCE (With Image)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-[#FAF6EE] border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#4D1119] via-[#651A24] to-[#3A0C13] rounded-sm overflow-hidden border-2 border-[#E6C687]/40 shadow-xl text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Image Column */}
              <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[300px]">
                <img
                  src={TASTING_BOX_SAMPLE_IMG}
                  alt="Curated Tasting Box"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#4D1119]/70 lg:to-[#4D1119] opacity-60" />
                <div className="absolute top-4 left-4 bg-[#8B2131] border border-[#E6C687]/40 text-[#E6C687] text-xs font-semibold px-3 py-1 rounded-sm font-sans shadow-sm">
                  Sample Hamper
                </div>
              </div>

              {/* Content Column */}
              <div className="lg:col-span-7 p-8 sm:p-12 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E6C687] text-xs font-medium border border-[#E6C687]/30 font-orange-avenue">
                  <Sparkles className="w-3.5 h-3.5" /> Pre-order tasting experience
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-white">
                  Request a curated tasting box
                </h2>

                <p className="text-xs sm:text-sm text-[#E6D5B8] leading-relaxed font-light max-w-xl">
                  Planning a wedding or large corporate order of 50+ hampers? We will dispatch a customized sample box to your home or office so you can experience the presentation, box quality, and taste before finalizing.
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => openWhatsApp("Hello Raj Luxmi Sweets, I am planning a bulk order of 50+ gift boxes and would like to request a Curated Tasting Box.")}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#C69A4E] via-[#E2BA6F] to-[#C69A4E] hover:from-[#D4AA5E] hover:to-[#D4AA5E] text-[#2C1810] font-orange-avenue text-xs sm:text-sm font-semibold transition-all shadow-md hover:scale-105 cursor-pointer flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" /> Request tasting box on WhatsApp
                  </button>
                  <a
                    href={`tel:+${WHATSAPP_NUMBER}`}
                    className="px-5 py-3.5 border border-[#E6C687]/40 hover:bg-white/10 text-white font-orange-avenue text-xs sm:text-sm transition-all flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call our gifting manager
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: TESTIMONIALS (Authentic, No Fake Metric Numbers)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E6D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-2 font-orange-avenue">
              Patron experiences
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              Loved by families &amp; corporates
            </h2>
            <div className="w-14 h-0.5 bg-[#8B2131] mx-auto mt-3" />
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-7 bg-[#FAF6EE] border border-[#E6D5B8] rounded-sm flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed italic mb-5">
                  &ldquo;For our wedding in Lucknow, we ordered custom gold boxes. The desi ghee sweets were extraordinarily fresh, and the personalized monogram was admired by every single guest.&rdquo;
                </p>
              </div>
              <div className="pt-3.5 border-t border-[#E6D5B8]/80">
                <span className="font-orange-avenue font-medium text-base text-[#2C1810] block">
                  Mrs. Shalini &amp; Alok Tandon
                </span>
                <span className="text-[11px] text-[#5D4037]/70 font-sans">Wedding Hosts, Lucknow &amp; Delhi</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 bg-[#FAF6EE] border border-[#E6D5B8] rounded-sm flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed italic mb-5">
                  &ldquo;We dispatched corporate Diwali hampers to our executive clients across Mumbai, Bangalore, and Gurgaon. The WhatsApp coordination was seamless and zero boxes had any transit damage.&rdquo;
                </p>
              </div>
              <div className="pt-3.5 border-t border-[#E6D5B8]/80">
                <span className="font-orange-avenue font-medium text-base text-[#2C1810] block">
                  Vikramaditya Sengupta
                </span>
                <span className="text-[11px] text-[#5D4037]/70 font-sans">VP Corporate Affairs, FinTech Enterprise</span>
              </div>
            </div>

            <div className="p-6 sm:p-7 bg-[#FAF6EE] border border-[#E6D5B8] rounded-sm flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex text-amber-500 gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed italic mb-5">
                  &ldquo;Raj Luxmi curated our family announcement hampers. The assorted mewa bites, kaju sweets, and custom satin ribbon packaging were breathtaking. Highly recommend!&rdquo;
                </p>
              </div>
              <div className="pt-3.5 border-t border-[#E6D5B8]/80">
                <span className="font-orange-avenue font-medium text-base text-[#2C1810] block">
                  Dr. Radhika Kapoor
                </span>
                <span className="text-[11px] text-[#5D4037]/70 font-sans">Family Celebration, Kanpur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: FAQS ACCORDION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-[#FAF6EE]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#8B2131] tracking-wider block mb-2 font-orange-avenue">
              Questions &amp; answers
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-orange-avenue font-normal text-[#2C1810]">
              Bulk &amp; wedding gifting FAQs
            </h2>
            <div className="w-14 h-0.5 bg-[#8B2131] mx-auto mt-3" />
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "What is the minimum order quantity for bulk pricing?",
                a: "Our bulk volume pricing typically starts at 15 to 25 gift hampers. For orders of 50+ boxes, we offer bespoke custom foiling and monogram embossing at no extra packaging charge."
              },
              {
                q: "Why are gift box orders taken exclusively via WhatsApp?",
                a: "Because our gift boxes are bespoke! We customize sweet assortments, personalized greeting ribbons, monograms, and split-shipping addresses for each client. A direct WhatsApp conversation guarantees that you get personal attention, fresh preparation, and the best corporate rate."
              },
              {
                q: "How many days in advance should we place our bulk order?",
                a: "For weddings and festive hampers of 50 to 500 boxes, we recommend confirming 5 to 10 days in advance. For express requirements or urgent events in Lucknow, we can accommodate shorter turnarounds."
              },
              {
                q: "Can you ship directly to individual recipient addresses across India?",
                a: "Yes! For corporate gifting and distant family members, you can simply provide an Excel sheet of recipient addresses. We pack, label, and air express each hamper with live tracking."
              },
              {
                q: "Do you provide GST invoices for corporate orders?",
                a: "Yes, 100%. All corporate bulk orders receive official GST compliant tax invoices along with formal payment receipts."
              }
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white border border-[#E6D5B8] p-4 sm:p-5 rounded-sm shadow-xs group transition-all"
              >
                <summary className="font-orange-avenue font-normal text-base sm:text-lg text-[#2C1810] cursor-pointer flex items-center justify-between group-hover:text-[#8B2131]">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 text-[#8B2131] transform group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-xs sm:text-sm text-[#5D4037] font-light leading-relaxed mt-2.5 pt-2.5 border-t border-[#E6D5B8]/40 font-sans">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          QUICK PREVIEW MODAL (Viewing Only, WhatsApp Inquiry)
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDF7] border-2 border-[#E6D5B8] max-w-2xl w-full rounded-sm overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-[#8B2131] hover:text-white text-[#2C1810] flex items-center justify-center border border-[#E6D5B8] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="relative aspect-square sm:h-full bg-[#FAF6EE]">
                  <img
                    src={previewProduct.images?.[0] || FALLBACK_BOX_IMG}
                    alt={previewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 sm:p-7 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] tracking-wider text-[#8B2131] font-semibold block mb-1 font-orange-avenue">
                      {previewProduct.categories?.name?.trim() || 'Diwali Special'} &middot; Box Preview
                    </span>
                    <h3 className="font-orange-avenue font-normal text-xl text-[#2C1810] mb-2">
                      {previewProduct.name}
                    </h3>
                    <p className="text-xs text-[#5D4037] leading-relaxed font-light mb-4 whitespace-pre-line">
                      {previewProduct.description || 'Luxury assorted box crafted for royal celebrations, weddings, and executive gifting.'}
                    </p>

                    <div className="space-y-1.5 text-xs text-[#5D4037] pb-3 border-b border-[#E6D5B8]">
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70 font-sans">Starting price:</span>
                        <strong className="text-[#8B2131] font-orange-avenue text-lg">{formatPrice(previewProduct.price)}</strong>
                      </div>
                      {previewProduct.sku && (
                        <div className="flex justify-between">
                          <span className="text-[#5D4037]/70 font-sans">SKU:</span>
                          <span className="font-mono text-[11px]">{previewProduct.sku}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70 font-sans">Category:</span>
                        <span className="font-medium text-[#2C1810] font-sans">{previewProduct.categories?.name || 'Diwali Special'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5D4037]/70 font-sans">Order mode:</span>
                        <span className="font-semibold text-emerald-800 font-sans">WhatsApp concierge</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const name = previewProduct.name;
                        setPreviewProduct(null);
                        openBoxEnquiry(name);
                      }}
                      className="w-full py-3 bg-[#8B2131] hover:bg-[#6d1a26] text-white text-xs font-semibold tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      <MessageCircle className="w-4 h-4" /> Inquire this box on WhatsApp
                    </button>
                    <p className="text-[10px] text-center text-[#5D4037]/70 font-light font-sans">
                      No direct website checkout for gift boxes. Contact us on WhatsApp for custom tiers &amp; bulk rates.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
