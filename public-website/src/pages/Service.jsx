import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api";

const SERVICES = [
  {
    title: "UI / UX Design",
    icon: "◈",
    desc: "Modern user experiences with premium interfaces, wireframes, prototypes, dashboards and mobile-first systems.",
    tag: "Experience Design",
  },
  {
    title: "Web Development",
    icon: "⌘",
    desc: "High-performance websites and scalable web applications built with modern technologies and clean architecture.",
    tag: "Engineering",
  },
  {
    title: "Mobile App Design",
    icon: "◉",
    desc: "Beautiful Android & iOS application experiences designed for performance, usability and conversion.",
    tag: "Mobile",
  },
  {
    title: "Graphic Design",
    icon: "✦",
    desc: "Luxury brand visuals, social media creatives, packaging, print assets and premium marketing materials.",
    tag: "Visual",
  },
  {
    title: "Brand Identity",
    icon: "⬢",
    desc: "Complete branding systems including logo design, typography, color systems and brand strategy.",
    tag: "Branding",
  },
  {
    title: "AI Integration",
    icon: "◎",
    desc: "AI-powered workflows, automation systems, chatbot integration and intelligent business solutions.",
    tag: "Automation",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Discovery",
    desc: "Deep-dive into your business goals, audience needs, and competitive landscape to build a clear foundation.",
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

        * { box-sizing: border-box; }

        .os-heading {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .os-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #0F4C81;
        }

        /* HERO GRID LINES */
        .hero-grid {
          background-image:
            linear-gradient(rgba(15,76,129,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,76,129,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* SERVICE CARD */
        .service-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 36px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0F4C81, #2563EB);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .service-card:hover {
          border-color: #2563EB;
          box-shadow: 0 20px 60px rgba(15,76,129,0.10);
          transform: translateY(-4px);
        }
        .service-card:hover::before {
          opacity: 1;
        }

        /* STAT CARD */
        .stat-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          transition: box-shadow 0.25s;
        }
        .stat-card:hover {
          box-shadow: 0 8px 32px rgba(15,76,129,0.08);
        }

        /* PROCESS STEP */
        .process-step {
          display: flex;
          gap: 24px;
          padding: 28px 0;
          border-bottom: 1px solid #E5E7EB;
          transition: background 0.2s;
        }
        .process-step:last-child { border-bottom: none; }
        .process-step:hover .ps-num { color: #0F4C81; }

        /* PRIMARY BTN */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 32px;
          border-radius: 10px;
          background: #0F4C81;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: #083D66;
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(15,76,129,0.28);
        }

        /* SECONDARY BTN */
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 32px;
          border-radius: 10px;
          background: transparent;
          color: #0E1320;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          border: 1.5px solid #E5E7EB;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-secondary:hover {
          border-color: #0F4C81;
          color: #0F4C81;
          background: rgba(15,76,129,0.04);
        }

        /* FORM INPUT */
        .form-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1.5px solid #E5E7EB;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #0E1320;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input::placeholder { color: #aab4c4; }
        .form-input:focus {
          border-color: #0F4C81;
          box-shadow: 0 0 0 4px rgba(15,76,129,0.08);
        }

        /* SECTION DIVIDER */
        .section-divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #0F4C81, #2563EB);
          border-radius: 2px;
          margin-bottom: 20px;
        }

        /* WHY CARD */
        .why-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 28px;
          transition: all 0.25s;
        }
        .why-card:hover {
          box-shadow: 0 12px 40px rgba(15,76,129,0.09);
          border-color: #2563EB;
        }

        /* TESTIMONIAL */
        .testimonial-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 36px;
        }

        /* DARK CTA */
        .dark-cta {
          background: #0E1320;
          border-radius: 24px;
          padding: 80px 64px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .dark-cta::before {
          content: '';
          position: absolute;
          top: -120px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%);
          pointer-events: none;
        }

        /* TECH BADGE */
        .tech-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #E5E7EB;
          font-size: 13px;
          font-weight: 600;
          color: #0E1320;
          transition: all 0.2s;
        }
        .tech-badge:hover {
          border-color: #0F4C81;
          color: #0F4C81;
          box-shadow: 0 4px 16px rgba(15,76,129,0.09);
        }

        @media (max-width: 768px) {
          .os-hero-h1 { font-size: 38px !important; }
          .dark-cta { padding: 48px 24px !important; }
        }

        /* Responsive Grids & Layouts */
        .responsive-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
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
          gap: 24px;
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
      `}</style>

      <Navbar />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section
        className="hero-grid relative"
        style={{ paddingTop: "96px", paddingBottom: "100px" }}
      >
        {/* Subtle top-left accent */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: 480, height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.07), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#14B87A" }} />
            <span className="os-label">Digital Design & Technology Studio</span>
          </div>

          {/* H1 */}
          <h1
            className="os-heading os-hero-h1"
            style={{ fontSize: 64, color: "#0E1320", maxWidth: 820, marginBottom: 28 }}
          >
            Professional Digital Design Services —{" "}
            <span style={{ color: "#0F4C81" }}>Expert Team</span> for Your Business
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#667085",
              maxWidth: 580,
              lineHeight: 1.75,
              marginBottom: 44,
              fontWeight: 400,
            }}
          >
            We design and build premium digital products — UI/UX systems, websites, mobile
            apps, brand identities and AI-powered automation — engineered to convert and built to scale.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#contact" className="btn-primary">
              Start Your Project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#services" className="btn-secondary">
              View Selected Work
            </a>
          </div>

          {/* Hero visual – abstract dashboard mockup */}
          <div className="responsive-hero-mockup">
            {/* Mockup bar rows */}
            {[["#0F4C81","72%"],["#2563EB","58%"],["#14B87A","89%"]].map(([color, w], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 8, borderRadius: 4, background: "#F7F8FA", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: w, background: color, borderRadius: 4 }} />
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "#F7F8FA", width: "60%" }} />
                <div style={{ height: 8, borderRadius: 4, background: "#F7F8FA", width: "80%" }} />
              </div>
            ))}
            <div style={{ gridColumn: "span 3", display: "flex", gap: 10, marginTop: 8 }}>
              {["UI/UX Design","Web Dev","Brand Identity","AI Integration"].map((t,i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", padding: "5px 12px", borderRadius: 6, background: "#F7F8FA", border: "1px solid #E5E7EB", color: "#667085" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TRUST INDICATORS
      ══════════════════════════════ */}
      <section style={{ background: "#ffffff", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <style>{`
            .trust-indicators-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 0;
            }
            .trust-indicator-item {
              padding: 40px 32px;
              border-right: 1px solid #E5E7EB;
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
                border-bottom: 1px solid #E5E7EB;
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
                border-bottom: 1px solid #E5E7EB;
                padding: 28px 20px;
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
                  style={{ fontSize: 40, color: "#0F4C81", marginBottom: 6 }}
                >
                  {num}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0E1320", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#667085" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PROBLEM / SOLUTION
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#F7F8FA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="responsive-split-2">
            {/* Left */}
            <div>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 16 }}>Common Business Challenges</span>
              <h2 className="os-heading" style={{ fontSize: 42, color: "#0E1320", marginBottom: 24 }}>
                Does your business face these problems?
              </h2>
              <p style={{ fontSize: 16, color: "#667085", lineHeight: 1.8, marginBottom: 36 }}>
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
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.75" strokeLinecap="round"/></svg>
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
                  background: "#0E1320",
                  borderRadius: 24,
                  padding: "44px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="os-label" style={{ color: "#14B87A", display: "block", marginBottom: 16 }}>Olive Seeds Solution</span>
                  <h3 className="os-heading" style={{ fontSize: 28, color: "#ffffff", marginBottom: 24 }}>
                    We transform challenges into competitive advantages
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      ["Premium UI/UX", "that converts visitors into customers"],
                      ["Scalable Web & Mobile", "built for performance and growth"],
                      ["Strategic Brand Identity", "that commands authority in your market"],
                      ["AI & Automation Systems", "that save 20+ hours per week"],
                    ].map(([title, desc], i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(20,184,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#14B87A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{title}</span>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}> — {desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <a href="#contact" className="btn-primary" style={{ marginTop: 32, display: "inline-flex" }}>
                    Discuss Your Project
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        style={{ background: "#ffffff" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
            <div>
              <div className="section-divider" />
              <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Our Expertise</span>
              <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320" }}>
                Premium Digital Services
              </h2>
            </div>
            <p style={{ fontSize: 15, color: "#667085", maxWidth: 340, lineHeight: 1.75 }}>
              Each service is a complete product offering — not a
              checklist of deliverables, but a strategic engagement
              with measurable outcomes.
            </p>
          </div>

          {/* Grid */}
          <div className="responsive-grid-3">
            {SERVICES.map((s, i) => (
              <div key={i} className="service-card">
                {/* Tag */}
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#667085", background: "#F7F8FA", border: "1px solid #E5E7EB", padding: "4px 10px", borderRadius: 6, display: "inline-block", marginBottom: 28 }}>
                  {s.tag}
                </span>

                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "#F0F6FF",
                    border: "1px solid #DBEAFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: "#0F4C81",
                    marginBottom: 22,
                  }}
                >
                  {s.icon}
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1320", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {s.title}
                </h3>

                <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.8, marginBottom: 24 }}>
                  {s.desc}
                </p>

                <button
                  style={{ fontSize: 13, fontWeight: 600, color: "#0F4C81", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                >
                  Learn More
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURED WORK (visual proof)
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#F7F8FA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <div className="section-divider" />
            <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Selected Work</span>
            <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320" }}>
              Projects That Drive Results
            </h2>
          </div>

          <div className="responsive-grid-2">
            {/* Featured large card */}
            <div
              style={{
                background: "#0E1320",
                borderRadius: 20,
                overflow: "hidden",
                padding: "48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                minHeight: 360,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,76,129,0.6), rgba(37,99,235,0.3))", zIndex: 0 }} />
              {/* Abstract mockup lines */}
              <div style={{ position: "absolute", top: 32, left: 32, right: 32, zIndex: 1, opacity: 0.3 }}>
                {[1,0.7,0.5,0.3].map((w,i) => (
                  <div key={i} style={{ height: 6, background: "#fff", borderRadius: 3, marginBottom: 8, width: `${w * 100}%` }} />
                ))}
              </div>
              <div style={{ position: "relative", zIndex: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#14B87A", marginBottom: 10, display: "block" }}>SaaS Dashboard</span>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.03em" }}>Enterprise Analytics Platform</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>UI/UX Design · Web Development · Design System</p>
              </div>
            </div>

            {/* Two smaller cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { bg: "#F0F6FF", accent: "#0F4C81", label: "Mobile App", title: "FinTech iOS & Android App", sub: "App Design · Prototyping · Branding" },
                { bg: "#F0FDF4", accent: "#14B87A", label: "Brand Identity", title: "B2B SaaS Rebrand System", sub: "Logo · Typography · Brand Guidelines" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: item.bg,
                    borderRadius: 20,
                    padding: "36px",
                    border: "1px solid #E5E7EB",
                    flex: 1,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: 20, right: 20, width: 80, height: 80, borderRadius: "50%", background: item.accent, opacity: 0.08 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: item.accent, marginBottom: 10, display: "block" }}>{item.label}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1320", letterSpacing: "-0.02em", marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 12, color: "#667085" }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href="#contact" className="btn-secondary">View Full Portfolio</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          PROCESS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#ffffff" }}>
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
              <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320", marginBottom: 24 }}>
                From Vision To Reality
              </h2>
              <p style={{ fontSize: 15, color: "#667085", lineHeight: 1.8 }}>
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
                <div key={i} className="process-step">
                  <div>
                    <span
                      className="ps-num os-heading"
                      style={{ fontSize: 32, color: "#E5E7EB", display: "block", lineHeight: 1, marginBottom: 0, transition: "color 0.2s" }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <div style={{ paddingLeft: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0E1320", marginBottom: 8, letterSpacing: "-0.02em" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.8 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          WHY CLIENTS CHOOSE US
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#F7F8FA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-divider" style={{ margin: "0 auto 20px" }} />
            <span className="os-label" style={{ display: "block", marginBottom: 14, textAlign: "center" }}>Why Olive Seeds</span>
            <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320" }}>
              What sets us apart
            </h2>
          </div>

          <div className="responsive-grid-3">
            {[
              { icon: "◈", title: "Strategic Thinking", desc: "We don't just execute briefs — we interrogate them. Every design decision is rooted in business strategy and measurable goals." },
              { icon: "⌘", title: "Modern Design Language", desc: "No templates. No recycled patterns. Every project gets a bespoke visual system engineered for your audience." },
              { icon: "⬡", title: "Technical Depth", desc: "Our engineers and designers work in parallel. Clean code, scalable architecture, and pixel-perfect implementation — always." },
              { icon: "◎", title: "AI-Native Capabilities", desc: "We integrate GPT, automation, and intelligent workflows natively into your product — not as an afterthought." },
              { icon: "◉", title: "Business Understanding", desc: "We speak business fluently. KPIs, conversion rates, customer lifetime value — these drive every design choice we make." },
              { icon: "✦", title: "Long-Term Partnership", desc: "We build long relationships, not one-off projects. Ongoing support, iterations, and continuous improvement come standard." },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F0F6FF", border: "1px solid #DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#0F4C81", marginBottom: 20 }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0E1320", marginBottom: 10, letterSpacing: "-0.01em" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#667085", lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          RESULTS / METRICS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-divider" style={{ margin: "0 auto 20px" }} />
            <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Results</span>
            <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320" }}>
              Outcomes that move the needle
            </h2>
          </div>

          <div className="responsive-grid-2">
            {[
              { metric: "+340%", label: "Average conversion rate improvement", color: "#0F4C81", bar: "85%" },
              { metric: "20hrs/wk", label: "Average time saved through automation", color: "#14B87A", bar: "70%" },
              { metric: "+4.8★", label: "Average app store rating post-redesign", color: "#2563EB", bar: "96%" },
              { metric: "3× Faster", label: "Time-to-market vs. in-house teams", color: "#0F4C81", bar: "75%" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#F7F8FA", border: "1px solid #E5E7EB", borderRadius: 16, padding: "32px" }}>
                <div className="os-heading" style={{ fontSize: 40, color: item.color, marginBottom: 8 }}>{item.metric}</div>
                <div style={{ fontSize: 14, color: "#667085", marginBottom: 20 }}>{item.label}</div>
                <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: item.bar, background: item.color, borderRadius: 3, transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TECHNOLOGY
      ══════════════════════════════ */}
      <section style={{ padding: "80px 0", background: "#F7F8FA", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="os-label" style={{ display: "block", marginBottom: 10 }}>Technology Stack</span>
            <h2 className="os-heading" style={{ fontSize: 32, color: "#0E1320" }}>Built with world-class tools</h2>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {["Figma","Framer","React","Next.js","Flutter","WordPress","N8N","OpenAI","Tailwind CSS","TypeScript","Node.js","Supabase"].map((tech, i) => (
              <span key={i} className="tech-badge">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="responsive-padding" style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <div className="section-divider" />
            <span className="os-label" style={{ display: "block", marginBottom: 14 }}>Client Testimonials</span>
            <h2 className="os-heading" style={{ fontSize: 44, color: "#0E1320" }}>What clients say</h2>
          </div>

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
              <div key={i} className="testimonial-card">
                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B"><path d="M7 1l1.5 4h4l-3.3 2.4 1.3 4L7 9 3.5 11.4l1.3-4L1.5 5H5.5z"/></svg>
                  ))}
                </div>

                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, marginBottom: 28, fontStyle: "italic" }}>
                  "{t.quote}"
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0F4C81", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0E1320" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#667085" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CONTACT / INQUIRY FORM
      ══════════════════════════════ */}
      <section id="contact" className="responsive-padding" style={{ background: "#F7F8FA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="responsive-split-1-2">
            {/* Left info */}
            <div>
              <div className="section-divider" style={{ width: 40, height: 3, background: "#0F4C81", marginBottom: 20 }} />
              <span className="os-label" style={{ display: "block", marginBottom: 14, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#0F4C81" }}>Start Your Project</span>
              <h2 className="os-heading" style={{ fontSize: 40, color: "#0E1320", marginBottom: 20, fontWeight: 800 }}>
                Let's build something extraordinary
              </h2>
              <p style={{ fontSize: 15, color: "#667085", lineHeight: 1.8, marginBottom: 40 }}>
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0E1320" }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #E5E7EB",
                borderRadius: 24,
                padding: "48px",
                boxShadow: "0 20px 60px rgba(14,19,32,0.06)",
              }}
            >
              {success ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0E1320", marginBottom: "10px" }}>Enquiry Received</h3>
                  <p style={{ fontSize: "14px", color: "#667085", lineHeight: 1.6 }}>
                    Thank you for reaching out! Our creative director will review your project details and get in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="responsive-form">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Full Name *</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Company *</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Email Address *</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Project Type *</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Budget Range</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Timeline</label>
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.02em" }}>Project Details *</label>
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
                    style={{ gridColumn: "span 2", justifyContent: "center", fontSize: 15, padding: "18px 32px", cursor: "pointer" }}
                  >
                    {submitting ? "Sending Enquiry..." : "Send Project Enquiry"}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </form>
              )}

              <p style={{ fontSize: 12, color: "#aab4c4", textAlign: "center", marginTop: 16 }}>
                By submitting you agree to our Privacy Policy. We never share your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL DARK CTA
      ══════════════════════════════ */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="dark-cta">
            <span className="os-label" style={{ color: "#14B87A", display: "block", marginBottom: 20, textAlign: "center" }}>
              Ready to start?
            </span>
            <h2
              className="os-heading"
              style={{ fontSize: 52, color: "#ffffff", marginBottom: 20, position: "relative", zIndex: 1 }}
            >
              Your next chapter starts here.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.8, position: "relative", zIndex: 1 }}>
              We work with a select number of clients each quarter.
              Secure your spot and let's build something the market has never seen.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <a
                href="#contact"
                className="btn-primary"
                style={{ background: "#ffffff", color: "#0E1320", fontSize: 15 }}
              >
                Start Your Project
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer dark />
    </div>
  );
}