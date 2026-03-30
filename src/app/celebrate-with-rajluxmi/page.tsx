import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Celebrate with Rajluxmi | Premium Occasions',
  description: 'Celebrate your special moments with premium sweets and gifting from Raj Luxmi.',
};

export default function CelebratePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-instrument font-normal text-[#4A1C1F] mb-8 text-center uppercase tracking-widest">
            Celebrate with Rajluxmi
          </h1>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-[#5C4638] leading-relaxed mb-12">
                We are curating special collections for your celebrations. Stay tuned for our exclusive range of sweets and gift boxes designed to make your occasions unforgettable.
            </p>
            {/* Placeholder for future categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="aspect-[4/3] bg-[#E5D8C6]/20 rounded-sm flex items-center justify-center border border-[#D4B6A2]/30">
                <p className="text-[#B38B46] font-kugile uppercase tracking-widest">Coming Soon</p>
              </div>
              <div className="aspect-[4/3] bg-[#E5D8C6]/20 rounded-sm flex items-center justify-center border border-[#D4B6A2]/30">
                <p className="text-[#B38B46] font-kugile uppercase tracking-widest">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
