'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useSettings } from '@/hooks/useSettings';

const HeroWhatsAppBar: React.FC = () => {
  const { settings } = useSettings();
  const phone = settings?.store_phone || '+91 9996616153';
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedWhatsAppUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20Raj%20Luxmi%20Sweets%2C%20I%20would%20like%20to%20order%20Diwali%20sweets%20and%20gifting%20hampers`;

  return (
    <section className="w-full bg-[#FAF7F2] py-4 sm:py-6 relative z-20">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="w-full bg-white rounded-2xl sm:rounded-full p-3 sm:p-4 px-4 sm:px-8 shadow-[0_4px_20px_rgba(44,24,16,0.06)] border border-[#E8DED1] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 transition-all duration-300 hover:shadow-md">
          {/* Left Brand & Verified Info */}
          <div className="flex items-center space-x-3.5 w-full sm:w-auto">
            {/* Logo Icon in subtle circle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FAF7F2] border border-[#B38B46]/25 flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
              <div className="relative w-full h-full">
                <Image
                  src={logo}
                  alt="Raj Luxmi"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            </div>

            {/* Profile handle & Phone number */}
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-orange-avenue text-sm sm:text-base font-normal text-[#2C1810] tracking-wide">
                  rajluxmi.sweets
                </span>
                {/* Blue Verified Checkmark Badge */}
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1D9BF0] text-white" title="Verified Brand">
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              </div>
              <span className="text-xs sm:text-sm text-[#7D6B5D] font-mono tracking-wide mt-0.5">
                {phone}
              </span>
            </div>
          </div>

          {/* Right WhatsApp Button */}
          <a
            href={formattedWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#00A884] hover:bg-[#008F6F] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold rounded-xl sm:rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            aria-label="Chat with Raj Luxmi Sweets on WhatsApp"
          >
            {/* WhatsApp Icon */}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.08c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 01-1.25-4.31c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.78 2.39a8.12 8.12 0 012.4 5.79c0 4.51-3.67 8.16-8.18 8.16zm4.49-6.13c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroWhatsAppBar;
