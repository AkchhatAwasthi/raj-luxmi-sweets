import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Bell, HelpCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = 'September 18, 2026';

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Banner */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B38B46]/10 text-[#B38B46] text-xs font-semibold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Legal & Compliance
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-[#4A1C1F] font-bold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-[#5C4638]/80 text-sm md:text-base max-w-xl mx-auto">
            At Raj Luxmi, we treasure your trust just as deeply as our culinary heritage. Here is how we protect your personal information.
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
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">1. Introduction</h2>
            </div>
            <p className="text-sm md:text-base pl-11">
              Welcome to <strong>Raj Luxmi Sweets</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website <Link href="/" className="text-[#B38B46] hover:underline font-medium">rajluxmisweets.com</Link> or purchase our handcrafted sweets, namkeens, and festive gift boxes. By accessing or using our platform, you consent to the data practices described in this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <Eye className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">2. Information We Collect</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-3">
              <p>We collect information you provide directly to us when placing an order, registering an account, or contacting our team:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Contact Details:</strong> Full name, email address, phone number, delivery address, and pincode.</li>
                <li><strong>Order & Transaction Records:</strong> Purchased items, order history, billing address, and delivery instructions.</li>
                <li><strong>Payment Information:</strong> All online payments are securely processed by authorized payment gateways (e.g., Cashfree). We <strong>never</strong> store your raw credit/debit card numbers, CVVs, or UPI PINs on our servers.</li>
                <li><strong>Communication Logs:</strong> Queries, feedback, reviews, and customer support messages sent via WhatsApp, email, or our contact form.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">3. How We Use Your Information</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>We use your information exclusively for legitimate business purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li>Processing, fulfilling, and delivering your sweet orders with temperature-sensitive dispatch.</li>
                <li>Sending real-time order updates, tracking information, and digital invoices via SMS, WhatsApp, and email.</li>
                <li>Preventing fraudulent transactions and ensuring payment authentication through verified gateways.</li>
                <li>Customer support, handling inquiries, and resolving delivery feedback.</li>
                <li>Sending occasional festive promotions, seasonal delicacies, or special discounts (you may opt out at any time).</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">4. Payment Gateway Security & Compliance</h2>
            </div>
            <p className="text-sm md:text-base pl-11">
              Payment security is our highest priority. All online transactions on <Link href="/" className="text-[#B38B46] hover:underline">rajluxmisweets.com</Link> are encrypted using standard Transport Layer Security (TLS/SSL) encryption and processed through <strong>RBI-authorized payment aggregators (such as Cashfree Payments)</strong> adhering to <strong>PCI-DSS Level 1 compliance</strong> standards. We do not store or retain your financial credentials.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">5. Data Sharing & Third-Party Disclosure</h2>
            </div>
            <p className="text-sm md:text-base pl-11">
              We <strong>do not sell, rent, or trade</strong> your personal information to third-party marketers. We only share necessary delivery details with:
            </p>
            <ul className="list-disc pl-16 space-y-1.5 text-sm">
              <li><strong>Courier & Delivery Partners:</strong> To ensure your orders reach your doorstep in peak freshness.</li>
              <li><strong>Payment Gateways:</strong> To authorize and securely process payments.</li>
              <li><strong>Legal Requirements:</strong> If mandated by law enforcement or Indian legal authorities.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#D4C3A3]/50 flex items-center justify-center text-[#B38B46]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-serif text-[#4A1C1F] font-semibold">6. Contact Us & Grievance Redressal</h2>
            </div>
            <div className="text-sm md:text-base pl-11 space-y-2">
              <p>For any privacy-related questions, data update requests, or grievances, please reach out to our Grievance Officer:</p>
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

export default PrivacyPolicy;
