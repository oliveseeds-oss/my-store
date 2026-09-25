import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import ReviewSection from "../components/ReviewSection";

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
    desc: "Sleek, glass-like transparency with safe polished edges. Popular for architectural signage and modern awards.",
    img: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Pen", 
    name: "Genuine Leather", 
    desc: "High-contrast tactile markings on rich leather skins. Excellent for bespoke tech sleeves & notebooks.",
    img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Globe", 
    name: "Tempered Glass & Crystal", 
    desc: "Precision-frosted patterns refracting light at high clarity. Premium choice for executive awards.",
    img: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    icon: "Box", 
    name: "Premium Finished MDF", 
    desc: "Ultra-smooth density cores carved with precision. Excellent for geometric wall decors.",
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop" 
  },
];

const WHY_US = [
  { icon: "Wood", title: "Micro-Precision Detailing", desc: "Advanced calibrated instruments calibrated for micron accuracy." },
  { icon: "Sparkles", title: "Hand-Finished Timber", desc: "Strictly select organic Teakwood, Bamboo and architectural Acrylic panels." },
  { icon: "Globe", title: "Worldwide Shipping", desc: "Insured safe box deliveries globally across 25+ target regions." },
  { icon: "Box", title: "Pre-Production Approvals", desc: "We coordinate and share detailed design mockup blueprints before production." },
  { icon: "Support", title: "Enterprise Pricing", desc: "Dedicated managers and custom volume structures for corporate events." },
  { icon: "Trophy", title: "Bespoke Object Craft", desc: "Expert craft team ensuring high contrast and clean edges on every piece." },
];

const STEPS = [
  { num: "01", title: "Share Design & Spec", desc: "Provide your dimensions, select materials, and upload vector artwork/logos." },
  { num: "02", title: "Mockup Approval", desc: "Our craft designers render a digital preview proof file for your confirmation." },
  { num: "03", title: "Studio Detailing", desc: "We execute deep-relief detailing with micron precision in our studio." },
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
    document.title = "Bespoke Design Products | Olive Seeds Design Studio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore our curated collection of bespoke design products — custom corporate gifts, branded décor, and premium design objects for discerning B2B clients.");
    }
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
    <div style={{ background: "#FFFFFF", color: "#181A18", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO
        title="Bespoke Design Products | Olive Seeds Design Studio"
        description="Explore our curated collection of bespoke design products — custom corporate gifts, branded décor, and premium design objects for discerning B2B clients."
        keywords="bespoke objects, custom corporate collections, architectural nameplates, hand-finished timber, acrylic collection"
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
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #E7E7E2;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          aspect-ratio: 4/3;
        }
        @media (max-width: 576px) {
          .hero-img-box {
            border-radius: 4px;
          }
        }
      `}</style>

      {/* ── HERO BANNER ── */}
      <section style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E7E7E2",
        padding: "clamp(110px, 12vw, 150px) 0 clamp(60px, 8vw, 90px)",
        color: "#181A18",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="engraving-hero">
          {/* Left info */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#F8F8F6", border: "1px solid #E7E7E2",
              borderRadius: "4px", padding: "6px 14px",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#23483D", marginBottom: "20px",
              marginInline: "auto"
            }} className="mx-auto lg:ml-0">
              ⚡ High-Precision Studio
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 4.5vw, 4rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: "20px", width: "100%", color: "#181A18" }}>
              Bespoke Custom Object Solutions
            </h1>
            <p style={{ color: "#676A65", fontSize: "15px", lineHeight: 1.7, maxWidth: "560px", marginBottom: "32px" }}>
              Transform organic teakwood, premium acrylic blocks, custom leather, and tempered crystal trophies into masterfully finished luxury keepsakes. Trusted by global brands and events.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", justifyContent: "center" }} className="lg:justify-start">
              <a href="#bulk-order" style={{ background: "#23483D", color: "#FFFFFF", borderRadius: "4px", padding: "12px 26px", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} className="hover:bg-[#16352D]">
                Request a Proposal
              </a>
              <a href="#materials" style={{ background: "#FFFFFF", border: "1px solid #E7E7E2", color: "#181A18", borderRadius: "4px", padding: "12px 26px", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} className="hover:bg-[#F8F8F6]">
                Explore Materials
              </a>
            </div>
          </div>

          {/* Right graphics mockup */}
          <div className="hero-img-box">
            <img 
              src={settings.engraving_hero_image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"} 
              alt="Precision craft tools calibrating depth on solid teakwood template"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            {/* Glass badge */}
            <div style={{
              position: "absolute", bottom: "16px", left: "16px",
              background: "rgba(255, 255, 255, 0.95)", border: "1px solid #E7E7E2",
              backdropFilter: "blur(12px)", padding: "12px 18px", borderRadius: "4px",
              display: "flex", gap: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
            }}>
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#676A65", fontWeight: 500, margin: 0 }}>Calibration</p>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#23483D", margin: "2px 0 0" }}>0.01 mm</p>
              </div>
              <div style={{ borderLeft: "1px solid #E7E7E2" }} />
              <div>
                <p style={{ fontSize: "10px", textTransform: "uppercase", color: "#676A65", fontWeight: 500, margin: 0 }}>Materials</p>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#181A18", margin: "2px 0 0" }}>Premium Core</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO / IMAGES SECTION ── */}
      <section style={{ padding: "80px 24px", background: "#FFFFFF", borderBottom: "1px solid #E7E7E2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "center" }}>
            <div style={{ position: "relative", borderRadius: "4px", overflow: "hidden", border: "1px solid #E7E7E2", height: "380px" }}>
              <img 
                src={settings.engraving_showcase_image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"} 
                alt="Personalised presentation boxes ready for dispatch" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#23483D", display: "block", marginBottom: "12px" }}>Artisan Studio</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 400, color: "#181A18", marginBottom: "20px", lineHeight: 1.25 }}>Exceptional Contrast &amp; Crisp Tactile Finishes</h2>
              <p style={{ color: "#676A65", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
                Considered object design is not just about surfaces — it is an art of speed, power, and focal calibrations. Our studio instruments carefully craft custom vector graphics, high-end typography, and complex brand logo signatures with zero fraying or rough margins.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ borderLeft: "3px solid #23483D", paddingLeft: "14px" }}>
                  <p style={{ fontWeight: 600, fontSize: "14px", margin: 0, color: "#181A18" }}>Teakwood nameplates</p>
                  <p style={{ fontSize: "12px", color: "#676A65", margin: "4px 0 0" }}>Deep 3D tactile detail</p>
                </div>
                <div style={{ borderLeft: "3px solid #23483D", paddingLeft: "14px" }}>
                  <p style={{ fontWeight: 600, fontSize: "14px", margin: 0, color: "#181A18" }}>Frosted acrylic blocks</p>
                  <p style={{ fontSize: "12px", color: "#676A65", margin: "4px 0 0" }}>Clean ice-like glow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MATERIAL CARDS WITH IMAGES ── */}
      <section id="materials" style={{ padding: "clamp(60px, 8vw, 100px) 24px", background: "#F8F8F6", borderBottom: "1px solid #E7E7E2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#23483D", display: "block", marginBottom: "8px" }}>Selected Materials</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#181A18", marginBottom: "14px" }}>Explore Architectural Materials</h2>
            <p style={{ fontSize: "14px", color: "#676A65", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              We handpick and finish every raw panel to ensure optimal density, structure, and high contrast vector responses.
            </p>
          </div>

          <div className="materials-grid">
            {MATERIALS.map((mat, i) => {
              const Icon = Icons[mat.icon] || Icons.Sparkles;
              return (
                <FadeUp key={i} delay={i * 0.08}>
                  <div style={{
                    background: "#FFFFFF",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid #E7E7E2",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, border-color 0.2s ease"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#23483D"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#E7E7E2"; }}
                  >
                    <div style={{ height: "190px", overflow: "hidden", position: "relative" }}>
                      <img src={mat.img} alt={mat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "14px", left: "14px", background: "#FFFFFF", padding: "8px", borderRadius: "4px", border: "1px solid #E7E7E2", display: "flex" }}>
                        <Icon size={16} color="#23483D" />
                      </div>
                    </div>
                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "19px", fontWeight: 500, color: "#181A18", marginBottom: "6px" }}>{mat.name}</h4>
                      <p style={{ fontSize: "13px", color: "#676A65", lineHeight: 1.6, margin: 0 }}>{mat.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW STEPS ── */}
      <section style={{ padding: "80px 24px", background: "#FFFFFF", borderBottom: "1px solid #E7E7E2" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#23483D", display: "block", marginBottom: "8px" }}>Seamless Workflow</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 400, color: "#181A18" }}>Our Production Pipeline</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                background: "#F8F8F6",
                border: "1px solid #E7E7E2",
                borderRadius: "4px",
                padding: "24px 20px",
              }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#23483D", display: "block", marginBottom: "12px" }}>{step.num}</span>
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#181A18", marginBottom: "8px" }}>{step.title}</h4>
                <p style={{ fontSize: "13px", color: "#676A65", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OLIVE SEEDS ── */}
      <section style={{ padding: "80px 24px", background: "#F8F8F6", borderBottom: "1px solid #E7E7E2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#23483D", display: "block", marginBottom: "8px" }}>Studio Guarantee</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 400, color: "#181A18" }}>High Standards, No Compromise</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {WHY_US.map((item, i) => {
              const Icon = Icons[item.icon] || Icons.Sparkles;
              return (
                <div key={i} style={{
                  display: "flex", gap: "16px", padding: "20px",
                  background: "#FFFFFF", borderRadius: "4px", border: "1px solid #E7E7E2",
                }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "4px", background: "#F8F8F6", border: "1px solid #E7E7E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color="#23483D" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#181A18", marginBottom: "4px" }}>{item.title}</h4>
                    <p style={{ fontSize: "12px", color: "#676A65", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BULK ORDER FORM ── */}
      <section id="bulk-order" style={{ padding: "clamp(70px, 9vw, 110px) 24px", background: "#FFFFFF", color: "#181A18", position: "relative" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#F8F8F6", border: "1px solid #E7E7E2",
              borderRadius: "4px", padding: "5px 14px",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#23483D", marginBottom: "14px"
            }}>
              Custom Consultation
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "#181A18" }}>Request a B2B &amp; Volume Proposal</h2>
            <p style={{ color: "#676A65", fontSize: "14px", marginTop: "10px", lineHeight: 1.6 }}>
              Ordering bespoke nameplates, plaques, awards or architectural signage for your organisation or events? Fill out the brief below. (Minimum volume: 10 units)
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: "#F8F8F6", border: "1px solid #E7E7E2",
                borderRadius: "4px", padding: "40px 28px", textAlign: "center"
              }}
            >
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#23483D", marginBottom: "10px" }}>✓ Specs Received</h3>
              <p style={{ fontSize: "14px", color: "#676A65", lineHeight: 1.6, margin: 0 }}>
                Thank you for your submission. Our design director will review your specifications and respond within 24 hours with conceptual proposals and volume terms.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <style>{`
                  .bulk-input {
                    width: 100%;
                    background: #FFFFFF;
                    border: 1px solid #DADCD7;
                    border-radius: 4px;
                    padding: 12px 16px;
                    color: #181A18;
                    font-size: 13px;
                    font-family: 'DM Sans', sans-serif;
                    outline: none;
                    transition: border-color 0.2s ease;
                  }
                  .bulk-input:focus {
                    border-color: #23483D;
                  }
                  .responsive-form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                  }
                  @media (min-width: 640px) {
                    .responsive-form-grid {
                      grid-template-columns: 1fr 1fr;
                    }
                  }
                  .bulk-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #676A65;
                    margin-bottom: 6px;
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
                    className="bulk-input cursor-pointer"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  >
                    <option value="Wooden Plaques">Hand-Finished Timber Plaques &amp; Signs</option>
                    <option value="Acrylic Products">Architectural Acrylic Blocks &amp; Keepsakes</option>
                    <option value="Leather Items">Leather Coasters &amp; Sleeves</option>
                    <option value="Other Crafts">Bespoke Architectural Pieces</option>
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
                <label className="bulk-label">Project Brief &amp; Customisation Details *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Tell us about your project. Include customization details, size specifications, brand asset availability, or required finishes..."
                  className="bulk-input resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: "8px", width: "100%", justifyContent: "center", cursor: "pointer",
                  opacity: submitting ? 0.7 : 1, padding: "14px 0",
                  background: "#23483D", color: "#FFFFFF", borderRadius: "4px",
                  fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
                  border: "none", transition: "all 0.2s"
                }}
                className="hover:bg-[#16352D]"
              >
                {submitting ? "Submitting Inquiry..." : "Submit Project Brief"}
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <ReviewSection productId={1} />
      </div>

      <Footer settings={settings} />
    </div>
  );
}
