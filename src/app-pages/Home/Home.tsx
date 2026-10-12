'use client';

import React from 'react';
import DiwaliHeroSection from './components/DiwaliHeroSection';
import HeroWhatsAppBar from './components/HeroWhatsAppBar';
import TrustBar from './components/TrustBar';
import DiwaliSpecialSection from './components/DiwaliSpecialSection';
import DiwaliBannersSection from './components/DiwaliBannersSection';
import QuickCategoryCircles from './components/QuickCategoryCircles';
import TabbedProductShowcase from './components/TabbedProductShowcase';
import CorporateWeddingGifting from './components/CorporateWeddingGifting';
import LegacyOfTaste from './components/LegacyOfTaste';
import DualDeliverySpotlight from './components/DualDeliverySpotlight';
import MarqueeSection from './components/MarqueeSection';
import HeritageScroll from './components/HeritageScroll';
import Testimonials from '@/components/ui/testimonials';
import DeliverySection from './components/DeliverySection';

const Home = () => {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      {/* 1. Diwali Festive Hero Banner (Desktop reference match & Mobile shoot portrait) */}
      <DiwaliHeroSection />

      {/* 2. WhatsApp Official Info Bar (Pill design matching verified brand) */}
      <HeroWhatsAppBar />

      {/* 3. 4-Pillar Trust & Value Proposition Strip */}
      <TrustBar />

      <div className="flex flex-col">
        {/* 3. Dedicated Diwali Special Section (Curated Hampers & Festive Sweets) */}
        <DiwaliSpecialSection />

        {/* 4. Grand Diwali Banners & Festive Shoot Moments Showcase */}
        <DiwaliBannersSection />

        {/* 5. Quick Discovery Category Circles */}
        <QuickCategoryCircles />

        {/* 6. Unified Tabbed Product Showcase (Bestsellers | Mithai | Namkeen | Gifting) */}
        <TabbedProductShowcase />

        {/* 7. Royal Wedding & Corporate Bulk Gifting Banner */}
        <CorporateWeddingGifting />

        {/* 8. Our Legacy of Taste (Purity Standard) */}
        <LegacyOfTaste />

        {/* 9. Dual Delivery Spotlight (Lucknow Same-Day & Pan-India Air Express) */}
        <DualDeliverySpotlight />

        {/* 10. Minimal Brand & Festive Ticker */}
        <MarqueeSection
          items={[
            "YE DIWALI, RAJLUXMI WALI",
            "100% PURE DESI GHEE",
            "ROYAL LUCKNOWI RECIPES",
            "DIWALI FESTIVE HAMPERS",
            "PAN-INDIA EXPRESS AIR DELIVERY",
            "BESPOKE CORPORATE GIFTING",
            "HANDCRAFTED PURITY GUARANTEED"
          ]}
          className="py-3 bg-[#F9F3EA]"
        />

        {/* 11. Heritage, Authenticity & Trust Scroll */}
        <HeritageScroll />

        {/* 12. Customer Reviews & Social Proof */}
        <Testimonials />

        {/* 13. Same Day Lucknow Delivery & Security Badges */}
        <DeliverySection />
      </div>
    </main>
  );
};

export default Home;
