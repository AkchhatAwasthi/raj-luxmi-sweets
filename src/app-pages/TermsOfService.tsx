import React from 'react';
import Link from 'next/link';
import { BookOpen, AlertCircle, ShoppingBag, CreditCard, Scale, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'September 18, 2026';

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Banner */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B38B46]/10 text-[#B38B46] text-xs font-semibold uppercase tracking-widest mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Terms of Use
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-[#4A1C1F] font-bold tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-[#5C4638]/80 text-sm md:text-base max-w-xl mx-auto">
            Please read these terms carefully before placing your order with Raj Luxmi Sweets.
          </p>
          <div className="mt-4 text-xs text-[#5C4638]/60 font-medium">
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D4C3A3]/40 p-6 md:p-10 space-y-8 text-[#5C4638] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">1. Agreement to Terms</h2>
            </div>
            <p className="text-sm md:text-base pl-11">
              By accessing or purchasing from <Link href="/" className="text-[#B38B46] hover:underline font-medium">rajluxmisweets.com</Link> (&ldquo;Website&rdquo;), operated by <strong>Raj Luxmi Sweets</strong> (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you agree to comply with and be bound by these Terms of Service, along with our <Link href="/privacy" className="text-[#B38B46] hover:underline">Privacy Policy</Link>, <Link href="/refund-policy" className="text-[#B38B46] hover:underline">Refund Policy</Link>, and <Link href="/shipping-policy" className="text-[#B38B46] hover:underline">Shipping Policy</Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">2. Product Availability & Freshness Guarantee</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>
                Our sweets and namkeens are freshly prepared daily using authentic ingredients and pure desi ghee. 
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Because our products are artisanal and perishable, weights and visual garnish may vary slightly from catalog photographs.</li>
                <li>Product availability is subject to real-time stock. In the rare event an ordered delicacy is unavailable on that preparation day, our customer care team will notify you immediately for a suitable alternative or prompt refund.</li>
                <li>All products are prepared in accordance with applicable food safety standards (FSSAI).</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">3. Pricing & Payments</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>All prices listed on the Website are in Indian Rupees (INR) and inclusive of applicable GST unless explicitly stated otherwise.</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>We support multiple payment channels: UPI, Credit/Debit Cards, Net Banking (via Cashfree Payments), and Cash on Delivery (COD) for eligible pincodes.</li>
                <li>Online transactions are processed through encrypted, PCI-DSS compliant payment gateways. Raj Luxmi does not retain financial details or banking credentials.</li>
                <li>We reserve the right to revise prices or discontinue products without prior notice. Price changes will not affect orders already confirmed.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">4. Order Confirmation & Acceptance</h2>
            </div>
            <p className="text-sm md:text-base pl-11">
              Upon placing an order, you will receive an automated confirmation email/SMS with your unique Order ID. Order acceptance takes place once your order is confirmed by our store and prepared for dispatch. We reserve the right to decline or cancel orders in cases of pricing discrepancies, suspected fraudulent activity, or unserviceable delivery locations.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">5. Intellectual Property & Governing Law</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>
                All trademarks, brand names, recipes, packaging designs, text, logos, and images on this Website are the exclusive intellectual property of <strong>Raj Luxmi Sweets</strong>. Any unauthorized reproduction is strictly prohibited.
              </p>
              <p>
                These Terms are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Lucknow, Uttar Pradesh</strong>.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">6. Contact Information</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>If you have any questions regarding these Terms of Service, please contact us:</p>
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#D4C3A3]/50 text-sm space-y-1">
                <p><strong>Raj Luxmi The Mithai Shop</strong></p>
                <p>Brej Palace, Near Ashiyana Power House Chauraha, Lucknow &ndash; 226012, Uttar Pradesh, India</p>
                <p>Phone: <a href="tel:+919996616153" className="text-[#B38B46] hover:underline">+91 99966 16153</a></p>
                <p>Email: <a href="mailto:contact@rajluxmisweets.com" className="text-[#B38B46] hover:underline">contact@rajluxmisweets.com</a></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
