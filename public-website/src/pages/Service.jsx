import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import API from "../api";

const Icons = {
  UIUX: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  ),
  WebDev: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  Mobile: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Graphic: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Brand: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  AI: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
    </svg>
  ),
  Globe: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Sparkles: ({ color = "var(--gold)", size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" opacity="0.6" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" opacity="0.6" />
    </svg>
  ),
};

const FadeUp = ({ children, delay = 0, className = "", style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

const SERVICES = [
  {
    title: "Brand & Visual Identity",
    iconKey: "Brand",
    desc: "A brand is not a logo — it is a language. We develop complete visual identity systems for organisations that understand the difference. From mark-making and typographic systems to colour language and brand guidelines, we build identities that translate with authority across every touchpoint.",
    tag: "Ideal for: New organisations, rebranding projects, corporate identity refreshes",
  },
  {
    title: "Custom Product Design",
    iconKey: "Sparkles",
    desc: "We design and produce bespoke physical objects — from executive gift collections and branded stationery to architectural décor pieces and custom retail products. Every object is designed to specification, produced with care, and finished to a standard your recipients will notice.",
    tag: "Ideal for: Corporate gifting, hospitality amenities, event collections. Available for B2B volume orders.",
  },
  {
    title: "Spatial & Décor Design",
    iconKey: "Graphic",
    desc: "We work with interior designers, hospitality groups, and commercial property clients to produce custom design elements for built environments — signage systems, branded décor objects, and curated visual installations.",
    tag: "Ideal for: Hotels, restaurants, office interiors, retail environments, boutique spaces",
  },
  {
    title: "Event & Occasion Design",
    iconKey: "Sparkles",
    desc: "From corporate summits to private celebrations — we design the visual and material world of your event. Bespoke stationery, custom signage, welcome gifting, and branded experiential elements — produced to a unified standard of excellence.",
    tag: "Ideal for: Corporate events, product launches, award ceremonies, private occasions",
  },
  {
    title: "Digital Design & Brand Assets",
    iconKey: "WebDev",
    desc: "Premium digital design assets — presentation templates, social media systems, digital stationery, and branded document suites — all crafted to the same standard as our physical work.",
    tag: "Ideal for: Corporate teams, agencies, content creators, educational institutions",
  },
  {
    title: "Educational & Institutional Design",
    iconKey: "Globe",
    desc: "We partner with schools, universities, and educational organisations to produce distinguished design for their communities — from institutional stationery and award pieces to event design and campus visual identity.",
    tag: "Ideal for: Schools, universities, academies, foundations, training organisations",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Consultation & Briefing",
    desc: "We examine your organisation's identity, objectives, and project parameters to establish a clear creative brief.",
  },
  {
    num: "02",
    title: "Conceptual Development",
    desc: "Our studio explores material, architectural, and visual directions, developing bespoke proposals tailored to your brand.",
  },
  {
    num: "03",
    title: "Prototyping & Sampling",
    desc: "Material swatches, physical finish samples, or digital design proofs are presented for thorough review and refinement.",
  },
  {
    num: "04",
    title: "Precision Production",
    desc: "Master artisans and design specialists craft each piece using architectural materials, precision detailing, and rigorous quality control.",
  },
  {
    num: "05",
    title: "Curation & Delivery",
    desc: "Every commission is inspected, hand-packed in protective presentation suites, and dispatched with tracked international logistics.",
  },
  {
    num: "06",
    title: "Ongoing Partnership",
    desc: "We maintain archival records of your specifications to facilitate effortless future reorders and brand extensions.",
  },
];

export default function Service() {
  useEffect(() => {
    document.title = "Bespoke Design Services | Corporate & Brand Design — Olive Seeds";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Premium creative services for corporations, hotels, institutions, and lifestyle brands — from brand identity and spatial design to corporate gifting.");
    }
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.substring(1));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    project_type: "",
    budget_range: "",
    timeline: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.company || !form.email || !form.project_type || !form.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/design-inquiries", form);
      setSuccess(true);
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        project_type: "",
        budget_range: "",
        timeline: "",
        message: ""
      });
    } catch (err) {
      alert("Failed to send inquiry. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: "#FFFFFF",
        fontFamily: "'DM Sans', sans-serif",
        color: "#181A18",
      }}
    >
      {/* ─── GOOGLE FONTS ─── */}
      <style>{`
        :root {
          --bg:          #FFFFFF;
          --text:        #181A18;
          --text-2:      #676A65;
          --accent:      #23483D;
          --accent-h:    #16352D;
          --gold:        #A48855;
          --gold-soft:   rgba(164,136,85,0.08);
          --gold-border: rgba(164,136,85,0.22);
          --surface:     #FFFFFF;
          --border:      #E7E7E2;
          --radius:      4px;
          --radius-sm:   3px;
          --shadow-sm:   0 2px 8px rgba(20,25,22,0.03);
          --shadow-md:   0 8px 30px rgba(20,25,22,0.04);
          --shadow-lg:   0 12px 40px rgba(20,25,22,0.05);
        }

        * { box-sizing: border-box; }

        .os-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .os-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold);
        }

        /* HERO GRID LINES */
        .hero-grid {
          background-image:
            linear-gradient(rgba(164,136,85,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(164,136,85,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* SERVICE CARD */
        .service-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 44px 36px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .service-card:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-md);
          transform: translateY(-3px);
        }

        /* STAT CARD */
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 32px 24px;
          text-align: center;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold-border);
          box-shadow: var(--shadow-md);
        }

        /* PROCESS STEP */
        .process-step {
          display: flex;
          gap: 28px;
          padding: 32px 0;
          border-bottom: 1px solid var(--border);
          transition: all 0.3s ease;
        }
        .process-step:last-child { border-bottom: none; }
        .process-step:hover {
          padding-left: 8px;
        }
        .process-step:hover .ps-num { color: var(--gold) !important; }

        /* PRIMARY BTN */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 13px 28px;
          border-radius: var(--radius);
          border: 1px solid var(--accent);
          cursor: pointer;
          text-decoration: none;
          box-shadow: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover {
          background: var(--accent-h);
          border-color: var(--accent-h);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .btn-primary svg {
          transition: transform 0.25s ease;
        }
        .btn-primary:hover svg {
          transform: translateX(4px);
        }

        /* SECONDARY BTN */
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: var(--text);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 13px 28px;
          border-radius: var(--radius);
          border: 1px solid var(--border-hover, #CACCC6);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-secondary:hover {
          border-color: var(--accent);
          background: var(--surface-warm);
          color: var(--accent);
          transform: translateY(-2px);
        }

        /* FORM INPUT */
        .form-input {
          width: 100%;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1.5px solid var(--border);
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: var(--text);
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .form-input::placeholder { color: #a5b0c0; }
        .form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 4px rgba(201,168,106,0.12);
        }

        /* SECTION DIVIDER */
        .section-divider {
          width: 44px;
          height: 3px;
          background: linear-gradient(90deg, var(--gold) 0%, var(--accent) 100%);
          border-radius: 2px;
          margin-bottom: 22px;
        }

        /* WHY CARD */
        .why-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 36px 32px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .why-card:hover {
          transform: translateY(-6px);
          border-color: var(--gold-border);
          box-shadow: var(--shadow-md);
        }

        /* TESTIMONIAL */
        .testimonial-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 44px 36px;
          box-shadow: var(--shadow-sm);
          transition: all 0.35s ease;
        }
        .testimonial-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--gold-border);
        }

        /* DARK CTA */
        .dark-cta {
          background: var(--accent);
          border-radius: 32px;
          padding: 96px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .dark-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 100%, rgba(201,168,106,0.18), transparent 70%);
          pointer-events: none;
        }

        /* TECH BADGE */
        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--accent);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tech-badge:hover {
          border-color: var(--gold);
          color: var(--gold);
          transform: translateY(-3px);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
          .os-hero-h1 { font-size: 42px !important; }
          .dark-cta { padding: 60px 24px !important; }
        }

        /* Responsive Grids & Layouts */
        .responsive-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 1024px) {
          .responsive-grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .responsive-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .responsive-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }
        @media (max-width: 768px) {
          .responsive-grid-2 {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .responsive-split-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        @media (max-width: 1024px) {
          .responsive-split-2 {
            gap: 40px;
          }
        }
        @media (max-width: 768px) {
          .responsive-split-2 {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }

        .responsive-split-1-2 {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 80px;
        }
        @media (max-width: 1024px) {
          .responsive-split-1-2 {
            gap: 40px;
          }
        }
        @media (max-width: 768px) {
          .responsive-split-1-2 {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }

        .responsive-split-2-1 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 80px;
        }
        @media (max-width: 1024px) {
          .responsive-split-2-1 {
            gap: 40px;
          }
        }
        @media (max-width: 768px) {
          .responsive-split-2-1 {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }

        .responsive-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .responsive-form {
            grid-template-columns: 1fr;
          }
          .responsive-form > div {
            grid-column: span 1 !important;
          }
          .responsive-form > button {
            grid-column: span 1 !important;
          }
        }

        .responsive-hero-mockup {
          margin-top: 72px;
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow: 0 24px 80px rgba(14,19,32,0.08);
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          max-width: 900px;
        }
        @media (max-width: 640px) {
          .responsive-hero-mockup {
            grid-template-columns: 1fr;
            padding: 24px 20px;
          }
          .responsive-hero-mockup > div:last-child {
            grid-column: span 1 !important;
            flex-wrap: wrap;
          }
        }

        .responsive-padding {
          padding: 100px 32px;
        }
        @media (max-width: 768px) {
          .responsive-padding {
            padding: 60px 20px;
          }
        }

        /* Service Page Hero Overrides (Desktop & Tablet) */
        .service-hero-section {
          position: relative;
          overflow: hidden;
        }
        
        @keyframes slowGlow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.7; }
          50% { transform: scale(1.2) translate(-30px, 30px); opacity: 0.9; }
        }
        @keyframes floatMockup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @media (min-width: 769px) {
          .service-hero-section {
            padding-top: 130px !important;
            padding-bottom: 110px !important;
          }
          .service-hero-glow {
            background: radial-gradient(circle, rgba(164, 136, 85, 0.08) 0%, transparent 70%) !important;
            animation: slowGlow 12s ease-in-out infinite;
          }
          .service-hero-mockup-animate {
            animation: floatMockup 7s ease-in-out infinite;
          }
        }
      `}</style>

      <SEO
        title="Bespoke Design Services | Corporate & Brand Design — Olive Seeds"
        description="Premium creative services for corporations, hotels, institutions, and lifestyle brands — from brand identity and spatial design to corporate gifting."
        keywords="bespoke design services, corporate identity, brand design, spatial design, corporate gifting, event design"
      />
      <Navbar />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section
        className="service-hero-section relative"
        style={{ paddingTop: "clamp(90px, 11vw, 140px)", paddingBottom: "clamp(70px, 9vw, 120px)", background: "var(--bg)", position: "relative", overflow: "hidden" }}
      >
        {/* Ambient Warm Champagne Gold Glow Decoration with Motion */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.6, 0.35],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-10%",
            right: "15%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, rgba(197, 168, 128, 0.04) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />

        {/* Ambient Second Subtle Halo Bottom-Left */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
            y: [0, 15, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "8%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(164, 136, 85, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />

        {/* Delicate Animated Geometric Gold Rings Motion Decor */}
        <motion.div
          animate={{
            rotate: [0, 360],
            y: [0, -10, 0]
          }}
          transition={{
            rotate: { duration: 65, repeat: Infinity, ease: "linear" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "1px dashed rgba(197, 168, 128, 0.25)",
            pointerEvents: "none",
            zIndex: 1,
            display: "none",
          }}
          className="lg:block"
        >
          <div style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            border: "1px solid rgba(197, 168, 128, 0.15)",
          }} />
          <div style={{
            position: "absolute",
            top: -4,
            left: "50%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#C5A880",
            boxShadow: "0 0 10px rgba(197, 168, 128, 0.6)"
          }} />
        </motion.div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Label */}
          <FadeUp>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#FAF6EE",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "6px 16px",
              marginBottom: 24,
            }}>
              <span style={{ color: "#C5A880", fontSize: 11 }}>✦</span>
              <span className="os-label" style={{ color: "var(--accent)" }}>Olive Seeds Design Studio · Bespoke Practice</span>
            </div>
          </FadeUp>

          {/* H1 */}
          <FadeUp delay={0.1}>
            <h1
              className="os-heading os-hero-h1"
              style={{ fontSize: "clamp(38px, 5.5vw, 68px)", color: "var(--accent)", maxWidth: 880, margin: "0 auto 24px", lineHeight: 1.12, letterSpacing: "-0.01em" }}
            >
              What We Do
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p
              style={{
                fontSize: "clamp(15px, 1.8vw, 18px)",
                color: "var(--text-2)",
                maxWidth: 680,
                lineHeight: 1.8,
                margin: "0 auto 40px",
                fontWeight: 400,
              }}
            >
              Six creative disciplines. One consistent standard of excellence. We partner with organisations that believe design is an investment, not an expense.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.3}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: "10px" }}>
              <a href="#contact" className="btn-primary" style={{ padding: "14px 34px", fontSize: 12 }}>
                Start a Conversation
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <Link to="/products" className="btn-secondary" style={{ padding: "14px 32px", fontSize: 12, background: "#FFFFFF", border: "1px solid var(--border)" }}>
                Explore the Collection
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════
          TRUST INDICATORS
      ══════════════════════════════ */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <style>{`
            .trust-indicators-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0;
            }
            .trust-indicator-item {
              padding: 48px 32px;
              border-right: 1px solid var(--border);
              text-align: center;
            }
            .trust-indicator-item:last-child {
              border-right: none;
            }
            @media (max-width: 1024px) {
              .trust-indicators-grid {
                grid-template-columns: repeat(2, 1fr);
              }
              .trust-indicator-item {
                border-bottom: 1px solid var(--border);
              }
              .trust-indicator-item:nth-child(even) {
                border-right: none;
              }
              .trust-indicator-item:nth-last-child(-n+2) {
                border-bottom: none;
              }
            }
            @media (max-width: 640px) {
              .trust-indicators-grid {
                grid-template-columns: 1fr;
              }
              .trust-indicator-item {
                border-right: none !important;
                border-bottom: 1px solid var(--border);
                padding: 32px 20px;
              }
              .trust-indicator-item:last-child {
                border-bottom: none;
              }
            }
          `}</style>
          <div className="trust-indicators-grid">
            {[
              ["120+", "Projects Delivered", "Across 12 industries"],
              ["99%", "Client Satisfaction", "Measured post-launch"],
              ["25+", "Brands Served", "Global client base"],
              ["5+", "Years of Experience", "Since 2019"],
            ].map(([num, label, sub], i) => (
              <div key={i} className="trust-indicator-item">
                <div
                  className="os-heading"
                  style={{ fontSize: 40, color: "var(--gold)", marginBottom: 6 }}
                >
                  {num}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PROBLEM / SOLUTION
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="responsive-split-2">
            {/* Left */}
            <div>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 16 }}>The Cost of Compromise</span>
              <h2 className="os-heading" style={{ fontSize: 42, color: "var(--accent)", marginBottom: 24 }}>
                Where ordinary design falls short
              </h2>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 36 }}>
                For ambitious organisations, visual mediocrity is not simply an aesthetic flaw — it actively dilutes perceived value, weakens credibility, and undermines customer trust.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Generic brand identities that fail to distinguish your organisation in crowded markets",
                  "Inconsistent presentation across physical objects, corporate communications, and digital platforms",
                  "Mass-produced corporate gifting that feels transactional and is quickly discarded",
                  "Spatial and architectural environments that lack bespoke signage and brand cohesion",
                  "Presentation assets that undermine senior executive authority in critical meetings",
                  "Disjointed vendor relationships that compromise quality control between design and production",
                ].map((problem, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round" /></svg>
                    </div>
                    <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{problem}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <div
                style={{
                  background: "var(--accent)",
                  borderRadius: 24,
                  padding: "48px 44px",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(201, 168, 106, 0.2)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(201, 168, 106, 0.15), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="os-label" style={{ color: "var(--gold)", display: "block", marginBottom: 16 }}>The Atelier Standard</span>
                  <h3 className="os-heading" style={{ fontSize: 28, color: "#ffffff", marginBottom: 24, lineHeight: 1.2 }}>
                    Considered design that commands authority and endures
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      ["Distinctive Visual Systems", "crafted to reflect your character across every medium"],
                      ["Bespoke Physical Objects", "hand-finished pieces engineered to be retained and valued"],
                      ["Executive Digital Assets", "presentation and brand suites built for senior leadership"],
                      ["Unified Creative Practice", "seamless coordination from concept to delivery"],
                    ].map(([title, desc], i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(201,168,106,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>{title}</span>
                          <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}> — {desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a href="#contact" className="btn-white-solid" style={{ marginTop: 36, display: "inline-flex", background: "#ffffff", color: "var(--accent)", border: "1px solid #ffffff", fontWeight: 600 }}>
                    Discuss Your Brief
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICES
      ══════════════════════════════ */}
      <section
        id="services"
        className="responsive-padding"
        style={{ background: "var(--surface)" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Our Practice</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>
                Studio Services
              </h2>
            </div>
            <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 360, lineHeight: 1.8 }}>
              A considered range of design services — each one structured for clients who hold their brand to the highest standard.
            </p>
          </div>

          {/* Grid */}
          <div className="responsive-grid-3">
            {SERVICES.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div
                  className="service-card"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "36px 30px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                  }}
                >
                  <div>
                    {/* Top Row: Service Number & Icon */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "var(--gold)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        0{i + 1}
                      </span>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 4,
                          background: "var(--gold-soft)",
                          border: "1px solid var(--gold-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(() => {
                          const IconComponent = Icons[s.iconKey];
                          return IconComponent ? <IconComponent color="var(--gold)" size={20} /> : null;
                        })()}
                      </div>
                    </div>

                    <h3
                      className="os-heading"
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "var(--accent)",
                        marginBottom: 12,
                        lineHeight: 1.25,
                      }}
                    >
                      {s.title}
                    </h3>

                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 20 }}>
                      {s.desc}
                    </p>
                  </div>

                  {/* Docked Suitability Footer */}
                  <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Scope &amp; Fit
                    </span>
                    <span style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6, display: "block" }}>
                      {s.tag.replace(/^Ideal for:\s*/i, "")}
                    </span>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURED WORK (visual proof)
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: 56 }}>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Selected Work</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>
                Selected Studio Commissions
              </h2>
            </div>
          </FadeUp>

          <div className="responsive-grid-2">
            {/* Featured large card */}
            <FadeUp delay={0.1}>
              <div
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 24,
                  overflow: "hidden",
                  padding: "48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: 400,
                  position: "relative",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,19,32,0.92) 0%, rgba(14,19,32,0.3) 60%, transparent 100%)", zIndex: 1 }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "block" }}>Spatial &amp; Décor Design</span>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>Bespoke Hospitality Signage &amp; Interior System</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Architectural Materials · Custom Detailing · Spatial Identity</p>
                </div>
              </div>
            </FadeUp>

            {/* Two smaller cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { img: "https://images.unsplash.com/photo-1555774698-0b77e0d5fa6a?auto=format&fit=crop&w=600&q=80", accent: "var(--gold)", label: "Corporate Gifting", title: "Executive Timber & Brass Presentation Suites", sub: "Hand-Finished Timber · Precision Detailing · Custom Packaging" },
                { img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", accent: "var(--gold)", label: "Brand Identity", title: "Comprehensive Visual Identity System", sub: "Typographic Architecture · Brand Guidelines · Digital Assets" },
              ].map((item, i) => (
                <FadeUp key={i} delay={0.15 + i * 0.08}>
                  <div
                    style={{
                      backgroundImage: `url('${item.img}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 24,
                      padding: "36px",
                      flex: 1,
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 188,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      boxShadow: "var(--shadow-sm)"
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,19,32,0.92) 0%, rgba(14,19,32,0.3) 70%, transparent 100%)", zIndex: 1 }} />
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: item.accent, marginBottom: 8, display: "block" }}>{item.label}</span>
                      <h3 style={{ fontSize: 19, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 6 }}>{item.title}</h3>
                      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>{item.sub}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          <FadeUp delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link to="/portfolio" className="btn-secondary" style={{ padding: "16px 36px" }}>View Full Portfolio</Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════
          PROCESS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <style>{`
            .process-left-col {
              position: sticky;
              top: 100px;
            }
            @media (max-width: 768px) {
              .process-left-col {
                position: relative !important;
                top: 0 !important;
              }
            }
          `}</style>
          <div className="responsive-split-1-2">
            {/* Left sticky header */}
            <div className="process-left-col">
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Our Process</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)", marginBottom: 24 }}>
                From Vision To Reality
              </h2>
              <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8 }}>
                A disciplined six-stage methodology engineered for predictability, craftsmanship, and uncompromising finish.
              </p>
              <a href="#contact" className="btn-primary" style={{ marginTop: 32, display: "inline-flex" }}>
                Discuss Your Brief
              </a>
            </div>

            {/* Right steps */}
            <div>
              {PROCESS_STEPS.map((step, i) => (
                <FadeUp key={i} delay={i * 0.05}>
                  <div className="process-step">
                    <div>
                      <span
                        className="ps-num os-heading"
                        style={{ fontSize: 32, color: "var(--border)", display: "block", lineHeight: 1, marginBottom: 0, transition: "color 0.3s" }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <div style={{ paddingLeft: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", marginBottom: 8, letterSpacing: "-0.02em" }}>{step.title}</h3>
                      <p style={{ fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.8 }}>{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          WHY CLIENTS CHOOSE US
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-divider" style={{ margin: "0 auto 20px" }} />
            <span className="os-label" style={{ display: "block", marginBottom: 14, textAlign: "center" }}>Why Olive Seeds</span>
            <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>
              What sets us apart
            </h2>
          </div>

          <div className="responsive-grid-3">
            {[
              { iconKey: "UIUX", title: "Strategic Thinking", desc: "We don't just execute briefs — we interrogate them. Every design decision is rooted in business strategy and measurable goals." },
              { iconKey: "Brand", title: "Modern Design Language", desc: "No templates. No recycled patterns. Every project gets a bespoke visual system engineered for your audience." },
              { iconKey: "WebDev", title: "Technical Depth", desc: "Our engineers and designers work in parallel. Clean code, scalable architecture, and pixel-perfect implementation — always." },
              { iconKey: "AI", title: "AI-Native Capabilities", desc: "We integrate GPT, automation, and intelligent workflows natively into your product — not as an afterthought." },
              { iconKey: "Mobile", title: "Business Understanding", desc: "We speak business fluently. KPIs, conversion rates, customer lifetime value — these drive every design choice we make." },
              { iconKey: "Sparkles", title: "Long-Term Partnership", desc: "We build long relationships, not one-off projects. Ongoing support, iterations, and continuous improvement come standard." },
            ].map((item, i) => {
              const IconComponent = Icons[item.iconKey];
              return (
                <FadeUp key={i} delay={i * 0.06}>
                  <div className="why-card" style={{ height: "100%" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--gold-soft)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                      {IconComponent ? <IconComponent color="var(--gold)" size={20} /> : null}
                    </div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "var(--accent)", marginBottom: 10, letterSpacing: "-0.01em" }}>{item.title}</h3>
                    <p style={{ fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.8 }}>{item.desc}</p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          RESULTS / METRICS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-divider" style={{ margin: "0 auto 20px" }} />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Results</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>
                Outcomes that move the needle
              </h2>
            </div>
          </FadeUp>

          <div className="responsive-grid-2">
            {[
              { metric: "+340%", label: "Average conversion rate improvement", color: "var(--accent)", bar: "85%" },
              { metric: "20hrs/wk", label: "Average time saved through automation", color: "#14B87A", bar: "70%" },
              { metric: "+4.8★", label: "Average app store rating post-redesign", color: "var(--gold)", bar: "96%" },
              { metric: "3× Faster", label: "Time-to-market vs. in-house teams", color: "var(--accent)", bar: "75%" },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px" }}>
                  <div className="os-heading" style={{ fontSize: 40, color: item.color, marginBottom: 8 }}>{item.metric}</div>
                  <div style={{ fontSize: 14.5, color: "var(--text-2)", marginBottom: 20 }}>{item.label}</div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: item.bar, background: item.color, borderRadius: 3, transition: "width 1s" }} />
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TECHNOLOGY
      ══════════════════════════════ */}
      <section style={{ padding: "100px 0", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <span className="os-label" style={{ display: "block", marginBottom: 10 }}>Technology Stack</span>
              <h2 className="os-heading" style={{ fontSize: 32, color: "var(--accent)" }}>Built with world-class tools</h2>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {["Figma", "Framer", "React", "Next.js", "Flutter", "WordPress", "N8N", "OpenAI", "Tailwind CSS", "TypeScript", "Node.js", "More"].map((tech, i) => (
                <span key={i} className="tech-badge">{tech}</span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "var(--surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ marginBottom: 56 }}>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Client Testimonials</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>What clients say</h2>
            </div>
          </FadeUp>

          <div className="responsive-grid-3">
            {[
              {
                quote: "Olive Seeds completely transformed how our product looks and performs. The new design doubled our trial-to-paid conversion in 6 weeks.",
                name: "Sarah Mitchell",
                role: "CEO, Launchpad SaaS",
                initials: "SM",
              },
              {
                quote: "The level of strategic thinking was unlike any design agency we'd worked with before. They asked questions our own team had never considered.",
                name: "Daniel Torres",
                role: "Founder, FinTrack",
                initials: "DT",
              },
              {
                quote: "From brand identity to a full React app in 8 weeks. Professional, communicative, and the output was genuinely world-class.",
                name: "Priya Nair",
                role: "Head of Product, Growthly",
                initials: "PN",
              },
            ].map((t, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="testimonial-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="var(--gold)"><path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5H5.5z" /></svg>
                      ))}
                    </div>

                    <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.8, marginBottom: 28, fontStyle: "italic" }}>
                      "{t.quote}"
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold-soft)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CONTACT / INQUIRY FORM
      ══════════════════════════════ */}
      <section id="contact" className="responsive-padding" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="responsive-split-1-2">
            {/* Left info */}
            <div>
              <div className="section-divider" style={{ width: 44, height: 3, background: "var(--gold)", marginBottom: 20 }} />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Start a Conversation</span>
              <h2 className="os-heading" style={{ fontSize: 40, color: "var(--accent)", marginBottom: 20, fontWeight: 700 }}>
                Start a Conversation
              </h2>
              <p style={{ fontSize: 15.5, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 40 }}>
                Every project begins with a conversation about what you need, when you need it, and what success looks like. We'd love to hear about what you're working on.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: "⏱", title: "One business day response", desc: "Every enquiry reviewed by studio directors" },
                  { icon: "🔒", title: "Strict confidentiality", desc: "Non-disclosure agreements executed on request" },
                  { icon: "💬", title: "Bespoke proposal", desc: "Tailored scope, material schedules, and transparent timelines" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 24,
                padding: "48px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {success ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "48px", color: "var(--gold)", marginBottom: "16px" }}>✓</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent)", marginBottom: "10px" }}>Enquiry Received</h3>
                  <p style={{ fontSize: "14.5px", color: "var(--text-2)", lineHeight: 1.6 }}>
                    Thank you for contacting the studio. Our creative director will review your project details and respond within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="responsive-form">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      className="form-input"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Company *</label>
                    <input
                      type="text"
                      placeholder="Acme Inc."
                      className="form-input"
                      required
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      className="form-input"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Project Type *</label>
                    <select
                      className="form-input"
                      style={{ cursor: "pointer", appearance: "none" }}
                      required
                      value={form.project_type}
                      onChange={e => setForm({ ...form, project_type: e.target.value })}
                    >
                      <option value="">Select a service...</option>
                      <option>Brand & Visual Identity</option>
                      <option>Custom Product Design</option>
                      <option>Spatial & Décor Design</option>
                      <option>Event & Occasion Design</option>
                      <option>Digital Design & Brand Assets</option>
                      <option>Educational & Institutional Design</option>
                      <option>Bespoke Commission / Volume Order</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Budget Range</label>
                    <select
                      className="form-input"
                      style={{ cursor: "pointer", appearance: "none" }}
                      value={form.budget_range}
                      onChange={e => setForm({ ...form, budget_range: e.target.value })}
                    >
                      <option value="">Select budget...</option>
                      <option>Under $2,000</option>
                      <option>$2,000 – $5,000</option>
                      <option>$5,000 – $15,000</option>
                      <option>$15,000 – $50,000</option>
                      <option>$50,000+</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Timeline</label>
                    <select
                      className="form-input"
                      style={{ cursor: "pointer", appearance: "none" }}
                      value={form.timeline}
                      onChange={e => setForm({ ...form, timeline: e.target.value })}
                    >
                      <option value="">Ideal timeline...</option>
                      <option>ASAP (less than 2 weeks)</option>
                      <option>1 – 2 months</option>
                      <option>2 – 4 months</option>
                      <option>4+ months</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.02em" }}>Project Details *</label>
                    <textarea
                      rows={5}
                      placeholder="Tell us about your project, goals, and any specific requirements..."
                      className="form-input"
                      style={{ resize: "none" }}
                      required
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                    style={{ gridColumn: "span 2", justifyContent: "center", fontSize: 15, padding: "18px 32px", cursor: "pointer", marginTop: 12 }}
                  >
                    {submitting ? "Sending..." : "Request a Proposal"}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </form>
              )}

              <p style={{ fontSize: 12, color: "var(--text-2)", textAlign: "center", marginTop: 16 }}>
                By submitting you agree to our Privacy Policy. We never share your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL DARK CTA
      ══════════════════════════════ */}
      <section style={{ padding: "100px 32px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="dark-cta">
            <span className="os-label" style={{ color: "var(--gold)", display: "block", marginBottom: 20, textAlign: "center" }}>
              Tailored Consultation
            </span>
            <h2
              className="os-heading"
              style={{ fontSize: 52, color: "#ffffff", marginBottom: 20, position: "relative", zIndex: 1 }}
            >
              Not Sure Which Service Fits Your Brief?
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.8, position: "relative", zIndex: 1 }}>
              Many of our most successful projects begin as a conversation without a clear brief. Tell us what you are trying to achieve — we will advise on the right approach and provide a tailored proposal at no obligation.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <a
                href="#contact"
                className="btn-white-solid"
                style={{ background: "#ffffff", color: "var(--accent)", fontSize: 15, fontWeight: 600, border: "1px solid #ffffff" }}
              >
                Start a Conversation
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer dark />
    </div>
  );
}