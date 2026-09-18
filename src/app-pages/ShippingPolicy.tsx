import React from 'react';
import Link from 'next/link';
import { Truck, PackageCheck, MapPin, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

const ShippingPolicy = () => {
  const lastUpdated = 'September 18, 2026';

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Banner */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B38B46]/10 text-[#B38B46] text-xs font-semibold uppercase tracking-widest mb-3">
            <Truck className="w-3.5 h-3.5" />
            Reliable Delivery
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-[#4A1C1F] font-bold tracking-tight mb-3">
            Shipping & Delivery Policy
          </h1>
          <p className="text-[#5C4638]/80 text-sm md:text-base max-w-xl mx-auto">
            From our kitchen to your celebration &mdash; freshly handcrafted, carefully sealed, and delivered with royal care.
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
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">1. Processing & Preparation Timelines</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>
                To maintain our legacy of taste and texture, our sweets and savouries are prepared in artisanal batches.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Same-Day Orders (Local Lucknow):</strong> Orders placed before 4:00 PM are processed and dispatched on the same day.</li>
                <li><strong>Pan-India Courier Shipments:</strong> Orders are freshly packed and dispatched within <strong>24 to 48 hours</strong> of order placement.</li>
                <li><strong>Festive Pre-Orders & Bulk Gifting:</strong> During peak festival seasons (Diwali, Raksha Bandhan, Holi), we recommend scheduling orders at least 3-4 days in advance to guarantee preferred delivery dates.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">2. Delivery Zones & Estimated Transit Times</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm border-collapse border border-[#D4C3A3]/40">
                  <thead className="bg-[#FAF7F2] text-[#4A1C1F] font-serif font-semibold">
                    <tr>
                      <th className="p-3 border border-[#D4C3A3]/40">Delivery Zone</th>
                      <th className="p-3 border border-[#D4C3A3]/40">Shipping Mode</th>
                      <th className="p-3 border border-[#D4C3A3]/40">Estimated Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#D4C3A3]/30">
                      <td className="p-3 font-medium border border-[#D4C3A3]/40">Lucknow City (Local)</td>
                      <td className="p-3 border border-[#D4C3A3]/40">Express Same-Day / Next-Day Courier</td>
                      <td className="p-3 border border-[#D4C3A3]/40">2 to 6 Hours / Same Day</td>
                    </tr>
                    <tr className="border-b border-[#D4C3A3]/30">
                      <td className="p-3 font-medium border border-[#D4C3A3]/40">Metro Cities (Delhi, Mumbai, etc.)</td>
                      <td className="p-3 border border-[#D4C3A3]/40">Air Express Priority Courier</td>
                      <td className="p-3 border border-[#D4C3A3]/40">2 to 3 Working Days</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium border border-[#D4C3A3]/40">Rest of India</td>
                      <td className="p-3 border border-[#D4C3A3]/40">Standard Surface / Air Express</td>
                      <td className="p-3 border border-[#D4C3A3]/40">3 to 6 Working Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#5C4638]/70">
                * Transit times may vary during adverse weather conditions, public holidays, or festival rushes.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <PackageCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">3. Food-Grade Packaging & Freshness Assurance</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>Because sweets require exceptional handling:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>All delicacies are sealed in certified food-grade, airtight, tamper-evident containers to prevent exposure to moisture.</li>
                <li>Boxes are secured in multi-layered cushioned outer cartons to prevent crushing or displacement during courier transit.</li>
                <li>Fragile or syrup-based sweets (e.g. Rasgulla, Gulab Jamun) are shipped in heavy-duty sealed tins or vacuum containers.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">4. Shipping Charges & Tracking</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Shipping costs are calculated automatically at checkout based on destination pincode and package weight.</li>
                <li>Once dispatched, you will receive an SMS and WhatsApp update with your tracking link and AWB number.</li>
                <li>You can also track your live delivery status anytime on our <Link href="/order-detail" className="text-[#B38B46] hover:underline font-medium">Order Tracking</Link> page.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">5. Delivery Queries & Support</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>For urgent shipping queries or address adjustments, please contact our dispatch desk:</p>
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#D4C3A3]/50 text-sm space-y-1">
                <p><strong>Raj Luxmi Dispatch Desk</strong></p>
                <p>Brej Palace, Near Ashiyana Power House Chauraha, Lucknow &ndash; 226012, Uttar Pradesh, India</p>
                <p>Phone / WhatsApp: <a href="tel:+919996616153" className="text-[#B38B46] hover:underline">+91 99966 16153</a></p>
                <p>Email: <a href="mailto:contact@rajluxmisweets.com" className="text-[#B38B46] hover:underline">contact@rajluxmisweets.com</a></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
