import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import holiBanner from '@/assets/holi-banner.png';
import { FEATURED_CATEGORY } from '@/config/featuredCategory';

const CuratedGiftingHero = () => {
  const navigate = useNavigate();

  return (
    <section
      onClick={() => navigate(`/products?category=${FEATURED_CATEGORY}`)}
      aria-label={`Shop ${FEATURED_CATEGORY}`}
      className="relative w-screen cursor-pointer overflow-hidden md:h-screen"
      style={{ marginLeft: 'calc(-50vw + 50%)' }}
    >
      <motion.img
        src={holiBanner}
        alt="Holi Festival Banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        /*
          Mobile  : static flow, full width, auto height → full image visible, no crop
          Desktop (md+) : absolutely fills the 100vh section with object-cover
        */
        className="
          block w-full h-auto
          md:absolute md:inset-0 md:h-full md:w-full md:object-cover md:object-center
        "
        loading="eager"
      />
    </section>
  );
};

export default CuratedGiftingHero;