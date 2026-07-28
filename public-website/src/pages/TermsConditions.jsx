import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    content: `By accessing or placing an order on Olive Seeds, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our website or services.

These terms apply to all visitors, users, and customers of Olive Seeds, including those who browse, purchase physical engraved products, or download digital design products from our platform.`,
  },
  {
    id: "products",
    number: "02",
    title: "Products & Services",
    content: `Olive Seeds offers two categories of products:

Physical Engraved Products — Custom laser-engraved items including nameboards, keychains, mugs, photo frames, and corporate gifts. Each physical product is handcrafted and personalised to your specifications. Due to the custom nature of engraving, minor variations in wood grain, colour tone, and finish may occur and are considered part of the product's natural character.

Digital Products — Downloadable design files including logo kits, templates, social media packs, and mockup bundles. Digital products are delivered electronically and are not physical goods.

All product descriptions, images, and specifications are provided in good faith. We reserve the right to modify, discontinue, or change pricing on any product without prior notice.`,
  },
  {
    id: "ordering",
    number: "03",
    title: "Orders & Payments",
    content: `When you place an order, you are making a binding offer to purchase the selected product(s) at the stated price. Your order is confirmed only upon receipt of a confirmation email from Olive Seeds containing your unique Order ID and Invoice ID.

Prices are displayed in Indian Rupees (₹) by default and may be shown in your local currency using our live conversion tool. Final billing is processed in INR. Currency conversion rates are indicative and subject to change.

We accept payments via Razorpay, which supports UPI, credit cards, debit cards, and net banking. For Cash on Delivery not accepted.

In the event of a pricing error, we reserve the right to cancel an order and issue a refund.`,
  },
  {
    id: "customisation",
    number: "04",
    title: "Custom Engraving & Personalisation",
    content: `You are solely responsible for the accuracy of any text, names, dates, or designs submitted for engraving. We do not proofread or validate customer-submitted content. Please review your order details carefully before submitting.

Olive Seeds reserves the right to refuse engraving of content that is offensive, unlawful, or infringes third-party intellectual property rights. In such cases, you will be contacted and offered a refund.

Engraving placement and proportions may be adjusted slightly by our craftspeople to ensure the best aesthetic outcome on the chosen material. This is considered part of our standard craftsmanship process and does not constitute an error.`,
  },
  {
    id: "intellectual",
    number: "05",
    title: "Intellectual Property",
    content: `All content on Olive Seeds — including but not limited to website design, text, graphics, logos, photographs, and digital product files — is owned by or licensed to Olive Seeds and is protected by applicable copyright and intellectual property laws.

Digital products purchased from Olive Seeds are licensed for personal and commercial use by the buyer only. Resale, redistribution, sublicensing, or sharing of digital files is strictly prohibited.

By submitting your own designs or text for engraving, you confirm that you hold the necessary rights or permissions for that content and that its use does not infringe any third-party rights.`,
  },
  {
    id: "liability",
    number: "06",
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, Olive Seeds shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or website.

Our total liability for any claim arising under these terms shall not exceed the amount you paid for the specific order giving rise to the claim.

We do not guarantee uninterrupted access to our website and are not responsible for losses caused by technical failures, server downtime, or third-party service disruptions.`,
  },
  {
    id: "governing",
    number: "07",
    title: "Governing Law",
    content: `These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the competent courts of India.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    id: "changes",
    number: "08",
    title: "Changes to Terms",
    content: `We may update these Terms & Conditions from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. The updated terms will be posted on this page with a revised effective date.

Your continued use of Olive Seeds after any such changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.`,
  },
];

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const sectionRefs = useRef({});

  // Smooth scroll to section + update URL hash
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -70% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        sectionRefs.current[s.id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Handle initial hash from URL
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header style={{ background: "#0D1512" }} className="relative overflow-hidden pt-24 pb-20 shadow-md">
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#FAF9F6]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-[75px] pointer-events-none" />

        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FAF9F6]/30 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-[#FAF9F6]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-5" aria-label="Breadcrumb">
            <Link 
              to="/" 
              className="text-[#FAF9F6]/80 text-xs hover:text-white transition"
            >
              Home
            </Link>
            <span className="text-[#FAF9F6]/40">›</span>
            <span className="text-[#FAF9F6]/90 text-xs">Legal</span>
          </nav>
          
          <p className="text-[#FAF9F6]/60 text-[10px] tracking-[4px] uppercase mb-4 font-bold">
            Legal Document
          </p>
          
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">
            Terms &<br />Conditions
          </h1>
          
          <p className="text-[#FAF9F6]/70 text-xs font-semibold">
            Effective date: 1 January 2025 &nbsp;·&nbsp; Last updated: 21 May 2025
          </p>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        
        {/* Sticky Table of Contents (Desktop) */}
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24 self-start">
          <p className="text-[10px] tracking-[3px] uppercase text-[#0D1512]/60 mb-4 font-bold">
            Contents
          </p>
          <nav className="flex flex-col gap-1.5" aria-label="Table of contents">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{ borderColor: activeSection === s.id ? "#0D1512" : "transparent" }}
                className={`text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none border-l-2
                  ${activeSection === s.id 
                    ? "bg-[#0D1512]/10 text-[#0D1512] font-black" 
                    : "text-[#0D1512]/70 hover:text-[#0D1512] hover:bg-[#0D1512]/5"
                  }`}
              >
                <span className="text-[9px] font-mono opacity-50">{s.number}</span>
                <span className="line-clamp-1">{s.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Article Content */}
        <article className="flex-1 max-w-2xl text-[#0D1512]">
          {/* Notice Box */}
          <div style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }} className="border rounded-[1.5rem] p-6 mb-10 flex gap-4 items-start shadow-md">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">📜</span>
            <div>
              <p className="font-extrabold text-[#0D1512] text-sm mb-1">
                Please read carefully before using our services
              </p>
              <p className="text-[#0D1512]/80 text-xs leading-relaxed font-semibold">
                These terms govern your use of Olive Seeds and all transactions on our platform. Questions?
                Contact us at{" "}
                <a 
                  href="contact@oliveseedsdesignstudio.com" 
                  className="text-[#0D1512] font-black underline hover:opacity-85"
                >
                  contact@oliveseedsdesignstudio.com
                </a>
              </p>
            </div>
          </div>

          {/* Sections */}
          {sections.map((s, i) => (
            <section 
              key={s.id} 
              id={s.id} 
              className="mb-14 scroll-mt-24"
              ref={(el) => (sectionRefs.current[s.id] = el)}
            >
              {/* Section Header */}
              <div className="flex items-start gap-5 mb-5">
                <span style={{ fontFamily: "'Outfit', sans-serif" }} className="text-[#0D1512]/20 text-4xl font-extrabold leading-none flex-shrink-0 -mt-1">
                  {s.number}
                </span>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] leading-tight">
                  {s.title}
                </h2>
              </div>
              
              {/* Content with left border */}
              <div style={{ borderColor: "rgba(27, 57, 49, 0.15)" }} className="pl-16 border-l ml-3">
                {s.content.split("\n\n").map((para, j) => (
                  <p 
                    key={j} 
                    className="text-[14px] leading-relaxed mb-4 last:mb-0 font-medium text-[#0D1512]/90"
                  >
                    {para}
                  </p>
                ))}
              </div>
              
              {/* Divider (except last) */}
              {i < sections.length - 1 && (
                <div style={{ background: "linear-gradient(90deg, rgba(27, 57, 49, 0.15), transparent)" }} className="h-px mt-12" />
              )}
            </section>
          ))}

          {/* Contact CTA */}
          <div style={{ background: "#0D1512" }} className="rounded-[2rem] p-8 mt-8 shadow-xl text-[#FAF9F6]">
            <p style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black mb-3">
              Questions about our terms?
            </p>
            <p className="text-[#FAF9F6]/80 text-sm leading-relaxed mb-6 font-semibold">
              We're happy to clarify anything. Reach out to our team and we'll respond within 24 hours.
            </p>
            <Link 
              to="/contact" 
              style={{ background: "#FAF9F6", color: "#0D1512" }}
              className="inline-flex items-center gap-2 font-black text-xs px-6 py-4 rounded-xl shadow active:scale-95 uppercase tracking-wider transition duration-300"
            >
              Contact us →
            </Link>
          </div>
        </article>
      </main>

      {/* Mobile TOC (Bottom Sheet Style) */}
      <div style={{ background: "#0D1512", borderTopColor: "rgba(255, 248, 222, 0.2)" }} className="lg:hidden fixed bottom-0 left-0 right-0 border-t z-45">
        <div className="max-w-5xl mx-auto px-4 py-3.5">
          <details className="group">
            <summary className="flex items-center justify-between text-xs font-black text-[#FAF9F6] cursor-pointer list-none uppercase tracking-wider">
              <span>📑 Jump to section</span>
              <span className="transform group-open:rotate-180 transition">▼</span>
            </summary>
            <nav className="mt-3 flex flex-wrap gap-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    scrollToSection(s.id);
                    const details = document.querySelector('details');
                    if (details) details.removeAttribute('open');
                  }}
                  style={{ background: activeSection === s.id ? "#FAF9F6" : "transparent", color: activeSection === s.id ? "#0D1512" : "#FAF9F6", borderColor: activeSection === s.id ? "#FAF9F6" : "rgba(255, 248, 222, 0.3)" }}
                  className={`text-[10px] px-3.5 py-2 rounded-full border transition font-bold`}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </details>
        </div>
      </div>

      <Footer />
    </div>
  );
}