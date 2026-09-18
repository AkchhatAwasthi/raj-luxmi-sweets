import React from 'react';
import Link from 'next/link';
import { RotateCcw, XCircle, Clock, CreditCard, ShieldAlert, HelpCircle } from 'lucide-react';

const RefundPolicy = () => {
  const lastUpdated = 'September 18, 2026';

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Banner */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B38B46]/10 text-[#B38B46] text-xs font-semibold uppercase tracking-widest mb-3">
            <RotateCcw className="w-3.5 h-3.5" />
            Customer Assurance
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-[#4A1C1F] font-bold tracking-tight mb-3">
            Refund & Cancellation Policy
          </h1>
          <p className="text-[#5C4638]/80 text-sm md:text-base max-w-xl mx-auto">
            Our commitment is your 100% satisfaction and genuine royal taste. Here is our transparent refund and cancellation policy.
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
                <XCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">1. Order Cancellation Policy</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>
                We prepare all artisanal sweets and delicacies fresh upon receiving your order.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Cancellation Window:</strong> You may cancel your order within <strong>1 hour</strong> of placing it or before the order has been dispatched from our kitchen, whichever is earlier.</li>
                <li><strong>How to Cancel:</strong> To cancel, call or WhatsApp our customer care immediately at <a href="tel:+919996616153" className="text-[#B38B46] font-medium hover:underline">+91 99966 16153</a> with your Order ID.</li>
                <li><strong>Post-Dispatch:</strong> Once an order is prepared and out for delivery / handed to the courier partner, cancellations cannot be processed due to the perishable nature of fresh food items.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">2. Returns & Perishable Goods Notice</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>
                In compliance with Food Safety and Standards Authority of India (FSSAI) hygiene regulations, <strong>food and sweet items are non-returnable</strong> once delivered.
              </p>
              <p>
                However, we offer full replacements or refunds under the following verified conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>The packaging was severely damaged or unsealed upon delivery.</li>
                <li>An incorrect product was delivered by our delivery partner.</li>
                <li>The product has expired, spoiled, or failed freshness checks upon arrival.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">3. Reporting an Issue & Claims Process</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>To claim a replacement or refund for a damaged or incorrect order:</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm">
                <li>Contact us within <strong>24 hours</strong> of receiving the package.</li>
                <li>Provide clear photographs or a short video showing the outer package, shipping label, and the condition of the affected item.</li>
                <li>Send the details via WhatsApp to <a href="tel:+919996616153" className="text-[#B38B46] hover:underline font-medium">+91 99966 16153</a> or email <a href="mailto:contact@rajluxmisweets.com" className="text-[#B38B46] hover:underline font-medium">contact@rajluxmisweets.com</a> along with your Order ID.</li>
                <li>Our quality team will review your claim and issue an approval within 24 business hours.</li>
              </ol>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">4. Refund Method & Processing Timelines</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>Once a refund is approved by our team:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Prepaid Orders (UPI / Card / Net Banking via Cashfree):</strong> The refund is initiated automatically to the original source account. Funds typically reflect within <strong>5 to 7 working days</strong>, subject to your bank&rsquo;s clearing cycle.</li>
                <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds will be issued via direct UPI transfer or NEFT/IMPS to the customer&rsquo;s verified bank account within <strong>3 to 5 working days</strong> of bank details submission.</li>
                <li>You will receive an SMS and email notification confirming the initiation and transaction reference number of the refund.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">5. Customer Support & Assistance</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>For any refund status inquiries or delivery assistance, our team is always ready to assist you:</p>
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#D4C3A3]/50 text-sm space-y-1">
                <p><strong>Raj Luxmi Customer Care</strong></p>
                <p>Brej Palace, Near Ashiyana Power House Chauraha, Lucknow &ndash; 226012, Uttar Pradesh, India</p>
                <p>Phone / WhatsApp: <a href="tel:+919996616153" className="text-[#B38B46] hover:underline">+91 99966 16153</a></p>
                <p>Email: <a href="mailto:contact@rajluxmisweets.com" className="text-[#B38B46] hover:underline">contact@rajluxmisweets.com</a></p>
                <p>Support Hours: 9:00 AM &ndash; 8:00 PM (Monday to Sunday)</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
