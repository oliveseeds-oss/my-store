import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

const Icons = {
  Trophy: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6c0 3.3-2 6-6 6S6 11.3 6 8a6 6 0 0 1 6-6z" />
    </svg>
  ),
  Pen: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Box: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Wood: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Globe: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Sparkles: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    </svg>
  ),
  Lock: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Support: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Repeat: ({ color = "#c9a86a", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
};

const MATERIALS = [
  { 
    icon: "Wood", 
    name: "Teak & Maple Wood", 
    desc: "Organic grains custom-finished to a warm, rich glow. Ideal for corporate nameplates and keepsakes.",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Sparkles", 
    name: "Frosted & Clear Acrylic", 
    desc: "Sleek, glass-like transparency with safe polished edges. Popular for signage and modern awards.",
    img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Pen", 
    name: "Genuine Leather", 
    desc: "High-contrast tactile burns on rich leather skins. Excellent for bespoke tech sleeves & notebooks.",
    img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Globe", 
    name: "Tempered Glass & Crystal", 
    desc: "Frost-engraved patterns refracting light at high clarity. Premium choice for executive awards.",
    img: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Box", 
    name: "Premium Finished MDF", 
    desc: "Ultra-smooth density cores carved with laser precision. Excellent for geometric wall decors.",
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop" 
  },
];

const WHY_US = [
  { icon: "Wood", title: "Micro-Precision Cutting", desc: "Advanced CO2 and Fiber lasers calibrated for micron accuracy." },
  { icon: "Sparkles", title: "Premium Finished Wood", desc: "Strictly select organic Teakwood, Bamboo and high-grade Acrylic panels." },
  { icon: "Globe", title: "Worldwide Shipping", desc: "Insured safe box deliveries globally across 25+ target regions." },
  { icon: "Box", title: "Pre-Production Approvals", desc: "We coordinate and share detailed design mockup blueprints before engraving." },
  { icon: "Support", title: "Enterprise Pricing", desc: "Dedicated managers and custom volume discounts for corporate events." },
  { icon: "Trophy", title: "Bespoke Engraving Art", desc: "Expert craft team ensuring high contrast and clean edges on every piece." },
];

const STEPS = [
  { num: "01", title: "Share Design & Spec", desc: "Provide your dimensions, select materials, and upload vector artwork/logos." },
  { num: "02", title: "Mockup Approval", desc: "Our craft designers render a digital preview proof file for your confirmation." },
  { num: "03", title: "Laser Calibrations", desc: "We run deep-relief engravings with precision laser machines in our studio." },
  { num: "04", title: "Insured Delivery", desc: "Every unit is hand-polished, packaged in protective crates, and dispatched." },
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
      alert("Minimum order quantity for customization/bulk is 10 units.");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/bulk-inquiry", {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company,
        product_interest: formData.product_type,
        quantity: formData.quantity,
        message: formData.message
      });
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
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#FAF9F6", color: "#1E2522", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      <SEO
        title="Custom Laser Engraving Solutions & Bulk Orders | Olive Seeds"
        description="Learn about our high-precision laser engraving customization journey, tactile materials, and request a personalized or bulk corporate order quote."
        keywords="laser engraving, custom engravings, custom corporate gifting, wholesale nameplates, wood laser engraving, acrylic trophies"
      />

      <Navbar />

      <style>{`
        /* Custom layout classes for styling & responsive */
        .engraving-hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 5;
        }
        @media (max-width: 991px) {
          .engraving-hero {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
        }
        
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 991px) {
          .materials-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 576px) {
          .materials-grid {
            grid-template-columns: 1fr;
          }
        }

        .responsive-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .responsive-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .hero-img-box {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.25);
          aspect-ratio: 4/3;
        }
        @media (max-width: 576px) {
          .hero-img-box {
            border-radius: 20px;
          }
        }
      `}</style>

      {/* ── HERO BANNER ── */}
      <section style={{
        background: "linear-gradient(135deg, #0A1424 0%, #050A12 100%)",
        padding: "clamp(120px, 15vw, 180px) 0 clamp(80px, 12vw, 130px)",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute", top: "-10%", right: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,106,0.12) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div className="engraving-hero">
          {/* Left info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(201,168,106,0.12)", border: "1px solid rgba(201,168,106,0.25)",
              borderRadius: "100px", padding: "8px 18px",
              fontSize: "10px", fontWeight: 850, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--gold)", marginBottom: "28px",
              marginInline: "auto"
            }} className="mx-auto lg:ml-0">
              ⚡ High-Precision Laser Studio
            </span>
            <h1 className="clash" style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "24px", width: "100%" }}>
              Bespoke Custom <br />
              <span style={{ background: "linear-gradient(135deg, var(--gold) 0%, #f0cd84 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Engraving Services</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.7, maxWidth: "560px", marginBottom: "40px" }}>
              Transform organic teakwood, premium acrylic blocks, custom leather, and tempered crystal trophies into masterfully engraved luxury keepsakes. Trusted by global brands and events.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", width: "100%", justifyContent: "center" }} className="lg:justify-start">
              <a href="#bulk-order" className="btn-gold" style={{ padding: "16px 32px" }}>
                Request Custom Quote
              </a>
              <a href="#materials" className="btn-secondary" style={{ padding: "16px 32px", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Explore Materials
              </a>
            </div>
          </div>

          {/* Right graphics mockup */}
          <div className="hero-img-box">
            <img 
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop" 
              alt="Laser engraving machine calibrating depth on solid teakwood template"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            {/* Glass badge */}
            <div style={{
              position: "absolute", bottom: "24px", left: "24px",
              background: "rgba(10, 20, 36, 0.7)", border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(16px)", padding: "16px 20px", borderRadius: "18px",
              display: "flex", gap: "16px"
            }}>
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 700, margin: 0 }}>Calibration</p>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--gold)", margin: "4px 0 0" }}>0.01 mm</p>
              </div>
              <div style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }} />
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 700, margin: 0 }}>Materials</p>
                <p style={{ fontSize: "16px", fontWeight: 800, color: "#fff", margin: "4px 0 0" }}>Premium Core</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO / IMAGES SECTION ── */}
      <section style={{ padding: "80px 24px", background: "#FFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "center" }}>
            <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", height: "380px" }}>
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" 
                alt="Personalized laser engraved gift boxes ready for dispatch" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "12px" }}>Artisan Studio</span>
              <h2 className="clash" style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#0A1424", marginBottom: "20px", lineHeight: 1.25 }}>Exceptional Contrast & Crisp Tactile Finishes</h2>
              <p style={{ color: "#666", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
                Laser engraving is not just about burning surfaces—it is an art of speed, power, and focal calibrations. Our state-of-the-art machines carefully carve custom vector graphics, high-end typography, and complex brand logo signatures with zero fraying or rough margins.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ borderLeft: "3.5px solid var(--gold)", paddingLeft: "14px" }}>
                  <p style={{ fontWeight: 800, fontSize: "14px", margin: 0, color: "#0A1424" }}>Teakwood nameplates</p>
                  <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0" }}>Deep 3D tactile burns</p>
                </div>
                <div style={{ borderLeft: "3.5px solid var(--gold)", paddingLeft: "14px" }}>
                  <p style={{ fontWeight: 800, fontSize: "14px", margin: 0, color: "#0A1424" }}>Frosted acrylic blocks</p>
                  <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0" }}>Clean ice-like glow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MATERIAL CARDS WITH IMAGES ── */}
      <section id="materials" style={{ padding: "clamp(60px, 8vw, 100px) 24px", background: "#FAF9F6", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Selected Materials</span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#0A1424", marginBottom: "16px" }}>Explore Engravable Media</h2>
            <p style={{ fontSize: "15px", color: "#666", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              We handpick and finish every raw panel to ensure optimal density, structure, and high contrast vector responses.
            </p>
          </div>

          <div className="materials-grid">
            {MATERIALS.map((mat, i) => {
              const Icon = Icons[mat.icon] || Icons.Sparkles;
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div style={{
                    background: "#FFF",
                    borderRadius: "28px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s ease, border-color 0.3s ease"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "var(--gold)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                      <img src={mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "16px", left: "16px", background: "#FFF", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex" }}>
                        <Icon size={18} color="var(--gold)" />
                      </div>
                    </div>
                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 style={{ fontSize: "17px", fontWeight: 750, color: "#0A1424", marginBottom: "8px" }}>{mat.name}</h4>
                      <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>{mat.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW STEPS ── */}
      <section style={{ padding: "80px 24px", background: "#FFF" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Seamless Workflow</span>
            <h2 className="clash" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#0A1424" }}>Our Production Pipeline</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                background: "#FAF9F6",
                border: "1px solid var(--border)",
                borderRadius: "24px",
                padding: "28px 24px",
              }}>
                <span style={{ fontSize: "32px", fontWeight: 900, color: "rgba(201,168,106,0.22)", display: "block", marginBottom: "16px" }}>{step.num}</span>
                <h4 style={{ fontSize: "16px", fontWeight: 750, color: "#0A1424", marginBottom: "8px" }}>{step.title}</h4>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OLIVE SEEDS ── */}
      <section style={{ padding: "80px 24px", background: "#FAF9F6", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "8px" }}>Studio Guarantee</span>
            <h2 className="clash" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#0A1424" }}>High Standards, No Compromise</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {WHY_US.map((item, i) => {
              const Icon = Icons[item.icon] || Icons.Sparkles;
              return (
                <div key={i} style={{
                  display: "flex", gap: "16px", padding: "24px",
                  background: "#FFF", borderRadius: "24px", border: "1px solid var(--border)",
                }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color="var(--gold)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 750, color: "#0A1424", marginBottom: "6px" }}>{item.title}</h4>
                    <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BULK ORDER FORM ── */}
      <section id="bulk-order" style={{ padding: "clamp(80px, 10vw, 130px) 24px", background: "#0A1424", color: "#fff", position: "relative" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(201,168,106,0.12)", border: "1px solid rgba(201,168,106,0.25)",
              borderRadius: "100px", padding: "6px 14px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px"
            }}>
              Custom Consultation
            </span>
            <h2 className="clash" style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 700 }}>Request a Bulk Engraving Quote</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "12px", lineHeight: 1.6 }}>
              Ordering customized nameplates, plaques, gifts or signage for your office or events? Fill out the brief below. (Minimum bulk volume: 10 units)
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: "rgba(201,168,106,0.12)", border: "1px solid var(--gold-border)",
                borderRadius: "24px", padding: "48px 32px", textAlign: "center"
              }}
            >
              <h3 className="clash" style={{ fontSize: "22px", color: "var(--gold)", marginBottom: "12px" }}>✓ Specs Received</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                Thank you! Our design director will review your specifications and get in touch within 24 hours with design drafts and bulk price adjustments.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <style>{`
                  .bulk-input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 14px;
                    padding: 14px 18px;
                    color: #FFF;
                    font-size: 13.5px;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                    transition: all 0.3s ease;
                  }
                  .bulk-input:focus {
                    border-color: var(--gold);
                    background: rgba(255,255,255,0.06);
                  }
                  .bulk-label {
                    display: block;
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 8px;
                  }
                `}</style>
              <div className="responsive-form-grid">
                <div>
                  <label className="bulk-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="bulk-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="bulk-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    className="bulk-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="responsive-form-grid">
                <div>
                  <label className="bulk-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
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

              <div className="responsive-form-grid">
                <div>
                  <label className="bulk-label">Material / Product Type</label>
                  <select
                    className="bulk-input"
                    style={{ appearance: "none", background: "#0A1424" }}
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  >
                    <option value="Wooden Plaques">Wooden Plaques &amp; Signs</option>
                    <option value="Acrylic Products">Acrylic Blocks &amp; Keepsakes</option>
                    <option value="Leather Items">Leather Coasters &amp; Sleeves</option>
                    <option value="Other Crafts">Other Material Cutting</option>
                  </select>
                </div>
                <div>
                  <label className="bulk-label">Quantity Required *</label>
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
                <label className="bulk-label">Project Brief &amp; Text to Engrave *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us what you want to engrave. Include text details, size limits, logo assets availability, or specialized finishes..."
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
                  marginTop: "8px", width: "100%", justifyContent: "center", cursor: "pointer",
                  opacity: submitting ? 0.7 : 1, padding: "16px 0"
                }}
              >
                {submitting ? "Submitting Inquiry..." : "Submit Inquiry Brief"}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </div>
  );
}
