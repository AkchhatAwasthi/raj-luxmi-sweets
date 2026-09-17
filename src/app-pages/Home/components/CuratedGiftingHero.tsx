'use client';

import React from 'react';
import Image from 'next/image';

const PC_BANNER = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1789637410/222_1_bvp8ia.png';
const MOBILE_BANNER = 'https://res.cloudinary.com/dmj0smemf/image/upload/f_auto,q_auto/v1789638998/33_tnzp5g.png';

const CuratedGiftingHero = () => {
  const handleBannerClick = () => {
    const el = document.getElementById('modak-special');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero-banner"
      className="relative w-screen bg-[#FAF9F6] overflow-hidden select-none"
      style={{ marginLeft: 'calc(-50vw + 50%)' }}
      aria-label="Raj Luxmi Sweets - Modak Special Banner"
    >
      {/* Visually hidden H1 for SEO optimization */}
      <h1 className="sr-only">Raj Luxmi Sweets - Modak Special Ganesh Chaturthi Collection</h1>

      <div
        onClick={handleBannerClick}
        className="w-full cursor-pointer block"
        role="button"
        tabIndex={0}
      >
        {/* Desktop / PC Banner */}
        <div className="hidden md:block w-full">
          <Image
            src={PC_BANNER}
            alt="Raj Luxmi Sweets Modak Special Banner"
            width={1942}
            height={809}
            priority
            sizes="100vw"
            className="w-full h-auto block object-cover"
          />
        </div>

        {/* Mobile Banner */}
        <div className="block md:hidden w-full">
          <Image
            src={MOBILE_BANNER}
            alt="Raj Luxmi Sweets Modak Special Banner"
            width={1086}
            height={1448}
            priority
            sizes="100vw"
            className="w-full h-auto block object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default CuratedGiftingHero;
