'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="divide-y divide-[#E6D5B8] border-t border-[#E6D5B8]">
      {faqs.map((faq, index) => (
        <div key={index} className="py-5">
          <button
            onClick={() => toggle(index)}
            className="flex items-center justify-between w-full text-left group"
            aria-expanded={openIndex === index}
          >
            <span className="font-orange-avenue font-normal text-base text-[#2C1810] group-hover:text-[#8B2131] transition-colors pr-4">
              {faq.question}
            </span>
            {openIndex === index
              ? <Minus className="w-4 h-4 text-[#8B2131] flex-shrink-0" />
              : <Plus className="w-4 h-4 text-[#8B2131] flex-shrink-0" />
            }
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'mt-4 max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-sm text-[#5D4037] leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
