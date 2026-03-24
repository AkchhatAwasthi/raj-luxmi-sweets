'use client';

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";
import { useState } from "react";
import { testimonials as localTestimonials, Testimonial } from "@/data/testimonials";

const Testimonials = () => {
  const [testimonials] = useState<Testimonial[]>(localTestimonials);
  const [loading] = useState(false);

  if (loading) {
    return (
      <section className="py-24 relative bg-[#FFFDF7] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center justify-center max-w-[800px] mx-auto text-center mb-16">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[#8B2131] mb-4 block">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-4xl font-instrument font-normal text-[#2C1810] mb-6 uppercase">
              WHAT OUR CUSTOMERS SAY
            </h2>
          </div>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B2131]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="py-24 relative bg-[#F9F3EA] overflow-hidden">
      {/* Royal Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFEBE8] rounded-full filter blur-[120px] opacity-40 pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[800px] mx-auto text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#8B2131]"></span>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B2131]">TESTIMONIALS</div>
            <span className="w-8 h-[1px] bg-[#8B2131]"></span>
          </div>

          <h2 className="text-3xl md:text-5xl font-instrument font-normal text-[#2C1810] mb-6 uppercase">
            WORDS OF DELIGHT
          </h2>
          <p className="text-lg text-[#5D4037] max-w-2xl mx-auto font-light leading-relaxed">
            Discover why our customers fall in love with the authentic taste and premium quality of our sweets.
          </p>
        </motion.div>

        <div className="flex justify-center gap-2 md:gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={30} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
