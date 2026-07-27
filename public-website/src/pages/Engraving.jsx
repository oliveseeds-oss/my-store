import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Icons = {
  Trophy: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6c0 3.3-2 6-6 6S6 11.3 6 8a6 6 0 0 1 6-6z" />
    </svg>
  ),
  Pen: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Rings: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="13.5" r="5" />
      <circle cx="16.5" cy="10.5" r="5" />
    </svg>
  ),
  Box: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Wood: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Bolt: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Art: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  ),
  Sparkles: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" opacity="0.6" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" opacity="0.6" />
    </svg>
  ),
  Globe: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Shield: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Support: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Lock: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Repeat: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
};

const MATERIALS = [
  { icon: "Wood", name: "Wood", desc: "Natural grain, warm tones" },
  { icon: "Sparkles", name: "Acrylic", desc: "Crystal clarity, bold finish" },
  { icon: "Pen", name: "Leather", desc: "Rich texture, lasting luxury" },
  { icon: "Globe", name: "Glass", desc: "Precision-cut, timeless shine" },
  { icon: "Box", name: "Premium MDF", desc: "Smooth surface, perfect engraving" },
];

const WHY_US = [
  { icon: "Wood", title: "Premium Materials", desc: "Only the finest wood, acrylic, metal and MDF." },
  { icon: "Sparkles", title: "Precision Engraving", desc: "Laser-cut to micron accuracy every time." },
  { icon: "Globe", title: "Worldwide Shipping", desc: "Fast, insured delivery to your doorstep." },
  { icon: "Box", title: "Gift Ready Packaging", desc: "Luxury packaging that makes unboxing special." },
  { icon: "Support", title: "Dedicated Support", desc: "Expert guidance from order to delivery." },
  { icon: "Trophy", title: "Business Orders", desc: "Bulk corporate gifting with volume pricing." },
];

const STEPS = [
  { num: "01", title: "Choose Product", desc: "Browse our curated collection of premium engravables." },
  { num: "02", title: "Add Personalization", desc: "Upload your name, logo or message for engraving." },
  { num: "03", title: "Review Design", desc: "We send a digital proof before production begins." },
  { num: "04", title: "Worldwide Delivery", desc: "Gift-packaged and shipped straight to your door." },
];

export default function Engraving() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    product_type: "Wooden Plaques",
    quantity: 10,
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    API.get("/settings")
      .then((r) => { if (r.data) setSettings(r.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.quantity < 10) {
      alert("Minimum bulk quantity is 10 units.");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/bulk-orders", formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        product_type: "Wooden Plaques",
        quantity: 10,
        message: ""
      });
    } catch (err) {
      alert("Failed to submit bulk order request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#FAF9F6", color: "#111", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO
        title="Custom Laser Engraving Solutions & Bulk Orders | Olive Seeds"
        description="Learn about our high-precision laser engraving customization journey, tactile materials, and request a personalized or bulk corporate order quote."
        keywords="laser engraving, custom engravings, custom corporate gifting, wholesale nameplates, wood laser engraving, acrylic trophies"
      />

      <Navbar />

      {/* ── HERO BANNER ── */}
      <section style={{
        background: "linear-gradient(135deg, #0F2744 0%, #0A1B30 100%)",
        padding: "clamp(100px, 12vw, 160px) 24px clamp(80px, 10vw, 120px)",
        color: "#fff",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-10%",
          width: "50%", height: "50%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,106,0.1) 0%, transparent 70%)"
        }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(201,168,106,0.15)", border: "1px solid rgba(201,168,106,0.3)",
            borderRadius: "100px", padding: "8px 18px",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: "28px"
          }}>
            Bespoke Laser Artistry
          </span>
          <h1 className="clash" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, lineHeight: 1.08, marginBottom: "24px" }}>
            High-Precision Custom <br />
            <span style={{ background: "linear-gradient(135deg, var(--gold) 0%, #e0b96a 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Engraving Services</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "17px", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto 40px" }}>
            From corporate branding and signature trophies to highly personalized keepsakes. Experience tactile luxury crafted to last forever.
          </p>
          <a href="#bulk-order" className="btn-gold" style={{ cursor: "pointer" }}>
            Get Bulk Quote →
          </a>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{
        background: "#FFF",
        borderBottom: "1px solid var(--border)",
        padding: "32px 24px"
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "flex", justifyContent: "space-around",
          flexWrap: "wrap", gap: "24px"
        }}>
          {[
            { icon: "Globe", title: "Worldwide Shipping", desc: "Insured door delivery" },
            { icon: "Lock", title: "Secure Checkout", desc: "Razorpay & PayPal integrated" },
            { icon: "Wood", title: "Premium Materials", desc: "Solid teak, acrylic, MDF" },
            { icon: "Repeat", title: "Made To Order", desc: "Micron-accurate laser cuts" }
          ].map((item, i) => {
            const Icon = Icons[item.icon];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
                <Icon size={24} color="var(--gold)" />
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--accent)" }}>{item.title}</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-2)", margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 24px", background: "#FAF9F6" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Workflow</span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "var(--accent)" }}>Your Customization Journey</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
            {STEPS.map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div style={{ background: "#FFF", border: "1px solid var(--border)", borderRadius: "16px", padding: "32px 24px", height: "100%" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--gold)", fontWeight: 700, fontSize: "14px", marginBottom: "20px"
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent)", marginBottom: "8px" }}>{step.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR MATERIALS ── */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 24px", background: "#FFF", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Quality Standards</span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "var(--accent)", marginBottom: "16px" }}>Tactile. Premium. Lasting.</h2>
            <p style={{ fontSize: "15px", color: "var(--text-2)", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7 }}>
              Every material is selected for its engraving quality, durability, and luxurious appearance.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {MATERIALS.map((mat, i) => {
              const Icon = Icons[mat.icon] || Icons.Sparkles;
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", padding: "24px", background: "#FAF9F6", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={22} color="var(--gold)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent)", marginBottom: "6px" }}>{mat.name}</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>{mat.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY OLIVE SEEDS ── */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 24px", background: "#FAF9F6", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Why Olive Seeds</span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "var(--accent)" }}>Craftsmanship You Can Trust</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {WHY_US.map((item, i) => {
              const Icon = Icons[item.icon] || Icons.Sparkles;
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div style={{ display: "flex", gap: "16px", padding: "24px", background: "#FFF", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={20} color="var(--gold)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent)", marginBottom: "4px" }}>{item.title}</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BULK ORDER FORM ── */}
      <section id="bulk-order" style={{ padding: "clamp(80px, 8vw, 140px) 24px", background: "#0F2744", color: "#fff", position: "relative" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(201,168,106,0.15)", border: "1px solid rgba(201,168,106,0.3)",
              borderRadius: "100px", padding: "6px 14px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px"
            }}>
              Custom &amp; Volume Requests
            </span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700 }}>Request a Bulk Engraving Quote</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "12px" }}>
              Ordering for an event, corporate retreat, or rebranding? Submit your customization specifications. Min order 10 units.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: "rgba(201,168,106,0.12)", border: "1px solid var(--gold-border)",
                borderRadius: "20px", padding: "48px 32px", textAlign: "center"
              }}
            >
              <h3 className="clash" style={{ fontSize: "24px", color: "var(--gold)", marginBottom: "12px" }}>✓ Proposal Received</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                Thank you! Our design director will review your specifications and get in touch within 24 hours with design drafts and bulk price adjustments.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-mobile-1col">
                <style>{`
                  @media (max-width: 600px) {
                    .grid-mobile-1col { grid-template-columns: 1fr !important; }
                  }
                  .bulk-input {
                    width: 100%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s;
                  }
                  .bulk-input:focus {
                    border-color: var(--gold);
                  }
                  .bulk-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(255,255,255,0.6);
                    marginBottom: 6px;
                  }
                `}</style>
                <div>
                  <label className="bulk-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="bulk-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="bulk-label">Work Email</label>
                  <input
                    type="email"
                    required
                    className="bulk-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-mobile-1col">
                <div>
                  <label className="bulk-label">Phone Number</label>
                  <input
                    type="tel"
                    className="bulk-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="bulk-label">Company Name</label>
                  <input
                    type="text"
                    className="bulk-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-mobile-1col">
                <div>
                  <label className="bulk-label">Product Category</label>
                  <select
                    className="bulk-input"
                    style={{ appearance: "none" }}
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  >
                    <option value="Wooden Plaques" style={{ color: "#333" }}>Wooden Plaques &amp; Name Plates</option>
                    <option value="Acrylic Products" style={{ color: "#333" }}>Acrylic Blocks &amp; Keepsakes</option>
                    <option value="Leather Items" style={{ color: "#333" }}>Leather Coasters &amp; Sleeves</option>
                    <option value="Other Crafts" style={{ color: "#333" }}>Custom Laser Material Cuts</option>
                  </select>
                </div>
                <div>
                  <label className="bulk-label">Quantity Required (Min 10)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    className="bulk-input"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div>
                <label className="bulk-label">Personalization &amp; Engraving Details</label>
                <textarea
                  rows="4"
                  placeholder="Tell us what you want to engrave. Include text details, approximate size, design style preference, or any special wood/acrylic finish request."
                  className="bulk-input"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold"
                style={{
                  marginTop: "12px", width: "100%", justifyContent: "center", cursor: "pointer",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? "Submitting Request..." : "Submit Proposal Draft →"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </div>
  );
}
