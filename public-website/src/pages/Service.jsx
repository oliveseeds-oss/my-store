import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
    title: "UI / UX Design",
    iconKey: "UIUX",
    desc: "Modern user experiences with premium interfaces, wireframes, prototypes, dashboards and mobile-first systems.",
    tag: "Experience Design",
  },
  {
    title: "Web Development",
    iconKey: "WebDev",
    desc: "High-performance websites and scalable web applications built with modern technologies and clean architecture.",
    tag: "Engineering",
  },
  {
    title: "Mobile App Design",
    iconKey: "Mobile",
    desc: "Beautiful Android & iOS application experiences designed for performance, usability and conversion.",
    tag: "Mobile",
  },
  {
    title: "Graphic Design",
    iconKey: "Graphic",
    desc: "Bespoke print collateral, high-end pitch decks, visual presentation assets and brand style books.",
    tag: "Visual Design",
  },
  {
    title: "Brand Identity",
    iconKey: "Brand",
    desc: "Crafting foundational identities — color frameworks, guidelines, logomarks, typography structures.",
    tag: "Branding",
  },
  {
    title: "AI Integration",
    iconKey: "AI",
    desc: "Deploying automated intelligence, fine-tuning custom prompts, LLM endpoints and smart service wrappers.",
    tag: "Intelligence",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Discovery",
    desc: "Deep research, client alignment, project analysis, and establishing a core design thesis for your business.",
  },
  {
    num: "02",
    title: "Strategy",
    desc: "Craft a precise roadmap — information architecture, tech stack, timeline, and success metrics aligned to outcomes.",
  },
  {
    num: "03",
    title: "Design",
    desc: "High-fidelity systems built in Figma. Every pixel is intentional, every interaction is considered.",
  },
  {
    num: "04",
    title: "Development",
    desc: "Clean, scalable code. Performance-first builds delivered on schedule with full QA and staging reviews.",
  },
  {
    num: "05",
    title: "Launch",
    desc: "Smooth handoff, deployment, and go-live support so nothing falls through the cracks.",
  },
  {
    num: "06",
    title: "Optimization",
    desc: "Post-launch analysis, iteration cycles, and long-term support to keep your product sharp.",
  },
];

export default function Service() {
  useEffect(() => {
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
        background: "#F7F8FA",
        fontFamily: "'Inter', sans-serif",
        color: "#0E1320",
      }}
    >
      {/* ─── GOOGLE FONTS ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

        :root {
          --bg:          #F8F8F5;
          --text:        #0E1320;
          --text-2:      #5E6A7E;
          --accent:      #0F2744;
          --accent-h:    #142f54;
          --gold:        #C9A86A;
          --gold-soft:   rgba(201,168,106,0.12);
          --gold-border: rgba(201,168,106,0.28);
          --surface:     #FFFFFF;
          --border:      #E8EAEF;
          --radius:      24px;
          --radius-sm:   14px;
          --shadow-sm:   0 4px 18px rgba(15,39,68,0.04);
          --shadow-md:   0 10px 45px rgba(15,39,68,0.08);
          --shadow-lg:   0 24px 80px rgba(15,39,68,0.12);
        }

        * { box-sizing: border-box; }

        .os-heading {
          font-family: 'Clash Display', 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }

        .os-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
        }

        /* HERO GRID LINES */
        .hero-grid {
          background-image:
            linear-gradient(rgba(201,168,106,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,106,0.14) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* SERVICE CARD */
        .service-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 44px 36px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,168,106,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .service-card:hover {
          border-color: var(--gold-border);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(201,168,106,0.1);
          transform: translateY(-8px);
        }
        .service-card:hover::before {
          opacity: 1;
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
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%);
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1px solid rgba(201, 168, 106, 0.3);
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(15,39,68,0.15);
          transition: background 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, var(--accent-h) 0%, #1e3a5f 100%);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(15,39,68,0.25), 0 0 0 3px rgba(201,168,106,0.3);
          border-color: rgba(201,168,106,0.7);
        }
        .btn-primary svg {
          transition: transform 0.3s ease;
        }
        .btn-primary:hover svg {
          transform: translateX(6px);
        }

        /* SECONDARY BTN */
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.4);
          color: var(--accent);
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 15px 34px;
          border-radius: 100px;
          border: 1.5px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      background 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      color 0.35s ease,
                      box-shadow 0.35s ease;
        }
        .btn-secondary:hover {
          border-color: var(--gold);
          background: var(--surface);
          color: var(--gold);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 32px rgba(201,168,106,0.12), 0 0 0 2px rgba(201,168,106,0.15);
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
            background: linear-gradient(135deg, #0A1424 0%, #050A12 100%) !important;
            padding-top: 150px !important;
            padding-bottom: 140px !important;
          }
          .service-hero-section .os-heading {
            color: #ffffff !important;
          }
          .service-hero-section p {
            color: rgba(255, 255, 255, 0.72) !important;
          }
          .service-hero-section .btn-secondary {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
          }
          .service-hero-section .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.16) !important;
            border-color: var(--gold) !important;
            color: var(--gold) !important;
          }
          .service-hero-section .responsive-hero-mockup {
            background: rgba(255, 255, 255, 0.04) !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(24px) !important;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5) !important;
          }
          .service-hero-section .responsive-hero-mockup span {
            background: rgba(255, 255, 255, 0.06) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            color: rgba(255, 255, 255, 0.8) !important;
          }
          .service-hero-glow {
            background: radial-gradient(circle, rgba(201, 168, 106, 0.16) 0%, transparent 70%) !important;
            animation: slowGlow 12s ease-in-out infinite;
          }
          .service-hero-mockup-animate {
            animation: floatMockup 7s ease-in-out infinite;
          }
        }
      `}</style>

      <Navbar />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section
        className="service-hero-section relative"
        style={{ paddingTop: "120px", paddingBottom: "120px", background: "var(--bg)" }}
      >
        {/* Subtle top-left accent */}
        <div
          className="service-hero-glow"
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: 550, height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,106,0.08), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Label */}
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
              <Icons.Sparkles size={14} color="var(--gold)" />
              <span className="os-label">Digital Design & Technology Studio</span>
            </div>
          </FadeUp>

          {/* H1 */}
          <FadeUp delay={0.1}>
            <h1
              className="os-heading os-hero-h1"
              style={{ fontSize: 64, color: "var(--accent)", maxWidth: 880, margin: "0 auto 28px", lineHeight: 1.12 }}
            >
              Professional Digital Design Services —{" "}
              <br />
              <span style={{
                background: "linear-gradient(135deg, var(--gold) 0%, #b8943d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Expert Team
              </span> for Your Business
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p
              style={{
                fontSize: 18,
                color: "var(--text-2)",
                maxWidth: 680,
                lineHeight: 1.8,
                margin: "0 auto 44px",
                fontWeight: 400,
              }}
            >
              We design and build premium digital products — UI/UX systems, websites, mobile
              apps, brand identities and AI-powered automation — engineered to convert and built to scale.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.3}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
              <a href="#contact" className="btn-primary" style={{ padding: "16px 36px" }}>
                Start Your Project
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#services" className="btn-secondary" style={{ padding: "16px 36px" }}>
                View Selected Work
              </a>
            </div>
          </FadeUp>

          {/* Hero visual – abstract dashboard mockup */}
          <FadeUp delay={0.4}>
            <div className="responsive-hero-mockup service-hero-mockup-animate" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
              {/* Mockup bar rows */}
              {[["var(--accent)", "75%"], ["var(--gold)", "60%"], ["#14B87A", "90%"]].map(([color, w], i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "var(--bg)", overflow: "hidden" }}>
                     <div style={{ height: "100%", width: w, background: color, borderRadius: 4 }} />
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "var(--bg)", width: "65%" }} />
                </div>
              ))}
              {/* Badges panel removed per user request */}
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
              ["98%", "Client Satisfaction", "Measured post-launch"],
              ["25+", "Countries Served", "Global client base"],
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
              <span className="os-label" style={{ display: "block", marginBottom: 16 }}>Common Business Challenges</span>
              <h2 className="os-heading" style={{ fontSize: 42, color: "var(--accent)", marginBottom: 24 }}>
                Does your business face these problems?
              </h2>
              <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 36 }}>
                Most businesses lose revenue every day because of poor digital experiences. These
                aren't just design problems — they're business problems.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Outdated website that doesn't convert visitors",
                  "Poor user experience driving customers away",
                  "Weak or inconsistent brand identity",
                  "Manual workflows wasting hours every week",
                  "No mobile app strategy in a mobile-first world",
                  "Competitors look more professional than you",
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
                  <span className="os-label" style={{ color: "var(--gold)", display: "block", marginBottom: 16 }}>Olive Seeds Solution</span>
                  <h3 className="os-heading" style={{ fontSize: 28, color: "#ffffff", marginBottom: 24, lineHeight: 1.2 }}>
                    We transform challenges into competitive advantages
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                      ["Premium UI/UX", "that converts visitors into customers"],
                      ["Scalable Web & Mobile", "built for performance and growth"],
                      ["Strategic Brand Identity", "that commands authority in your market"],
                      ["AI & Automation Systems", "that save 20+ hours per week"],
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

                  <a href="#contact" className="btn-primary" style={{ marginTop: 36, display: "inline-flex", background: "#ffffff", color: "var(--accent)" }}>
                    Discuss Your Project
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
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Our Expertise</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "var(--accent)" }}>
                Premium Digital Services
              </h2>
            </div>
            <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 360, lineHeight: 1.8 }}>
              Each service is a complete product offering — not a
              checklist of deliverables, but a strategic engagement
              with measurable outcomes.
            </p>
          </div>

          {/* Grid */}
          <div className="responsive-grid-3">
            {SERVICES.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="service-card" style={{ height: "100%" }}>
                  {/* Tag */}
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", background: "var(--bg)", border: "1px solid var(--border)", padding: "5px 12px", borderRadius: 8, display: "inline-block", marginBottom: 28 }}>
                    {s.tag}
                  </span>

                  {/* Icon */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: "var(--gold-soft)",
                      border: "1px solid var(--gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                    }}
                  >
                    {(() => {
                      const IconComponent = Icons[s.iconKey];
                      return IconComponent ? <IconComponent color="var(--gold)" size={24} /> : null;
                    })()}
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 12, letterSpacing: "-0.02em" }}>
                    {s.title}
                  </h3>

                  <p style={{ fontSize: 14.5, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 0 }}>
                    {s.desc}
                  </p>
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
                Projects That Drive Results
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
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "block" }}>SaaS Dashboard</span>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>Enterprise Analytics Platform</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>UI/UX Design · Web Development · Design System</p>
                </div>
              </div>
            </FadeUp>

            {/* Two smaller cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { img: "https://images.unsplash.com/photo-1555774698-0b77e0d5fa6a?auto=format&fit=crop&w=600&q=80", accent: "var(--gold)", label: "Mobile App", title: "FinTech iOS & Android App", sub: "App Design · Prototyping · Branding" },
                { img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80", accent: "var(--gold)", label: "Brand Identity", title: "B2B SaaS Rebrand System", sub: "Logo · Typography · Brand Guidelines" },
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
                A structured engagement model refined over 120+ projects.
                No surprises — just results.
              </p>
              <a href="#contact" className="btn-primary" style={{ marginTop: 32, display: "inline-flex" }}>
                Start Your Project
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
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Start Your Project</span>
              <h2 className="os-heading" style={{ fontSize: 40, color: "var(--accent)", marginBottom: 20, fontWeight: 700 }}>
                Let's build something extraordinary
              </h2>
              <p style={{ fontSize: 15.5, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 40 }}>
                Fill out the brief below and a senior strategist will personally
                review your project and respond within 24 hours.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: "⏱", title: "24-hour response", desc: "Every inquiry reviewed personally" },
                  { icon: "🔒", title: "Strict confidentiality", desc: "NDA available on request" },
                  { icon: "💬", title: "Free consultation", desc: "30-minute strategy call included" },
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
                    Thank you for reaching out! Our creative director will review your project details and get in touch within 24 hours.
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
                      <option>UI / UX Design</option>
                      <option>Website Design & Development</option>
                      <option>Mobile App Design</option>
                      <option>Mobile App Development</option>
                      <option>Brand Identity</option>
                      <option>Graphic Design</option>
                      <option>AI Integration</option>
                      <option>Automation / N8N</option>
                      <option>Design System</option>
                      <option>Startup MVP</option>
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
                    {submitting ? "Sending Enquiry..." : "Send Project Enquiry"}
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
              Ready to start?
            </span>
            <h2
              className="os-heading"
              style={{ fontSize: 52, color: "#ffffff", marginBottom: 20, position: "relative", zIndex: 1 }}
            >
              Your next chapter starts here.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.8, position: "relative", zIndex: 1 }}>
              We work with a select number of clients each quarter.
              Secure your spot and let's build something the market has never seen.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <a
                href="#contact"
                className="btn-primary"
                style={{ background: "#ffffff", color: "var(--accent)", fontSize: 15 }}
              >
                Start Your Project
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