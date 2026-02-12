import React, { useState, useEffect } from 'react';
import hero2 from '@/assets/1.png';
import hero3 from '@/assets/10 (3).png';
import hero1 from '@/assets/9 (3).png';

const sliderData = [
  {
    id: 1,
    image: hero1
  },
  {
    id: 2,
    image: hero2
  },
  {
    id: 3,
    image: hero3
  }
];

const CuratedGiftingHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = sliderData[currentSlide];

  return (
    <section className="relative h-[50dvh] md:h-[60dvh] w-full overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 z-0">
        <img
          src={currentSlideData.image}
          alt={`Slide ${currentSlideData.id}`}
          className="w-full h-full object-cover"
          loading={currentSlide === 0 ? "eager" : "lazy"}
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 flex space-x-3 z-30 justify-center w-full">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 transition-all duration-500 rounded-full ${index === currentSlide ? 'w-12 bg-secondary' : 'w-4 bg-white/30 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default CuratedGiftingHero;