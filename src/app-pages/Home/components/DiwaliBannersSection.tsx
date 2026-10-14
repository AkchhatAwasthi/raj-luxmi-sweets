'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Gift, Sparkles, PhoneCall, ShieldCheck, Truck } from 'lucide-react';

// Photoshoot URLs strictly adhering to the user's links and /f_auto,q_auto/ optimization
const BANNER_HAMPER = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790962/DSC01048.JPG_x1z9my.jpg';
const BANNER_BAKLAWA = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790962/DSC00934.JPG_l0kllx.jpg';
const BANNER_SHARING = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790962/DSC01529_cmnbtw.jpg';
const BANNER_KAFU_CANDLE = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790965/DSC00866_wu7zwn.jpg';

// Shoot Gallery Images for festive emotion strip
const FESTIVE_MOMENTS = [
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790961/DSC01722_zuzklh.jpg',
    title: 'Phuljhadi & Diya Aarti',
    subtitle: 'The radiant spirit of Diwali night',
  },
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790961/DSC01657_ha66hv.jpg',
    title: 'Hasi Aur Mithas',
    subtitle: 'Moments of unbridled festive joy',
  },
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790963/DSC01351_ylysd8.jpg',
    title: 'Swaad Apno Ka',
    subtitle: 'Sharing handcrafted royal mithai',
  },
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790961/DSC01664_jhawhw.jpg',
    title: 'Parampara & Pyar',
    subtitle: 'The timeless Raj Luxmi family celebration',
  },
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790960/IMG_0155_alzw8o.jpg',
    title: '100% Desi Ghee Bliss',
    subtitle: 'Melt-in-mouth Awadhi perfection',
  },
  {
    url: 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1791790963/DSC01383_o6kgzs.jpg',
    title: 'Gulab & Mewa Delights',
    subtitle: 'Artisanal dry fruit celebration boxes',
  },
];

const DiwaliBannersSection: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-full bg-[#FAF7F2] space-y-12 md:space-y-20 py-8 md:py-16">
      {/* ========================================================================= */}
      {/* 1. HEROIC SPLIT BANNER: GRAND WICKER HAMPER & CORPORATE DIWALI GIFTING */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#23130D] via-[#2F180F] to-[#1A0B06] border border-[#B38B46]/30 shadow-2xl text-white">
          {/* Subtle gold decorative backdrop lights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5B56E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B38B46]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[520px]">
            {/* Left Shoot Image: Hamper Portrait */}
            <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[540px] overflow-hidden">
              <Image
                src={BANNER_HAMPER}
                alt="Raj Luxmi Sweets Grand Diwali Wicker Hamper"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[center_35%] transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23130D] via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#23130D]/70 hidden lg:block" />

              {/* Float badge on image */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 bg-[#1A0B06]/90 border border-[#E5B56E]/40 px-4 py-2 rounded-lg">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#E5B56E] font-normal font-orange-avenue">
                  The Royal Wicker Hamper 2026
                </span>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-6 z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E5B56E]/15 border border-[#E5B56E]/30 w-fit">
                <Gift className="w-3.5 h-3.5 text-[#E5B56E]" />
                <span className="text-[10px] sm:text-xs font-normal tracking-[0.22em] text-[#E5B56E] uppercase font-orange-avenue">
                  Corporate & Royal Family Gifting
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#FFF6E9] leading-tight font-normal uppercase tracking-wide font-orange-avenue">
                  Grand Diwali Hampers That Tell A Royal Story
                </h3>
                <p className="text-xs sm:text-sm text-[#D4C3B2] font-normal leading-relaxed max-w-xl font-orange-avenue">
                  Impress your clients, partners, and dearest family members with bespoke Raj Luxmi gift boxes. Crafted with 100% pure desi ghee sweets, premium Californian dry fruits, and regal presentation.
                </p>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-white/10 border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-[#E5B56E] mb-1.5" />
                  <div className="text-xs font-normal text-white uppercase font-orange-avenue tracking-wide">Custom Branding</div>
                  <div className="text-[11px] text-[#C4B29E] font-orange-avenue">Personalized sleeves & cards</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/15">
                  <Truck className="w-4 h-4 text-[#E5B56E] mb-1.5" />
                  <div className="text-xs font-normal text-white uppercase font-orange-avenue tracking-wide">Pan-India Express</div>
                  <div className="text-[11px] text-[#C4B29E] font-orange-avenue">Direct doorstep dispatch</div>
                </div>
                <div className="p-3 rounded-lg bg-white/10 border border-white/15">
                  <Sparkles className="w-4 h-4 text-[#E5B56E] mb-1.5" />
                  <div className="text-xs font-normal text-white uppercase font-orange-avenue tracking-wide">Bespoke Curation</div>
                  <div className="text-[11px] text-[#C4B29E] font-orange-avenue">Custom sweet assortments</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                <a
                  href="https://wa.me/918448447408?text=Hi%20Raj%20Luxmi%20Sweets%2C%20we%20want%20to%20order%20Custom%20Diwali%20Hampers%20for%20our%20company"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#E5B56E] hover:bg-[#F2C785] text-[#2C1810] rounded-md text-xs sm:text-sm font-normal tracking-[0.14em] uppercase font-orange-avenue transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Enquire Corporate Bulk</span>
                </a>

                <a
                  href="https://res.cloudinary.com/dmj0smemf/image/upload/v1791800492/Rajluxmi_Diwali_Catalogue_1__compressed_aumrdz.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-transparent hover:bg-white/10 text-[#FFF6E9] border border-[#E5B56E]/50 rounded-md text-xs sm:text-sm font-normal tracking-wider uppercase font-orange-avenue transition-all duration-300 cursor-pointer"
                >
                  <span>Explore Gifting Catalog (PDF)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DUAL FEATURE BANNERS: BAKLAWA TIN & SHAHI VELVET BOXES                 */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Banner Left: Artisanal Baklawa Collection */}
          <div className="relative overflow-hidden rounded-xl bg-[#281510] border border-[#B38B46]/25 group min-h-[420px] flex flex-col justify-end p-6 sm:p-8">
            <Image
              src={BANNER_BAKLAWA}
              alt="Imperial Baklawa & Dry Fruits Raj Luxmi Sweets"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F0E09] via-[#1F0E09]/75 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-2.5">
              <span className="text-[10px] sm:text-xs font-normal tracking-[0.25em] text-[#E5B56E] uppercase font-orange-avenue">
                Artisanal Baklawa Tin
              </span>
              <h4 className="text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide font-orange-avenue">
                Turkish Crunch & Pure Desi Ghee
              </h4>
              <p className="text-xs sm:text-sm text-[#D8C7B5] font-normal max-w-md line-clamp-2 font-orange-avenue">
                Multi-layered pastry loaded with crunchy pistachios and golden dry fruits, encased in an ornate gift tin.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push('/category/mewa-bites-baklava')}
                  className="inline-flex items-center space-x-2 text-xs sm:text-sm font-normal tracking-widest text-[#E5B56E] hover:text-[#FFF6E9] transition-colors uppercase font-orange-avenue group-hover:translate-x-1 duration-300 cursor-pointer"
                >
                  <span>Explore Baklawa Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Banner Right: Shahi Velvet & Kaju Katli Heritage */}
          <div className="relative overflow-hidden rounded-xl bg-[#1B1A24] border border-[#B38B46]/25 group min-h-[420px] flex flex-col justify-end p-6 sm:p-8">
            <Image
              src={BANNER_SHARING}
              alt="Raj Luxmi Sweets Velvet Gift Box"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120E1C] via-[#120E1C]/75 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-2.5">
              <span className="text-[10px] sm:text-xs font-normal tracking-[0.25em] text-[#E5B56E] uppercase font-orange-avenue">
                Royal Keepsake Boxes
              </span>
              <h4 className="text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide font-orange-avenue">
                Khushiyon Ka Swaad, Apno Ke Naam
              </h4>
              <p className="text-xs sm:text-sm text-[#D8C7B5] font-normal max-w-md line-clamp-2 font-orange-avenue">
                Pure silver-vark cashew delicacies, saffron pedas & handcrafted mithai presented in royal velvet keepsakes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push('/category/diwali-specials')}
                  className="inline-flex items-center space-x-2 text-xs sm:text-sm font-normal tracking-widest text-[#E5B56E] hover:text-[#FFF6E9] transition-colors uppercase font-orange-avenue group-hover:translate-x-1 duration-300 cursor-pointer"
                >
                  <span>Discover Shahi Boxes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FESTIVE MOMENTS GALLERY STRIP (Actual Shoot Authenticity)              */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-8">
          <span className="text-[10px] sm:text-xs font-normal tracking-[0.25em] text-[#8C5E1B] uppercase font-orange-avenue">
            Ye Diwali, Rajluxmi Wali
          </span>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl text-[#2C1810] font-normal mt-1 uppercase tracking-wide font-orange-avenue">
            Moments Of Royal Joy & Pure Celebration
          </h3>
          <p className="text-xs sm:text-sm text-[#6E4F39] font-normal mt-1 max-w-xl mx-auto font-orange-avenue">
            From laughter shared over pure desi ghee laddoos to the warm glow of diyas, celebrate with timeless Awadhi authenticity.
          </p>
        </div>

        {/* 6-Item Festive Shoot Collage */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {FESTIVE_MOMENTS.map((item, index) => (
            <div
              key={index}
              className="group relative h-64 sm:h-72 rounded-xl overflow-hidden border border-[#B38B46]/20 shadow-sm"
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                <p className="text-xs sm:text-sm font-normal text-[#FFF6E9] leading-snug uppercase tracking-wide font-orange-avenue">
                  {item.title}
                </p>
                <p className="text-[10px] text-[#E5B56E] line-clamp-1 font-normal mt-0.5 font-orange-avenue">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiwaliBannersSection;
