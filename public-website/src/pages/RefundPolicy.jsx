import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const timeline = [
  { day: "Day 1–2", label: "Contact us", desc: "Email or call us with your Order ID and reason", icon: "📧" },
  { day: "Day 2–3", label: "We review", desc: "Our team reviews your request and inspects the issue", icon: "🔍" },
  { day: "Day 3–5", label: "Approval", desc: "We approve and provide return instructions (if applicable)", icon: "✅" },
  { day: "Day 5–7", label: "Return shipped", desc: "You ship the item back using the instructions provided", icon: "📦" },
  { day: "Day 7–10", label: "Refund issued", desc: "Refund processed to your original payment method", icon: "💳" },
];

const faqItems = [
  { q: "Can I cancel my order after placing it?", a: "Physical orders can be cancelled within 2 hours of placement, before production begins. After engraving starts, cancellation is not possible. Digital orders cannot be cancelled once payment is confirmed and the file is available for download." },
  { q: "What if I made a spelling mistake in my engraving text?", a: "Unfortunately, we cannot offer refunds for engraving errors made by the customer (typos, wrong names, incorrect dates). We strongly urge you to double-check all text before submitting. However, if the error was on our end, we will replace the item free of charge." },
  { q: "I received a broken item. What do I do?", a: "Take clear photographs of the damage and packaging within 24 hours of delivery and email them to contact@oliveseedsdesignstudio.com with your Order ID. We will arrange a free replacement immediately." },
  { q: "Do digital products qualify for refunds?", a: "Digital products are non-refundable once the download link has been accessed. If you have not yet downloaded the file and face a technical issue, contact us within 24 hours and we will assist." },
  { q: "How long does a refund take to appear?", a: "Once approved, refunds are processed within 2–3 business days. Depending on your bank or payment provider, the amount may take an additional 5–7 business days to reflect in your account." },
  { q: "Can I exchange instead of getting a refund?", a: "Yes, we happily offer exchanges for eligible physical products. The replacement item must be of equal or lesser value. Additional charges may apply for size or product upgrades." },
];

export default function RefundPolicy() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF9F6", color: "#0D1512" }} className="min-h-screen">
      <SEO
        title="Refund & Cancellation Policy | Olive Seeds Studio"
        description="Transparent guidelines for product returns, damage replacements, order cancellations, and digital purchase policies at Olive Seeds Studio."
        keywords="refund policy, return policy, cancellations, damage replacement, Olive Seeds returns"
      />
      <Navbar />

      {/* Hero — premium green palette for refunds */}
      <div style={{
        background: "#0D1512",
        padding: "96px 0 80px",
        position: "relative",
        overflow: "hidden",
      }} className="shadow-md">
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#FAF9F6]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-[75px] pointer-events-none" />

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: "linear-gradient(90deg, transparent, rgba(255, 248, 222, 0.3), transparent)",
        }} />
        <div className="max-w-4xl mx-auto px-6 relative text-[#FAF9F6]">
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
            <Link to="/" style={{ color: "#FAF9F6", fontSize: "13px", textDecoration: "none", opacity: 0.8 }} className="hover:opacity-100 transition">Home</Link>
            <span style={{ color: "#FAF9F6", opacity: 0.4 }}>›</span>
            <span style={{ color: "#FAF9F6", fontSize: "13px", opacity: 0.8 }}>Policies</span>
          </div>
          <p style={{ color: "#FAF9F6", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", fontWeight: "bold" }}>
            We Stand Behind Our Craft
          </p>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            color: "#FAF9F6", fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900, lineHeight: 1.15, marginBottom: "20px",
          }}>
            Refund &<br />Return Policy
          </h1>
          <p style={{ color: "#FAF9F6", fontSize: "14px", opacity: 0.8, fontWeight: "semibold" }}>
            5-day return window on eligible items &nbsp;·&nbsp; Fair and transparent process
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Quick summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {[
            { icon: "✅", title: "5-day window", desc: "Report issues within 5 days of delivery", color: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512" },
            { icon: "🔄", title: "Replacement", desc: "For defects or our errors — no questions asked", color: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512" },
            { icon: "💰", title: "Refund ", desc: "For eligible items returned in original condition", color: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512" },
            { icon: "📵", title: "No digital refunds", desc: "Once downloaded, digital files cannot be refunded", color: "white", border: "rgba(27, 57, 49, 0.15)", text: "#0D1512" },
          ].map((c) => (
            <div key={c.title} style={{
              background: c.color, border: `1px solid ${c.border}`,
              borderRadius: "16px", padding: "20px",
            }} className="shadow-md">
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{c.icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 800, color: c.text, marginBottom: "6px" }}>{c.title}</p>
              <p style={{ fontSize: "12px", color: c.text, opacity: 0.8, lineHeight: 1.6, fontWeight: 500 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Physical products policy */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", color: "#0D1512", fontWeight: 900, marginBottom: "20px" }}>
            Physical Engraved Products
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                title: "✅ Eligible for return / refund",
                color: "white", border: "rgba(27, 57, 49, 0.15)", titleColor: "#0D1512",
                items: [
                  "Item arrived damaged or broken",
                  "Wrong product delivered",
                  "Engraving error made by our team (incorrect text, wrong design)",
                  "Significant quality defect in materials or finish",
                ],
              },
              {
                title: "❌ Not eligible for return / refund",
                color: "white", border: "rgba(27, 57, 49, 0.15)", titleColor: "#0D1512",
                items: [
                  "Customer-submitted spelling or text errors",
                  "Change of mind after production has begun",
                  "Minor natural wood grain variations (inherent to the material)",
                  "Items returned after 5 days of delivery",
                  "Items without original packaging",
                ],
              },
            ].map((block) => (
              <div key={block.title} style={{
                background: block.color, border: `1px solid ${block.border}`,
                borderRadius: "16px", padding: "24px",
              }} className="shadow-sm">
                <p style={{ fontSize: "15px", fontWeight: 800, color: block.titleColor, marginBottom: "12px" }}>
                  {block.title}
                </p>
                <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px", listStyleType: "disc" }}>
                  {block.items.map((item, i) => (
                    <li key={i} style={{ fontSize: "14px", color: block.titleColor, opacity: 0.85, lineHeight: 1.7, fontWeight: 500 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Digital products */}
        <section style={{
          background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
          borderRadius: "16px", padding: "28px 32px", marginBottom: "48px",
        }} className="shadow-md">
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", color: "#0D1512", fontWeight: 900, marginBottom: "14px" }}>
            Digital Products
          </h2>
          <p style={{ color: "#0D1512", fontSize: "14px", lineHeight: 1.8, marginBottom: "12px", fontWeight: 500 }}>
            Digital products (logo kits, templates, social media packs) are delivered electronically via download link. Due to their intangible nature, <strong>digital products are non-refundable once the download link has been accessed</strong>.
          </p>
          <p style={{ color: "#0D1512", opacity: 0.9, fontSize: "14px", lineHeight: 1.8, fontWeight: 500 }}>
            If you experience a technical issue preventing download (corrupted file, broken link, or delivery failure), please contact us within 24 hours of purchase. We will re-send the file or provide a full refund if the issue cannot be resolved.
          </p>
        </section>

        {/* Refund process timeline */}
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", color: "#0D1512", fontWeight: 900, marginBottom: "28px" }}>
            How the Refund Process Works
          </h2>
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute", left: "28px", top: "40px", bottom: "40px",
              width: "1px", background: "rgba(27, 57, 49, 0.15)",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {timeline.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start", paddingBottom: "28px" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    background: "white", border: "2px solid #0D1512",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", flexShrink: 0, zIndex: 1,
                    position: "relative",
                  }} className="shadow-sm">
                    {step.icon}
                  </div>
                  <div style={{ paddingTop: "6px" }}>
                    <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#0D1512", opacity: 0.6, marginBottom: "4px", fontWeight: "bold" }}>
                      {step.day}
                    </p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "17px", color: "#0D1512", fontWeight: 900, marginBottom: "4px" }}>
                      {step.label}
                    </p>
                    <p style={{ fontSize: "14px", color: "#0D1512", opacity: 0.8, lineHeight: 1.7, fontWeight: 500 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", color: "#0D1512", fontWeight: 900, marginBottom: "24px" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {faqItems.map((item, i) => (
              <div key={i} style={{
                background: "white", border: "1px solid rgba(27, 57, 49, 0.15)",
                borderRadius: "16px", overflow: "hidden",
              }} className="shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", textAlign: "left", background: "none", border: "none",
                    padding: "20px 24px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: "16px",
                  }}>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#0D1512", lineHeight: 1.5 }}>
                    {item.q}
                  </span>
                  <span style={{
                    fontSize: "20px", color: "#0D1512", flexShrink: 0,
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                    lineHeight: 1,
                    fontWeight: "bold",
                  }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: "0 24px 20px",
                    borderTop: "1px solid rgba(27, 57, 49, 0.08)",
                  }}>
                    <p style={{ fontSize: "14px", color: "#0D1512", opacity: 0.85, lineHeight: 1.8, paddingTop: "16px", fontWeight: 500 }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          background: "#0D1512",
          borderRadius: "24px", padding: "32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", flexWrap: "wrap",
        }} className="shadow-xl">
          <div className="text-[#FAF9F6]">
            <p style={{ fontFamily: "'Outfit', sans-serif", color: "#FAF9F6", fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>
              Need to raise a return or refund?
            </p>
            <p style={{ color: "#FAF9F6", opacity: 0.8, fontSize: "13px", fontWeight: "semibold" }}>
              Contact us with your Order ID and we'll take care of you promptly.
            </p>
          </div>
          <Link to="/contact" style={{
            display: "inline-block", background: "#FAF9F6",
            color: "#0D1512", fontWeight: 900, fontSize: "12px",
            padding: "12px 28px", borderRadius: "12px", textDecoration: "none",
            whiteSpace: "nowrap",
          }} className="uppercase tracking-wider shadow active:scale-95 transition">
            Contact support →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}