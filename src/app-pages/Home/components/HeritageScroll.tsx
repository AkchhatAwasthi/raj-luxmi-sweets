'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import hero3 from '@/assets/3.jpeg';

const HeritageScroll = () => {
    const targetRef = useRef<HTMLDivElement>(null);

    const content = [
        {
            id: 1,
            title: "TRUST",
            subtitle: "#TrustInTradition",
            text: "Trust in Raj Luxmi's commitment to the vibrancy of India; in the tribute we pay to age-old recipes; in our supply and processes; in what we deliver; and in each other."
        },
        {
            id: 2,
            title: "AUTHENTICITY",
            subtitle: "",
            text: "Passionate about honouring traditions while embracing the future. We celebrate the joy and craftsmanship of India's artisans, offering the finest Indian sweets."
        },
        {
            id: 3,
            title: "OUR PROMISE",
            subtitle: "Every single time!",
            text: "An authentic taste of Indian heritage."
        }
    ];

    return (
        <section ref={targetRef} className="relative bg-[#783838]">

            {/* ── MOBILE (< lg): compact image banner + stacked text cards ── */}
            <div className="lg:hidden">

                {/* Image — full natural height, no cropping */}
                <div className="relative w-full overflow-hidden">
                    <img
                        src="https://github.com/AkchhatAwasthi/chetramimages/blob/main/DSC07987.jpg.jpeg?raw=true"
                        alt="Artisan crafting sweets"
                        className="w-full h-auto block"
                    />
                    {/* Bottom fade into section colour */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#783838] to-transparent z-10" />
                </div>

                {/* Text cards — natural height, no h-screen */}
                <div className="relative">
                    {/* Subtle texture overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <img
                            src={hero3.src}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover opacity-10 blur-sm scale-110"
                        />
                        <div className="absolute inset-0 bg-[#783838]/95" />
                    </div>

                    {content.map((item, index) => (
                        <div
                            key={item.id}
                            className={`relative z-10 px-7 py-12 ${index !== 0 ? 'border-t border-[#B38B46]/20' : ''}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                viewport={{ once: false, margin: "-5% 0px -5% 0px" }}
                            >
                                <div className="w-10 h-[2px] bg-[#B38B46] mb-5" />
                                <h2 className="text-lg sm:text-xl font-instrument font-normal text-[#FAF9F6] mb-3 tracking-widest uppercase">
                                    {item.title}
                                </h2>
                                {item.subtitle && (
                                    <p className="text-[#B38B46] font-instrument font-normal tracking-[0.2em] uppercase text-xs sm:text-sm mb-4">
                                        {item.subtitle}
                                    </p>
                                )}
                                <p className="text-[#D4B6A2] text-sm sm:text-base font-light leading-relaxed">
                                    {item.text}
                                </p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── DESKTOP (lg+): original sticky side-by-side layout, untouched ── */}
            <div className="hidden lg:flex flex-row">

                {/* Left — sticky image panel */}
                <div className="lg:w-1/2 h-screen sticky top-0 overflow-hidden z-0">
                    <div className="absolute inset-0 bg-black/10 z-10" />
                    <img
                        src="https://github.com/AkchhatAwasthi/chetramimages/blob/main/DSC07987.jpg.jpeg?raw=true"
                        alt="Artisan crafting sweets"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10" />
                </div>

                {/* Right — scrollable text */}
                <div className="lg:w-1/2 relative bg-[#783838]">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src={hero3.src}
                            alt="Background Texture"
                            className="w-full h-full object-cover opacity-10 blur-sm scale-110 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-[#783838]/95" />
                    </div>

                    <div className="relative z-10">
                        {content.map((item) => (
                            <div
                                key={item.id}
                                className="h-screen flex flex-col justify-center px-16 lg:px-24 border-l border-[#B38B46]/10"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                                >
                                    <div className="w-12 h-[2px] bg-[#B38B46] mb-6" />
                                    <h2 className="text-2xl lg:text-3xl font-instrument font-normal text-[#FAF9F6] mb-4 tracking-wide leading-tight uppercase">
                                        {item.title}
                                    </h2>
                                    {item.subtitle && (
                                        <p className="text-[#B38B46] font-instrument font-normal tracking-[0.2em] uppercase text-sm mb-6">
                                            {item.subtitle}
                                        </p>
                                    )}
                                    <p className="text-[#D4B6A2] text-xl font-light leading-relaxed max-w-md">
                                        {item.text}
                                    </p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
};

export default HeritageScroll;
