import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    id: "collect",
    icon: "🗂️",
    title: "Information We Collect",
    items: [
      {
        sub: "Account & Profile Data",
        text: "When you register, we collect your full name, email address, phone number, and password (stored as an encrypted hash). Your member profile additionally stores your delivery address, city, state, country, and pincode.",
      },
      {
        sub: "Order & Transaction Data",
        text: "Every order you place generates a unique Order ID and Invoice ID. We store product details, quantities, selected sizes, subtotal, taxes, shipping fees, payment mode, transaction ID, and delivery status.",
      },
      {
        sub: "Usage & Technical Data",
        text: "We automatically collect your IP address, browser type, device information, pages visited, and approximate location. This helps us improve the website and detect fraudulent activity.",
      },
      {
        sub: "Communications",
        text: "If you contact us through the Contact Us form, we retain your name, email, phone number, subject, and message content.",
      },
    ],
  },
  {
    id: "use",
    icon: "⚙️",
    title: "How We Use Your Information",
    items: [
      { sub: "Order fulfilment", text: "To process, produce, and deliver your engraved or digital products, and to send you order confirmations, shipping updates, and invoices." },
      { sub: "Account management", text: "To create and maintain your member account, authenticate your login, and allow you to view your order history." },
      { sub: "Customer support", text: "To respond to your queries, resolve disputes, and handle refund or return requests." },
      { sub: "Website improvement", text: "To analyse usage patterns, fix bugs, and improve our product listings and user experience." },
      { sub: "Marketing (optional)", text: "If you opt in, we may send you promotional emails about new products or offers. You can unsubscribe at any time." },
    ],
  },
  {
    id: "sharing",
    icon: "🤝",
    title: "Sharing Your Information",
    content: `We do not sell, rent, or trade your personal data to third parties for their marketing purposes.

We share data only with the following parties and only to the extent necessary:

Razorpay — our payment processor — receives your payment details to complete transactions. Razorpay is PCI-DSS compliant and governed by its own privacy policy.

Shipping partners — receive your name and delivery address to fulfil physical orders.

Our technical infrastructure (server hosting, database) — your data is stored on secured servers with restricted access.

We may disclose your information if required by law, court order, or to protect the rights and safety of Olive Seeds or its customers.`,
  },
  {
    id: "retention",
    icon: "🗄️",
    title: "Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide our services.

Order records and invoices are retained for a minimum of 7 years for accounting and legal compliance purposes under Indian tax law.

If you request account deletion, we will remove your profile data within 30 days, subject to our legal retention obligations. Order records associated with completed transactions may be retained in anonymised form.`,
  },
  {
    id: "rights",
    icon: "🛡️",
    title: "Your Rights",
    items: [
      { sub: "Access", text: "You can request a copy of all personal data we hold about you." },
      { sub: "Correction", text: "You can update your profile information at any time from the My Profile page." },
      { sub: "Deletion", text: "You may request deletion of your account and associated data, subject to legal retention requirements." },
      { sub: "Objection", text: "You may opt out of marketing communications at any time using the unsubscribe link in any email." },
      { sub: "Portability", text: "You can request your order history and profile data in a structured, machine-readable format." },
    ],
  },
  {
    id: "security",
    icon: "🔒",
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal data:

Passwords are hashed using bcrypt and never stored in plain text. All data transmission between your browser and our server uses HTTPS/TLS encryption. Access to our database is restricted to authorised personnel only. Payment processing is handled entirely by Razorpay and we do not store card numbers or CVV codes.

Despite these measures, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.`,
  },
  {
    id: "contact-privacy",
    icon: "✉️",
    title: "Contact for Privacy Queries",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

Email: contact@oliveseedsdesignstudio.com
Phone: +91 94 42 94 33 94
Address: Olive Seeds Studio, India

We will respond to all privacy-related requests within 30 days.`,
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("collect");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FAF9F6", color: "#0D1512" }} className="min-h-screen">
      <Navbar />

      {/* Hero — premium green palette for privacy */}
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
          position: "absolute", top: 0, left: 0, right: 0,
          height: "4px",
          background: "linear-gradient(90deg, transparent, rgba(255, 248, 222, 0.3), transparent)",
        }} />
        <div className="max-w-5xl mx-auto px-6 relative text-[#FAF9F6]">
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
            <Link to="/" style={{ color: "#FAF9F6", fontSize: "13px", textDecoration: "none", opacity: 0.8 }} className="hover:opacity-100 transition">Home</Link>
            <span style={{ color: "#FAF9F6", opacity: 0.4 }}>›</span>
            <span style={{ color: "#FAF9F6", fontSize: "13px", opacity: 0.8 }}>Legal</span>
          </div>
          <p style={{ color: "#FAF9F6", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", fontWeight: "bold" }}>
            Your Privacy Matters
          </p>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            color: "#FAF9F6",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "20px",
          }}>
            Privacy<br />& Policy
          </h1>
          <p style={{ color: "#FAF9F6", fontSize: "14px", opacity: 0.8, fontWeight: "semibold" }}>
            Effective date: 1 January 2025 &nbsp;·&nbsp; We never sell your data
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12" style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>

        {/* Sidebar */}
        <aside style={{ width: "220px", flexShrink: 0, position: "sticky", top: "88px", display: "none" }}
          className="lg-toc-priv">
          <style>{`@media(min-width:1024px){.lg-toc-priv{display:block!important}}`}</style>
          <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#0D1512", marginBottom: "16px", fontWeight: "bold", opacity: 0.6 }}>Contents</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "12px", textDecoration: "none",
                  fontSize: "13px", transition: "all 0.2s",
                  background: activeSection === s.id ? "rgba(27, 57, 49, 0.1)" : "transparent",
                  color: "#0D1512",
                  fontWeight: activeSection === s.id ? 800 : 600,
                  borderLeft: activeSection === s.id ? "2px solid #0D1512" : "2px solid transparent",
                }}>
                <span style={{ fontSize: "14px" }}>{s.icon}</span>
                <span style={{ fontSize: "12px" }}>{s.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, maxWidth: "680px" }}>
          {/* Trust badges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "40px" }} className="grid-cols-1 sm:grid-cols-3">
            {[
              { icon: "🚫", title: "Never sold", desc: "Your data stays with us" },
              { icon: "🔒", title: "Encrypted", desc: "TLS + bcrypt security" },
              { icon: "🇮🇳", title: "India-compliant", desc: "IT Act & PDPB aligned" },
            ].map((b) => (
              <div key={b.title} style={{
                background: "white",
                borderColor: "rgba(27, 57, 49, 0.15)",
                borderWidth: "1px",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
              }} className="shadow-md">
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{b.icon}</div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#0D1512", marginBottom: "4px" }}>{b.title}</p>
                <p style={{ fontSize: "11px", color: "#0D1512", opacity: 0.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} style={{ marginBottom: "52px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(27, 57, 49, 0.15)",
              }}>
                <span style={{
                  width: "42px", height: "42px",
                  background: "rgba(27, 57, 49, 0.1)",
                  borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>
                  {s.icon}
                </span>
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "22px", fontWeight: 900, color: "#0D1512",
                }}>
                  {s.title}
                </h2>
              </div>

              {s.items ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {s.items.map((item, j) => (
                    <div key={j} style={{
                      background: "white",
                      borderColor: "rgba(27, 57, 49, 0.12)",
                      borderWidth: "1px",
                      borderRadius: "16px",
                      padding: "20px 24px",
                    }} className="shadow-sm">
                      <p style={{ fontSize: "13px", fontWeight: 800, color: "#0D1512", marginBottom: "6px" }}>
                        {item.sub}
                      </p>
                      <p style={{ fontSize: "14px", color: "#0D1512", opacity: 0.85, lineHeight: 1.8 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                s.content.split("\n\n").map((para, j) => (
                  <p key={j} style={{ color: "#0D1512", fontSize: "14px", lineHeight: 1.85, marginBottom: "14px", fontWeight: 500 }}>
                    {para}
                  </p>
                ))
              )}
            </section>
          ))}

          <div style={{
            background: "#0D1512", borderRadius: "24px", padding: "32px 36px",
          }} className="shadow-xl">
            <p style={{ fontFamily: "'Outfit', sans-serif", color: "#FAF9F6", fontSize: "20px", fontWeight: 900, marginBottom: "10px" }}>
              Privacy questions?
            </p>
            <p style={{ color: "#FAF9F6", opacity: 0.8, fontSize: "13px", lineHeight: 1.7, marginBottom: "20px", fontWeight: "semibold" }}>
              Your privacy is important to us. Contact us anytime and we'll respond within 30 days.
            </p>
            <Link to="/contact" style={{
              display: "inline-block", background: "#FAF9F6", color: "#0D1512",
              fontWeight: 900, fontSize: "12px", padding: "12px 28px",
              borderRadius: "12px", textDecoration: "none",
            }} className="uppercase tracking-wider active:scale-95 shadow transition">
              Contact us →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}