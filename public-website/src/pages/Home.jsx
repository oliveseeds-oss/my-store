import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

/* ─── Fade-up animation wrapper ─── */
const FadeUp = ({ children, delay = 0, className = "", style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);


export default function Home() {
  const [products, setProducts] = useState([]);
  const [digitalProducts, setDigitalProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const heroRef = useRef(null);

  useEffect(() => {
    API.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data.slice(0, 4) : []))
      .catch(() => setProducts([]));

    API.get("/digital-products")
      .then((r) => setDigitalProducts(Array.isArray(r.data) ? r.data.slice(0, 4) : []))
      .catch(() => setDigitalProducts([]));


    API.get("/settings")
      .then((r) => { if (r.data) setSettings(r.data); })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        background: "#F8F8F5",
        color: "#111111",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
      className="min-h-screen"
    >
      {/* ── Fonts & Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

        :root {
          --bg:          #F8F8F5;
          --text:        #111111;
          --text-2:      #5E5E5E;
          --accent:      #0F2744;
          --accent-h:    #142F52;
          --gold:        #C9A86A;
          --gold-soft:   rgba(201,168,106,0.12);
          --gold-border: rgba(201,168,106,0.28);
          --surface:     #FFFFFF;
          --border:      #E8E8E8;
          --radius:      20px;
          --radius-sm:   12px;
          --shadow-sm:   0 2px 12px rgba(15,39,68,0.06);
          --shadow-md:   0 8px 40px rgba(15,39,68,0.10);
          --shadow-lg:   0 24px 80px rgba(15,39,68,0.14);
        }

        * { box-sizing: border-box; }

        .clash { font-family: 'Clash Display', 'Inter', sans-serif; }

        /* Nav glassmorphism on scroll — handled by Navbar component */

        /* Button styles */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 15px 32px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .btn-primary:hover {
          background: var(--accent-h);
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(15,39,68,0.22);
        }

        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--gold);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 15px 32px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .btn-gold:hover {
          background: #b8943d;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(201,168,106,0.35);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 14px 30px;
          border-radius: 100px;
          border: 1.5px solid var(--border);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.2s ease;
        }
        .btn-outline:hover {
          border-color: var(--accent);
          background: rgba(15,39,68,0.04);
          transform: translateY(-2px);
        }

        /* Card hover */
        .card-lift {
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
        }
        .card-lift:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }

        /* Section label */
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .eyebrow::before {
          content: '';
          display: block;
          width: 28px;
          height: 1.5px;
          background: var(--gold);
          border-radius: 2px;
        }

        /* Stat number */
        .stat-num {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: var(--accent);
          line-height: 1;
        }

        /* Divider gradient */
        .divider-h {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent);
        }

        /* Marquee */
        @keyframes marquee-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 56px;
          animation: marquee-ltr 22s linear infinite;
          width: max-content;
        }

        /* Floating badge animation */
        @keyframes float-a {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(10px); }
        }
        .float-a { animation: float-a 5s ease-in-out infinite; }
        .float-b { animation: float-b 6s ease-in-out infinite 1s; }

        /* Glass card */
        .glass {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.85);
        }

        /* Product card overlay gradient */
        .img-fade::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(15,39,68,0.18) 100%);
          pointer-events: none;
        }

        /* Noise overlay */
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          border-radius: inherit;
        }

        /* Service icon glow */
        .icon-ring {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: var(--gold-soft);
          border: 1px solid var(--gold-border);
          flex-shrink: 0;
        }

        /* Three divisions hover glow */
        .division-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 44px 36px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .division-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,168,106,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .division-card:hover {
          border-color: var(--gold-border);
          box-shadow: 0 20px 60px rgba(15,39,68,0.1), 0 0 0 1px rgba(201,168,106,0.15);
          transform: translateY(-6px);
        }
        .division-card:hover::before { opacity: 1; }

        /* CTA dark section */
        .cta-section {
          background: var(--accent);
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 80% at 50% 110%, rgba(201,168,106,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Testimonial quote mark */
        .quote-mark {
          font-family: 'Clash Display', Georgia, serif;
          font-size: 80px;
          line-height: 0.6;
          color: var(--gold);
          opacity: 0.25;
          display: block;
          margin-bottom: -8px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; gap: 48px !important; }
          .stats-row   { grid-template-columns: repeat(2, 1fr) !important; }
          .three-cols  { grid-template-columns: 1fr !important; }
          .two-cols    { grid-template-columns: 1fr !important; }
          .four-cols   { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .four-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <SEO
        title="Olive Seeds Design Studio — Engraved Products, Digital Templates & Design Services"
        description="Olive Seeds Design Studio offers custom laser-engraved products, instant-download digital templates, and professional design services. Worldwide shipping available. Shop or hire us today."
        keywords="custom engraved products online, digital design templates instant download, professional design services, laser engraved gifts worldwide shipping, Figma templates for designers, UI UX design service"
      />

      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          paddingTop: "130px",
          paddingBottom: "100px",
          position: "relative",
          background: "#F8F8F5",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position: "absolute", top: "8%", right: "-6%",
          width: "680px", height: "680px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,106,0.09) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", left: "-8%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(15,39,68,0.055) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", width: "100%", position: "relative", zIndex: 1 }}>
          <div
            className="hero-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 460px", gap: "80px", alignItems: "center" }}
          >
            {/* LEFT — copy */}
            <div>
              {/* Eyebrow pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: "32px" }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "rgba(15,39,68,0.07)",
                  border: "1px solid rgba(15,39,68,0.12)",
                  borderRadius: "100px",
                  padding: "8px 18px",
                  fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--accent)",
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "var(--gold)", display: "inline-block", flexShrink: 0,
                  }} />
                  Olive Seeds Premium Crafted & Digital Design Studio
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                className="clash"
                initial={{ opacity: 0, y: 56 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(3rem, 5.5vw, 6rem)",
                  fontWeight: 700,
                  lineHeight: 1.0,
                  color: "var(--accent)",
                  letterSpacing: "-0.02em",
                  marginBottom: "0",
                }}
              >
                Premium Engraved
                <br />
                <span style={{
                  background: "linear-gradient(135deg, var(--gold) 0%, #a87c3a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Products,
                </span>
                {" "}Digital
                <br />
                Templates &amp; Design
                <br />
                Services <span style={{ fontWeight: 400, color: "var(--text-2)", fontSize: "75%" }}>— Worldwide</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.38 }}
                style={{
                  color: "var(--text-2)",
                  fontSize: "17px",
                  lineHeight: 1.75,
                  maxWidth: "520px",
                  margin: "28px 0 44px",
                  fontWeight: 400,
                }}
              >
                Bespoke laser-engraved gifts, personalized wooden frames &amp; acrylic keepsakes — 
                paired with premium Notion workspaces, Figma systems, and React web engineering, 
                all crafted from our design studio.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.52 }}
                style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "72px" }}
              >
                <Link to="/products" className="btn-primary">
                  Shop Gifts
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link to="/digital" className="btn-outline">
                  Explore Digital Studio
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.68 }}
              >
                <div
                  className="stats-row"
                  style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0",
                    paddingTop: "32px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {[
                    ["500+", "Crafts Delivered"],
                    ["120+", "Digital Packs"],
                    ["15+", "Countries"],
                    ["99%", "Happy Clients"],
                  ].map(([num, label], i) => (
                    <div
                      key={label}
                      style={{
                        paddingRight: "24px",
                        borderRight: i < 3 ? "1px solid var(--border)" : "none",
                        paddingLeft: i > 0 ? "24px" : "0",
                      }}
                    >
                      <div className="stat-num">{num}</div>
                      <div style={{
                        fontSize: "11px", fontWeight: 500, color: "var(--text-2)",
                        letterSpacing: "0.06em", marginTop: "6px",
                      }}>{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT — ad panel + floating badges */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative" }}
            >
              {/* Decorative corner accent */}
              <div style={{
                position: "absolute", top: "-18px", left: "-18px",
                width: "56px", height: "56px",
                borderTop: "2px solid var(--gold)", borderLeft: "2px solid var(--gold)",
                borderRadius: "4px", opacity: 0.5, pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: "-18px", right: "-18px",
                width: "56px", height: "56px",
                borderBottom: "2px solid var(--gold)", borderRight: "2px solid var(--gold)",
                borderRadius: "4px", opacity: 0.5, pointerEvents: "none",
              }} />

              {/* Main ad banner card */}
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                height: "480px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "var(--shadow-lg)",
              }}>
                <AdBanner placement="Large Panel" />
              </div>

              {/* Floating badge — Physical */}
              <div
                className="float-a glass"
                style={{
                  position: "absolute", top: "32px", left: "-48px",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "12px",
                  minWidth: "170px",
                  boxShadow: "0 8px 32px rgba(15,39,68,0.12)",
                  zIndex: 10,
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "var(--gold-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                  border: "1px solid var(--gold-border)",
                }}>🪵</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>Premium Crafted</div>
                  <div style={{ fontSize: "10px", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>Laser Engraved</div>
                </div>
              </div>

              {/* Floating badge — Digital */}
              <div
                className="float-b glass"
                style={{
                  position: "absolute", bottom: "40px", right: "-40px",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "12px",
                  minWidth: "170px",
                  boxShadow: "0 8px 32px rgba(15,39,68,0.12)",
                  zIndex: 10,
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "var(--gold-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                  border: "1px solid var(--gold-border)",
                }}>⚡</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>Digital Assets</div>
                  <div style={{ fontSize: "10px", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>Web · App · AI</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE TRUST STRIP
      ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        padding: "18px 0",
      }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap(() =>
            ["Etsy Shop", "✦", "Amazon Handmade", "✦", "Gumroad Premium", "✦", "React Engineering", "✦", "Next.js Systems", "✦", "Figma Assets", "✦", "Olive Seeds Studio", "✦"].map((item, i) => (
              <span key={`${item}-${i}`} style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: item === "✦" ? "var(--gold)" : "var(--text-2)",
                whiteSpace: "nowrap",
              }}>{item}</span>
            ))
          )}
        </div>
      </div>


      {/* ══════════════════════════════════════════════
          THREE CORE DIVISIONS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "60px 0 100px", background: "var(--surface)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "96px" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>What We Offer</span>
            <h2 className="clash" style={{
              fontSize: "clamp(2.2rem, 4vw, 4rem)",
              fontWeight: 700,
              color: "var(--accent)",
              marginTop: "18px",
              letterSpacing: "-0.02em",
              lineHeight: 1.08,
            }}>
              Three worlds of design,<br />
              <span style={{
                background: "linear-gradient(135deg, var(--gold) 0%, #a87c3a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>One premium studio.</span>
            </h2>
            <p style={{
              color: "var(--text-2)", maxWidth: "500px", margin: "20px auto 0",
              fontSize: "16px", lineHeight: 1.7,
            }}>
              At the intersection of tactile engraving art and modern digital design — Olive Seeds brings every discipline under one roof.
            </p>
          </FadeUp>

          <div
            className="three-cols"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
          >
            {/* Physical Products */}
            <FadeUp delay={0.08}>
              <div className="division-card" style={{ height: "100%" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", marginBottom: "28px",
                }}>🪵</div>
                <h3 className="clash" style={{
                  fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)",
                  letterSpacing: "-0.01em", marginBottom: "14px",
                }}>Physical Products</h3>
                <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.75, marginBottom: "28px" }}>
                  Precision laser-engraved arts, frames, acrylic keepsakes, custom nameplates &amp; corporate gifts — more products in our design studio.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "36px" }}>
                  {["Custom Engraved Premium Art", "Acrylic Keepsake Products", "Personalized Nameplates", "Corporate Gift & More"].map((li) => (
                    <li key={li} style={{
                      fontSize: "13px", color: "var(--text-2)",
                      padding: "9px 0", borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: "10px",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--gold)", flexShrink: 0, display: "inline-block",
                      }} />
                      {li}
                    </li>
                  ))}
                </ul>
                <Link to="/products" className="btn-primary" style={{ fontSize: "12px", padding: "12px 24px" }}>
                  Shop Physical Crafts →
                </Link>
              </div>
            </FadeUp>

            {/* Digital Products */}
            <FadeUp delay={0.16}>
              <div className="division-card" style={{ height: "100%", borderColor: "var(--gold-border)" }}>
                {/* Featured pill */}
                <div style={{
                  position: "absolute", top: "20px", right: "20px",
                  background: "var(--gold)", color: "#fff",
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", padding: "5px 12px", borderRadius: "100px",
                }}>Most Popular</div>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", marginBottom: "28px",
                }}>⚡</div>
                <h3 className="clash" style={{
                  fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)",
                  letterSpacing: "-0.01em", marginBottom: "14px",
                }}>Digital Products</h3>
                <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.75, marginBottom: "28px" }}>
                  Instant-download Notion workspaces, Figma UI kits, website templates, 3D assets, AI workflows &amp; N8N agents.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "36px" }}>
                  {["Figma & Website Templates", "Notion Dashboards", "3D Assets & Printables", "AI Workflows & N8N Agents"].map((li) => (
                    <li key={li} style={{
                      fontSize: "13px", color: "var(--text-2)",
                      padding: "9px 0", borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: "10px",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--gold)", flexShrink: 0, display: "inline-block",
                      }} />
                      {li}
                    </li>
                  ))}
                </ul>
                <Link to="/digital" className="btn-gold" style={{ fontSize: "12px", padding: "12px 24px" }}>
                  Explore Digital Assets →
                </Link>
              </div>
            </FadeUp>

            {/* Design Services */}
            <FadeUp delay={0.24}>
              <div className="division-card" style={{ height: "100%" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", marginBottom: "28px",
                }}>🎨</div>
                <h3 className="clash" style={{
                  fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)",
                  letterSpacing: "-0.01em", marginBottom: "14px",
                }}>Design Services</h3>
                <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.75, marginBottom: "28px" }}>
                  UI/UX Design, Web Development, Mobile Apps, Branding, Graphic Design, AI Integration &amp; Automation Systems.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "36px" }}>
                  {["UI/UX & Web Development", "Mobile App Design", "Branding & Identity", "AI Integration & Automation"].map((li) => (
                    <li key={li} style={{
                      fontSize: "13px", color: "var(--text-2)",
                      padding: "9px 0", borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: "10px",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--gold)", flexShrink: 0, display: "inline-block",
                      }} />
                      {li}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="btn-outline" style={{ fontSize: "12px", padding: "12px 24px" }}>
                  Request a Quote →
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AD BANNER (Horizontal)
      ══════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 80px" }}>
        <AdBanner placement="Horizontal Banner" />
      </section>

      {/* ══════════════════════════════════════════════
          STUDIO STORY / ABOUT
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#F4F4F1" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <div
            className="two-cols"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}
          >
            {/* Image column */}
            <FadeUp>
              <div style={{ position: "relative" }}>
                {/* Offset shadow frame */}
                <div style={{
                  position: "absolute", top: "20px", left: "20px", right: "-20px", bottom: "-20px",
                  border: "1px solid var(--gold-border)", borderRadius: "var(--radius)",
                  pointerEvents: "none", zIndex: 0,
                }} />
                <img
                  src="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=900&auto=format&fit=crop"
                  alt="Artisan laser engraving wood craftsmanship design studio"
                  style={{
                    width: "100%", height: "520px", objectFit: "cover",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    display: "block", position: "relative", zIndex: 1,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                {/* Pill badge */}
                <div style={{
                  position: "absolute", bottom: "-18px", left: "32px", zIndex: 2,
                  background: "var(--accent)",
                  color: "#fff",
                  padding: "14px 24px",
                  borderRadius: "100px",
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  boxShadow: "0 8px 28px rgba(15,39,68,0.28)",
                }}>
                  Est. Olive Seeds Studio
                </div>
              </div>
            </FadeUp>

            {/* Text column */}
            <FadeUp delay={0.12}>
              <span className="eyebrow">Our Studio Legacy</span>
              <h2 className="clash" style={{
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                fontWeight: 700,
                color: "var(--accent)",
                marginTop: "20px",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: "20px",
              }}>
                Designing permanence,<br />engineering digital presence.
              </h2>
              <p style={{
                color: "var(--text-2)", fontSize: "16px", lineHeight: 1.75,
                marginBottom: "44px",
              }}>
                Olive Seeds Design Studio operates at the intersection of art and modern digital design. We build beautiful, lasting physical products alongside high-performance web systems and visual digital assets.
              </p>

              <div
                className="four-cols"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
              >
                {[
                  ["🔥", "Premium Products", "Finest woods, acrylics & precision laser calibration"],
                  ["🎨", "Modern UI/UX", "High-performance React & sleek Figma design systems"],
                  ["📦", "Worldwide Dispatch", "Tracked shipping & instant digital downloads"],
                  ["✍️", "Bespoke Orders", "Personalized names, logos & custom corporate styles"],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "20px",
                  }}>
                    <div style={{ fontSize: "22px", marginBottom: "10px" }}>{icon}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)", marginBottom: "6px" }}>{title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PHYSICAL PRODUCTS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#F8F8F5" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            marginBottom: "64px", flexWrap: "wrap", gap: "24px",
          }}>
            <FadeUp>
              <span className="eyebrow">Workshop Showcase</span>
              <h2 className="clash" style={{
                fontSize: "clamp(2rem, 4vw, 3.6rem)",
                fontWeight: 700, color: "var(--accent)",
                marginTop: "14px", letterSpacing: "-0.02em", lineHeight: 1.08,
              }}>Physical Masterpieces</h2>
            </FadeUp>
            <Link to="/products" style={{
              fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--gold)",
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: "6px",
              borderBottom: "1px solid var(--gold-border)",
              paddingBottom: "4px",
            }}>
              Full Workshop Catalog →
            </Link>
          </div>

          {/* Featured banner */}
          <FadeUp>
            <div style={{
              position: "relative", borderRadius: "var(--radius)",
              overflow: "hidden", marginBottom: "48px",
              border: "1px solid var(--border)", height: "460px",
              boxShadow: "var(--shadow-md)",
            }}>
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1400&auto=format&fit=crop"
                alt="Custom laser wood engraving high end personalized gifts"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(105deg, rgba(15,39,68,0.88) 0%, rgba(15,39,68,0.5) 55%, transparent 100%)",
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "64px",
                transform: "translateY(-50%)", maxWidth: "520px",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  background: "rgba(201,168,106,0.18)", border: "1px solid rgba(201,168,106,0.35)",
                  borderRadius: "100px", padding: "7px 16px",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px",
                }}>🔨 Signature Craft</span>
                <h3 className="clash" style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                  fontWeight: 700, color: "#fff",
                  lineHeight: 1.08, letterSpacing: "-0.01em", marginBottom: "16px",
                }}>
                  Permanent beauty.<br />
                  <span style={{
                    background: "linear-gradient(135deg, var(--gold) 0%, #e0b96a 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>Precisely calibrated.</span>
                </h3>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
                  Cherry wood boards, clean acrylic tags, personalized frames and corporate items etched with precision lasers.
                </p>
                <Link to="/products" className="btn-gold">Customize Your Craft →</Link>
              </div>
            </div>
          </FadeUp>

          {/* Products grid */}
          {products.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
              {products.map((p, i) => (
                <FadeUp key={p.id} delay={i * 0.08}>
                  <Link
                    to={`/products/${p.id}`}
                    className="card-lift"
                    style={{
                      display: "block",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      overflow: "hidden",
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ height: "260px", overflow: "hidden", position: "relative" }} className="img-fade">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", background: "#F4F4F1" }}>🪵</div>
                      )}
                      <span style={{
                        position: "absolute", top: "14px", left: "14px", zIndex: 2,
                        background: "rgba(255,255,255,0.92)", color: "var(--accent)",
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                        padding: "5px 11px", borderRadius: "100px",
                        backdropFilter: "blur(8px)",
                      }}>Premium Craft</span>
                    </div>
                    <div style={{ padding: "22px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" }}>
                        {p.category}
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent)", marginBottom: "18px" }}>{p.name}</div>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        paddingTop: "14px", borderTop: "1px solid var(--border)",
                      }}>
                        <span className="clash" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>₹{p.price}</span>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: "14px",
                        }}>→</div>
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          ) : (
            <div style={{
              border: "1px dashed var(--border)", borderRadius: "var(--radius)",
              padding: "64px", textAlign: "center",
              color: "var(--text-2)", fontSize: "12px",
              fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              No products found — add items to your workshop.
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DIGITAL PRODUCTS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "var(--accent)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "64px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--gold)",
            }}>
              <span style={{ display: "block", width: "28px", height: "1.5px", background: "var(--gold)", borderRadius: "2px" }} />
              Blueprint Assets Shop
            </span>
            <h2 className="clash" style={{
              fontSize: "clamp(2rem, 4vw, 3.6rem)",
              fontWeight: 700, color: "#fff",
              marginTop: "18px", letterSpacing: "-0.02em", lineHeight: 1.08,
            }}>Premium Digital Studio</h2>
            <p style={{
              color: "rgba(255,255,255,0.62)", maxWidth: "480px",
              margin: "16px auto 0", fontSize: "15px", lineHeight: 1.7,
            }}>
              Instant-download Notion workspaces, Figma UI kits, and clean React code templates built with modern design systems.
            </p>
          </FadeUp>

          {digitalProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
              {digitalProducts.map((p, i) => (
                <FadeUp key={p.id} delay={i * 0.08}>
                  <Link
                    to={`/digital/${p.id}`}
                    className="card-lift"
                    style={{
                      display: "block",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "var(--radius)",
                      overflow: "hidden",
                      textDecoration: "none",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div style={{ height: "260px", overflow: "hidden", position: "relative" }}>
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", background: "rgba(255,255,255,0.04)" }}>📦</div>
                      )}
                      <span style={{
                        position: "absolute", top: "14px", left: "14px", zIndex: 2,
                        background: "var(--gold)", color: "#fff",
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                        padding: "5px 11px", borderRadius: "100px",
                      }}>⚡ Digital File</span>
                    </div>
                    <div style={{ padding: "22px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px" }}>
                        {p.category}
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "18px" }}>{p.name}</div>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)",
                      }}>
                        <span className="clash" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold)" }}>₹{p.price}</span>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--gold)", fontSize: "14px",
                        }}>→</div>
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          ) : (
            <div style={{
              border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "var(--radius)",
              padding: "64px", textAlign: "center",
              color: "rgba(255,255,255,0.4)", fontSize: "12px",
              fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              No digital products found — seed templates to verify.
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CHOOSE OLIVE SEEDS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#F8F8F5" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "72px" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Why Choose Us</span>
            <h2 className="clash" style={{
              fontSize: "clamp(2rem, 4vw, 3.6rem)",
              fontWeight: 700, color: "var(--accent)",
              marginTop: "18px", letterSpacing: "-0.02em", lineHeight: 1.08,
            }}>
              Built for businesses.<br />
              <span style={{
                background: "linear-gradient(135deg, var(--gold) 0%, #a87c3a 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Loved by everyone.</span>
            </h2>
          </FadeUp>

          <div
            className="three-cols"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
          >
            {[
              { icon: "🌍", title: "Worldwide Delivery", desc: "Fully tracked international shipping to 15+ countries with reliable logistics partners." },
              { icon: "✨", title: "Premium Products", desc: "Every physical product is perfectly-finished with precision laser equipment and quality materials." },
              { icon: "⚡", title: "Instant Downloads", desc: "Digital products delivered instantly. No waiting, no hassle — ready to use immediately." },
              { icon: "💼", title: "Business-Focused", desc: "Tailored solutions for startups, corporates, and entrepreneurs who demand excellence." },
              { icon: "🛡️", title: "Secure Payments", desc: "End-to-end encrypted, PCI-compliant payment processing for complete peace of mind." },
              { icon: "🤝", title: "Dedicated Support", desc: "Responsive, expert support for every order — physical or digital, before and after purchase." },
            ].map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.07}>
                <div style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "32px 28px",
                  transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
                  cursor: "default",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--gold-border)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    width: "50px", height: "50px", borderRadius: "14px",
                    background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", marginBottom: "20px",
                  }}>{s.icon}</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent)", marginBottom: "10px" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 0", background: "var(--surface)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "60px" }} className="lg-grid-cols-3">
            <style>{`
              @media(min-width: 1024px) {
                .lg-grid-cols-3 { grid-template-columns: 380px 1fr !important; display: grid !important; }
                .lg-sticky { position: sticky !important; top: 100px; }
              }
              .capability-item {
                position: relative;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                background: #FAF9F6;
              }
              .capability-item:hover {
                transform: translateX(12px);
                background: #F4F4F1;
                border-color: var(--gold-border) !important;
              }
              @media(max-width: 768px) {
                .capability-item:hover {
                  transform: translateY(-4px);
                }
              }
            `}</style>
            
            {/* Left Column (Sticky Intro) */}
            <div className="lg-sticky self-start flex flex-col gap-6">
              <FadeUp>
                <span className="eyebrow" style={{ display: "inline-flex" }}>Distinct Identity</span>
                <h2 className="clash" style={{
                  fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                  fontWeight: 700, color: "var(--accent)",
                  marginTop: "18px", letterSpacing: "-0.02em", lineHeight: 1.1,
                  marginBottom: "20px"
                }}>
                  The Feeling of<br />
                  <span style={{
                    background: "linear-gradient(135deg, var(--gold) 0%, #a87c3a 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>Rare Identity</span>
                </h2>
                <p style={{
                  color: "var(--text-2)", fontSize: "15px", lineHeight: 1.7,
                  marginBottom: "36px"
                }}>
                  We believe that the designs you choose should speak to who you are. Olive Seeds is created to make you feel unique, feel special, and express a rare personality that stands out from the rest.
                </p>
                <Link to="/products" className="btn-primary" style={{ display: "inline-flex" }}>
                  Explore Premium Design
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "8px" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </FadeUp>
            </div>

            {/* Right Column (Interactive List) */}
            <div className="flex flex-col gap-6">
              {[
                { number: "01", icon: "🎨", title: "Bespoke Art & Code", desc: "Tailored to your requirements. We design physical gifts and engineer modern web systems matching your exact specification." },
                { number: "02", icon: "✨", title: "Impeccable Quality", desc: "Crafted with premium materials and high precision tools. We check every detail to ensure it meets our rigorous standards." },
                { number: "03", icon: "📦", title: "Seamless Experience", desc: "From instant digital downloads to securely packaged tracked worldwide shipping, we guarantee a hassle-free journey." },
                { number: "04", icon: "🔥", title: "Uncompromising Uniqueness", desc: "Stand out with confidence. Our custom layouts, high-end materials, and bespoke systems ensure you leave a lasting impression of quality and authenticity." },
              ].map((c, i) => (
                <FadeUp key={c.number} delay={i * 0.08}>
                  <div
                    className="capability-item"
                    style={{
                      display: "flex",
                      gap: "24px",
                      padding: "32px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{
                      fontSize: "14px", fontWeight: 700, color: "var(--gold)",
                      fontFamily: "monospace", marginTop: "4px"
                    }}>{c.number}</div>
                    <div style={{ fontSize: "24px", marginTop: "2px" }}>{c.icon}</div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--accent)", marginBottom: "10px" }}>{c.title}</h3>
                      <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.65 }}>{c.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

          </div>
        </div>
      </section>

      <section style={{
        padding: "100px 0", background: "#0D1512",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Client Stories</span>
            <h2 className="clash" style={{
              fontSize: "clamp(2rem, 4vw, 3.6rem)",
              fontWeight: 700, color: "#fff",
              marginTop: "18px", letterSpacing: "-0.02em",
            }}>Loved Globally</h2>
          </FadeUp>
        </div>

        {/* Infinite Auto-Running Marquee */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <style>{`
            @keyframes marquee-stories {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .stories-track {
              display: flex;
              width: overflow-x;
              overflow-x: visible;
              scrollbar-width: none;
            }
            .stories-track::-webkit-scrollbar {
              display: none;
            }
            .marquee-container-loop {
              display: flex;
              width: max-content;
              animation: marquee-stories 50s linear infinite;
            }
            .marquee-container-loop:hover {
              animation-play-state: paused;
            }
            .story-card {
              width: 380px;
              flex-shrink: 0;
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: var(--radius);
              padding: 36px 32px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
              transition: all 0.3s ease;
              color: #fff;
              margin-right: 24px;
            }
            .story-card:hover {
              transform: translateY(-6px);
              background: rgba(255, 255, 255, 0.07);
              border-color: var(--gold);
              box-shadow: 0 12px 40px rgba(201, 168, 106, 0.15);
            }
            @media (max-width: 640px) {
              .story-card {
                width: 300px;
                padding: 28px 24px;
                margin-right: 16px;
              }
            }
          `}</style>
          
          <div className="stories-track">
            <div className="marquee-container-loop">
              {[
                { name: "Rohan Sharma", role: "Wedding Client", text: "We ordered the customized teak wood wedding block. When my wife ran her fingers over our engraved wedding date and initials, she got teary-eyed. It looks so rare and sits perfectly on our living room mantel." },
                { name: "Jessica Miller", role: "Corporate Gifting Manager", text: "For our annual executive retreat, we wanted something premium and distinct. Olive Seeds created 45 laser-engraved cedar trays. The finish, the cedar smell, the alignment—everything screamed luxury. Our team was blown away." },
                { name: "Nikhil Varma", role: "Designer & Creator", text: "As a designer, I am extremely picky about digital organization. The minimal Notion dashboard from OSS feels completely special. The layout is clean and lets me focus without visual clutter." },
                { name: "Elena Rostova", role: "Boutique Hotel Owner", text: "Our custom acrylic door signs and nameplates look incredibly premium. Our guests notice the crisp edges and deep engraving. It makes our boutique hotel feel different and unique." },
                { name: "Karan Johar", role: "Art Collector", text: "The custom laser wood carvings of our family portrait exceeded expectations. You can feel the depth of the cuts. It has a rare personality that mass-produced gifts just cannot replicate." },
                { name: "Sarah Jenkins", role: "Freelance Architect", text: "The custom design systems and templates from Olive Seeds feel special. They saved me weeks of branding setup, and my clients remarked on how unique the layout felt." },
                { name: "Rajesh Nair", role: "Tech Executive", text: "We ordered personalized wood frames for our anniversary. The presentation, the quality of teak, and the crisp engraving was top-notch. It makes you feel rare to own such art." },
                { name: "Emily Chen", role: "E-commerce Founder", text: "The multi-channel shop integrations and Notion database templates are incredibly solid. It's rare to find digital assets that compile so cleanly and work so well." },
                { name: "Vikram Rathore", role: "Luxury Brand Consultant", text: "I recommend Olive Seeds to clients who need high-end corporate identity items. The laser engraving on crystal glass is exceptionally sharp, projecting unmatched premium quality." },
                { name: "Aisha Rahman", role: "Lifestyle Creator", text: "The Notion tracker layout has a gorgeous, non-intrusive flow. It's transformed how I plan my content. Finally, a workspace that feels special and calm." },
                { name: "Liam Gallagher", role: "Creative Director", text: "Our team uses their Figma wireframe kits. They feel different, clean, and polished. Highly recommended for any studio looking for premium digital tools." },
                { name: "Meera Krishnan", role: "Bespoke Gift Buyer", text: "I wanted a unique design for my father's retirement. The engraved bamboo plaque was beautiful. The details and borders are balanced flawlessly. He felt so special when he received it." },
              ].map((t, index) => (
                <div key={`${t.name}-loop-1-${index}`} className="story-card">
                  <div>
                    <span className="quote-mark" style={{ color: "var(--gold)", opacity: 0.35 }}>"</span>
                    <div style={{ display: "flex", gap: "3px", marginBottom: "16px", marginTop: "8px" }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic" }}>
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "28px", paddingTop: "22px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--gold)", fontSize: "13px", fontWeight: 700,
                      letterSpacing: "0.02em", flexShrink: 0,
                    }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
              {[
                { name: "Rohan Sharma", role: "Wedding Client", text: "We ordered the customized teak wood wedding block. When my wife ran her fingers over our engraved wedding date and initials, she got teary-eyed. It looks so rare and sits perfectly on our living room mantel." },
                { name: "Jessica Miller", role: "Corporate Gifting Manager", text: "For our annual executive retreat, we wanted something premium and distinct. Olive Seeds created 45 laser-engraved cedar trays. The finish, the cedar smell, the alignment—everything screamed luxury. Our team was blown away." },
                { name: "Nikhil Varma", role: "Designer & Creator", text: "As a designer, I am extremely picky about digital organization. The minimal Notion dashboard from OSS feels completely special. The layout is clean and lets me focus without visual clutter." },
                { name: "Elena Rostova", role: "Boutique Hotel Owner", text: "Our custom acrylic door signs and nameplates look incredibly premium. Our guests notice the crisp edges and deep engraving. It makes our boutique hotel feel different and unique." },
                { name: "Karan Johar", role: "Art Collector", text: "The custom laser wood carvings of our family portrait exceeded expectations. You can feel the depth of the cuts. It has a rare personality that mass-produced gifts just cannot replicate." },
                { name: "Sarah Jenkins", role: "Freelance Architect", text: "The custom design systems and templates from Olive Seeds feel special. They saved me weeks of branding setup, and my clients remarked on how unique the layout felt." },
                { name: "Rajesh Nair", role: "Tech Executive", text: "We ordered personalized wood frames for our anniversary. The presentation, the quality of teak, and the crisp engraving was top-notch. It makes you feel rare to own such art." },
                { name: "Emily Chen", role: "E-commerce Founder", text: "The multi-channel shop integrations and Notion database templates are incredibly solid. It's rare to find digital assets that compile so cleanly and work so well." },
                { name: "Vikram Rathore", role: "Luxury Brand Consultant", text: "I recommend Olive Seeds to clients who need high-end corporate identity items. The laser engraving on crystal glass is exceptionally sharp, projecting unmatched premium quality." },
                { name: "Aisha Rahman", role: "Lifestyle Creator", text: "The Notion tracker layout has a gorgeous, non-intrusive flow. It's transformed how I plan my content. Finally, a workspace that feels special and calm." },
                { name: "Liam Gallagher", role: "Creative Director", text: "Our team uses their Figma wireframe kits. They feel different, clean, and polished. Highly recommended for any studio looking for premium digital tools." },
                { name: "Meera Krishnan", role: "Bespoke Gift Buyer", text: "I wanted a unique design for my father's retirement. The engraved bamboo plaque was beautiful. The details and borders are balanced flawlessly. He felt so special when he received it." },
              ].map((t, index) => (
                <div key={`${t.name}-loop-2-${index}`} className="story-card">
                  <div>
                    <span className="quote-mark" style={{ color: "var(--gold)", opacity: 0.35 }}>"</span>
                    <div style={{ display: "flex", gap: "3px", marginBottom: "16px", marginTop: "8px" }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic" }}>
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "28px", paddingTop: "22px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--gold)", fontSize: "13px", fontWeight: 700,
                      letterSpacing: "0.02em", flexShrink: 0,
                    }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "2px" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="cta-section" style={{ padding: "140px 0" }}>
        {/* Top decorative corners */}
        <div style={{ position: "absolute", top: "36px", left: "36px", width: "52px", height: "52px", borderTop: "1px solid rgba(201,168,106,0.25)", borderLeft: "1px solid rgba(201,168,106,0.25)" }} />
        <div style={{ position: "absolute", top: "36px", right: "36px", width: "52px", height: "52px", borderTop: "1px solid rgba(201,168,106,0.25)", borderRight: "1px solid rgba(201,168,106,0.25)" }} />
        <div style={{ position: "absolute", bottom: "36px", left: "36px", width: "52px", height: "52px", borderBottom: "1px solid rgba(201,168,106,0.25)", borderLeft: "1px solid rgba(201,168,106,0.25)" }} />
        <div style={{ position: "absolute", bottom: "36px", right: "36px", width: "52px", height: "52px", borderBottom: "1px solid rgba(201,168,106,0.25)", borderRight: "1px solid rgba(201,168,106,0.25)" }} />

        <FadeUp>
          <div style={{
            maxWidth: "760px", margin: "0 auto", padding: "0 32px",
            textAlign: "center", position: "relative", zIndex: 1,
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(201,168,106,0.15)", border: "1px solid rgba(201,168,106,0.3)",
              borderRadius: "100px", padding: "8px 18px",
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "var(--gold)", marginBottom: "32px",
            }}>
              Start a Project
            </span>
            <h2 className="clash" style={{
              fontSize: "clamp(2.2rem, 5vw, 4.8rem)",
              fontWeight: 700, color: "#fff",
              lineHeight: 1.04, letterSpacing: "-0.02em", marginBottom: "22px",
            }}>
              Let's build something<br />
              <span style={{
                background: "linear-gradient(135deg, var(--gold) 0%, #e0c882 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>permanent together.</span>
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.75,
              marginBottom: "48px", maxWidth: "560px", margin: "0 auto 48px",
            }}>
              Custom laser-engraved physical crafts, premium digital products, and state-of-the-art web engineering — all from our design studio.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/contact" className="btn-gold">
                Start Custom Project
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/products" style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "transparent", color: "#fff",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.02em",
                padding: "14px 30px", borderRadius: "100px",
                border: "1.5px solid rgba(255,255,255,0.25)",
                textDecoration: "none",
                transition: "border-color 0.25s ease, background 0.25s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}
              >Browse Collection</Link>
            </div>
          </div>
        </FadeUp>
      </section>

      <Footer settings={settings} />
    </div>
  );
}