'use client';

import React from 'react';
import CuratedGiftingHero from './components/CuratedGiftingHero';
import TrustBar from './components/TrustBar';
import QuickCategoryCircles from './components/QuickCategoryCircles';
import TabbedProductShowcase from './components/TabbedProductShowcase';
import CorporateWeddingGifting from './components/CorporateWeddingGifting';
import LegacyOfTaste from './components/LegacyOfTaste';
import DualDeliverySpotlight from './components/DualDeliverySpotlight';
import MarqueeSection from './components/MarqueeSection';
import HeritageScroll from './components/HeritageScroll';
import Testimonials from '@/components/ui/testimonials';
import DeliverySection from './components/DeliverySection';
import FloatingProductWidget from './components/FloatingProductWidget';

const Home = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      {/* 1. Hero Slideshow with Direct CTAs */}
      <CuratedGiftingHero />

      {/* 2. 4-Pillar Trust & Value Proposition Strip */}
      <TrustBar />

      <div className="flex flex-col">
        {/* 3. Quick Discovery Category Circles */}
        <QuickCategoryCircles />

        {/* 4. Unified Tabbed Product Showcase (Bestsellers | Mithai | Namkeen | Gifting) */}
        <TabbedProductShowcase />

        {/* 5. Royal Wedding & Corporate Bulk Gifting Banner */}
        <CorporateWeddingGifting />

        {/* 6. Our Legacy of Taste (Purity Standard) */}
        <LegacyOfTaste />

        {/* 7. Dual Delivery Spotlight (Lucknow Same-Day & Pan-India Air Express) */}
        <DualDeliverySpotlight />

        {/* 8. Minimal Brand Ticker */}
        <MarqueeSection
          items={[
            "100% PURE DESI GHEE",
            "ROYAL LUCKNOWI RECIPES",
            "CROWD FAVORITES",
            "FRESHNESS GUARANTEED",
            "BESPOKE GIFTING",
            "AUTHENTIC TASTE"
          ]}
          className="py-3 bg-[#F9F3EA]"
        />

        {/* 10. Heritage, Authenticity & Trust Scroll */}
        <HeritageScroll />

        {/* 11. Customer Reviews & Social Proof */}
        <Testimonials />

        {/* 12. Same Day Lucknow Delivery & Security Badges */}
        <DeliverySection />
      </div>

      {/* 13. Quick Cart / Floating Product Widget */}
      <FloatingProductWidget />
    </main>
  );
};

export default Home;
