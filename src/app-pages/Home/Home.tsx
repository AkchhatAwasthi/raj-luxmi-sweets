'use client';

import React from 'react';
import CuratedGiftingHero from './components/CuratedGiftingHero';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import MarqueeSection from './components/MarqueeSection';
import SpecialOffers from './components/SpecialOffers';
import InstagramCarousel from './components/InstagramCarousel';
import Testimonials from '@/components/ui/testimonials';
import PromotionalBanner from './components/PromotionalBanner';
import MithaiSpecials from './components/MithaiSpecials';
import FestivalSpecials from './components/FestivalSpecials';
import DeliverySection from './components/DeliverySection';
import HeritageScroll from './components/HeritageScroll';
import FloatingProductWidget from './components/FloatingProductWidget';

const Home = () => {
  return (
    <main className="min-h-screen">
      <CuratedGiftingHero />
      <div className="flex flex-col">
        <BestSellers />
        <CategoriesCarousel />
        <NewArrivals />
        <PromotionalBanner />

        <MarqueeSection
          items={[
            "CROWD FAVORITES",
            "MOST LOVED SWEETS",
            "SIGNATURE DELIGHTS",
            "TOP RATED",
            "CUSTOMERS' CHOICE",
            "BEST SELLING TREATS"
          ]}
          className="py-6"
        />

        <MithaiSpecials />
        <FestivalSpecials />
        {/* <SpecialOffers /> */}
        <HeritageScroll />
        <Testimonials />
        <DeliverySection />
        <InstagramCarousel />
      </div>
      <FloatingProductWidget />
    </main>
  );
};

export default Home;
