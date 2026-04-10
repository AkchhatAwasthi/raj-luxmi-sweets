'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const VIDEO_ID = 'xEzV5uiF4WY';

const VideoTestimonial = () => {
  const [activated, setActivated] = useState(false);

  return (
    <section className="my-20 relative bg-gradient-to-br from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-full text-sm font-medium bg-white shadow-sm">Testimonial</div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-tight mt-5 text-center text-gray-900 font-inter font-normal">
            Customer Experience
          </h2>
          <p className="text-center mt-5 text-gray-600 max-w-md">
            See what our customers have to say about their experience with our sweets.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative pt-[56.25%] rounded-3xl overflow-hidden shadow-xl border-8 border-white shadow-primary/10">
            {activated ? (
              /* Iframe only injected after user clicks — avoids ~500 KB of YouTube JS on load */
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`}
                title="Customer Testimonial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Thumbnail with play button — no YouTube JS loaded until clicked */
              <button
                onClick={() => setActivated(true)}
                className="absolute inset-0 w-full h-full group focus:outline-none"
                aria-label="Play customer testimonial video"
              >
                {/* YouTube's public thumbnail CDN — just a static image, no scripts */}
                <img
                  src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                  alt="Customer Testimonial thumbnail — click to play"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to hqdefault if maxresdefault is unavailable
                    (e.currentTarget as HTMLImageElement).src =
                      `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 text-[#8B2131] fill-[#8B2131] ml-1" />
                  </div>
                </div>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTestimonial;

