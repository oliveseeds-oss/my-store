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
); const Icons = {
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
  ),
  File: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  ),
  Infinity: ({ color = "var(--gold)", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
    </svg>
  )
};

const COLLECTIONS = [
  { title: "Corporate Excellence", sub: "Elevate your brand identity", icon: "Trophy" },
  { title: "Modern Workspace", sub: "Desk accessories & name plates", icon: "Pen" },
  { title: "Wedding Collection", sub: "Timeless keepsakes for love", icon: "Rings" },
  { title: "Business Branding", sub: "Custom branding at scale", icon: "Box" },
];

function CollectionCard({ col }) {
  const [hov, setHov] = useState(false);
  const IconComponent = Icons[col.icon] || Icons.Sparkles;
  return (
    <Link
      to="/catalog"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: hov ? "var(--gold-soft)" : "var(--surface)",
        borderRadius: "var(--radius)",
        border: hov ? "1px solid var(--gold-border)" : `1px solid var(--border)`,
        padding: "36px 28px",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: hov ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
      }}
    >
      <div style={{ marginBottom: 16, display: "inline-flex", color: "var(--gold)", transform: hov ? "scale(1.1) rotate(5deg)" : "scale(1)", transition: "transform 0.3s ease" }}>
        <IconComponent size={36} color="var(--gold)" />
      </div>
      <h3 style={{
        fontFamily: "'Clash Display', sans-serif",
        fontWeight: 600,
        fontSize: 22, color: "var(--accent)", marginBottom: 8,
      }}>
        {col.title}
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
        {col.sub}
      </p>
      <div style={{
        marginTop: 20, display: "flex", alignItems: "center", gap: 6,
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
        color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase",
        transition: "transform 0.3s ease",
        transform: hov ? "translateX(4px)" : "translateX(0)",
      }}>
        Explore <span style={{ fontSize: 14 }}>→</span>
      </div>
    </Link>
  );
}

function PremiumProductCard({ p, to, isDigital = false }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const factor = 8;
    setTilt({
      x: (x / (rect.width / 2)) * factor,
      y: (y / (rect.height / 2)) * factor
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const imgUrl = p.image_url || p.thumbnail_url;
  
  return (
    <Link
      to={to}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "block",
        background: isDigital 
          ? (isHovered ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.05)")
          : "var(--surface)",
        border: isHovered 
          ? "1px solid rgba(201, 168, 106, 0.5)" 
          : (isDigital ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--border)"),
        borderRadius: "var(--radius)",
        overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease",
        boxShadow: isHovered 
          ? (isDigital ? "0 20px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(201, 168, 106, 0.15)" : "0 20px 48px rgba(15, 39, 68, 0.12), 0 0 0 1px rgba(201, 168, 106, 0.1)")
          : "var(--shadow-sm)",
        transform: `perspective(1000px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg) translateY(${isHovered ? -8 : 0}px)`,
        position: "relative",
      }}
    >
      <div style={{ height: "270px", overflow: "hidden", position: "relative" }}>
        {imgUrl ? (
          <img 
            src={imgUrl} 
            alt={p.name} 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)", 
              transform: isHovered ? "scale(1.08)" : "scale(1)" 
            }} 
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: isDigital ? "rgba(255,255,255,0.03)" : "#FAF9F6" }}>
            {isDigital ? <Icons.Bolt size={48} color="var(--gold-border)" /> : <Icons.Wood size={48} color="var(--gold-border)" />}
          </div>
        )}
        
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(15, 39, 68, 0.85) 0%, rgba(15, 39, 68, 0.3) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          zIndex: 3,
        }}>
          <span className="clash" style={{
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            background: "rgba(255, 255, 255, 0.1)",
            padding: "10px 22px",
            borderRadius: "100px",
            backdropFilter: "blur(8px)",
            transform: isHovered ? "translateY(0)" : "translateY(12px)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            Explore {isDigital ? "Asset" : "Craft"} →
          </span>
        </div>

        <span style={{
          position: "absolute", 
          top: "14px", 
          left: "14px", 
          zIndex: 2,
          background: isDigital ? "var(--gold)" : "rgba(255, 255, 255, 0.9)", 
          color: isDigital ? "#fff" : "var(--accent)",
          fontSize: "9px", 
          fontWeight: 700, 
          letterSpacing: "0.18em", 
          textTransform: "uppercase",
          padding: "6px 14px", 
          borderRadius: "100px",
          backdropFilter: "blur(8px)",
          border: isDigital ? "none" : "1px solid rgba(201, 168, 106, 0.2)",
          boxShadow: "0 4px 12px rgba(15,39,68,0.08)"
        }}>
          {isDigital ? "Digital File" : "Premium Craft"}
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ 
          fontSize: "9px", 
          fontWeight: 700, 
          letterSpacing: "0.2em", 
          textTransform: "uppercase", 
          color: "var(--gold)", 
          marginBottom: "8px" 
        }}>
          {p.category}
        </div>
        <h3 className="clash" style={{ 
          fontSize: "17px", 
          fontWeight: 600, 
          color: isDigital ? "#ffffff" : "var(--accent)", 
          marginBottom: "20px",
          lineHeight: 1.3,
          minHeight: "44px"
        }}>
          {p.name}
        </h3>
        
        <div style={{
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          paddingTop: "16px", 
          borderTop: isDigital ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(15, 39, 68, 0.08)",
        }}>
          <span className="clash" style={{ fontSize: "1.45rem", fontWeight: 700, color: isDigital ? "var(--gold)" : "var(--accent)" }}>
            ₹{p.price}
          </span>
          <div style={{
            width: "38px", 
            height: "38px", 
            borderRadius: "50%",
            background: isHovered ? "var(--gold)" : (isDigital ? "rgba(255,255,255,0.1)" : "var(--accent)"),
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: isDigital ? (isHovered ? "#fff" : "var(--gold)") : "#fff", 
            fontSize: "14px",
            border: isDigital && !isHovered ? "1px solid rgba(255,255,255,0.2)" : "none",
            transition: "background 0.3s ease, transform 0.3s ease, color 0.3s ease",
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
          }}>
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [digitalProducts, setDigitalProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const heroRef = useRef(null);

  useEffect(() => {
    // Dynamic SEO Metadata Injection
    document.title = "Oliveseeds Creative Studio | Premium Custom Engravings & UI/UX Services";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Oliveseeds Creative Studio offers premium personalized laser engravings, custom gifts, acrylic and wood keepsakes, alongside professional UI/UX design systems.");
    }

    API.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data.slice(0, 4) : []))
      .catch(() => setProducts([]));

    API.get("/digital-products")
      .then((r) => setDigitalProducts(Array.isArray(r.data) ? r.data.slice(0, 4) : []))
      .catch(() => setDigitalProducts([]));


    API.get("/settings")
      .then((r) => { if (r.data) setSettings(r.data); })
      .catch(() => { });
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
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1px solid rgba(201, 168, 106, 0.3);
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(15,39,68,0.15), inset 0 1px 1px rgba(255,255,255,0.1);
          transition: background 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, var(--accent-h) 0%, #1e3a5f 100%);
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 20px 40px rgba(15,39,68,0.25), 0 0 0 3px rgba(201,168,106,0.3);
          border-color: rgba(201,168,106,0.7);
        }
        .btn-primary svg {
          transition: transform 0.3s ease;
        }
        .btn-primary:hover svg {
          transform: translateX(6px);
        }

        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--gold);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 16px 36px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(201,168,106,0.2);
          transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.3s ease;
        }
        .btn-gold:hover {
          background: #b8943d;
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 40px rgba(201,168,106,0.5);
          border-color: rgba(255,255,255,0.35);
        }
        .btn-gold svg {
          transition: transform 0.3s ease;
        }
        .btn-gold:hover svg {
          transform: translateX(4px);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.4);
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
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
        .btn-outline:hover {
          border-color: var(--gold);
          background: var(--surface);
          color: var(--gold);
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 32px rgba(201,168,106,0.12), 0 0 0 2px rgba(201,168,106,0.15);
        }

        /* Stats Row Modern Grid Overrides */
        .stats-row {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          background: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(201, 168, 106, 0.15) !important;
          border-radius: 24px !important;
          padding: 24px 16px !important;
          gap: 12px !important;
          box-shadow: 0 10px 30px rgba(15,39,68,0.04);
        }
        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 12px !important;
            padding: 20px 12px !important;
          }
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
          .hero-section {
            padding-top: 50px !important;
            padding-bottom: 24px !important;
            min-height: auto !important;
          }
          .hero-grid {
            text-align: left !important;
            gap: 24px !important;
          }
          .hero-grid > div {
            align-items: flex-start !important;
          }
          .stats-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .stats-row > div {
            border-right: none !important;
            border-left: none !important;
            padding-right: 0 !important;
            padding-left: 0 !important;
            align-items: flex-start !important;
            text-align: left !important;
          }
          .stats-row > div:nth-child(1),
          .stats-row > div:nth-child(2) {
            border-bottom: 1px solid var(--border) !important;
            padding-bottom: 12px !important;
          }
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
        className="hero-section"
        style={{
          minHeight: "72vh",
          paddingTop: "90px",
          paddingBottom: "60px",
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
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Eyebrow pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: "8px" }}
              >
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "linear-gradient(135deg, rgba(15,39,68,0.04) 0%, rgba(201,168,106,0.08) 100%)",
                  border: "1px solid rgba(201,168,106,0.25)",
                  borderRadius: "100px",
                  padding: "10px 22px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  boxShadow: "0 4px 20px rgba(201,168,106,0.06)",
                  backdropFilter: "blur(8px)",
                }}>
                  <Icons.Sparkles size={14} color="var(--gold)" />
                  Olive Seeds Premium Crafted & Digital Design Studio
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                className="clash"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(2.2rem, 4.8vw, 4.2rem)",
                  fontWeight: 700,
                  lineHeight: 1.12,
                  color: "var(--accent)",
                  letterSpacing: "-0.025em",
                  margin: "0",
                }}
              >
                Premium Engraved
                <br />
                <span style={{
                  background: "linear-gradient(135deg, var(--gold) 0%, #b8943d 50%, var(--accent) 100%)",
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
                Services <span style={{ fontWeight: 400, color: "var(--text-2)", fontSize: "65%", letterSpacing: "0.02em" }}>— Worldwide</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{
                  color: "var(--text-2)",
                  fontSize: "15.5px",
                  lineHeight: 1.7,
                  maxWidth: "520px",
                  margin: "0",
                  fontWeight: 400,
                }}
              >
                Bespoke laser-acrylic & wooden engraved gifts, personalized arts, &amp; interior products keepsakes —
                paired with premium Notion workspaces, Figma systems, and React web engineering,
                all crafted from our design studio.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
                style={{ display: "flex", gap: "16px", flexWrap: "wrap", margin: "10px 0" }}
              >
                <Link to="/products" className="btn-primary" style={{ padding: "16px 36px", fontSize: "13.5px" }}>
                  Shop Gifts
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "6px" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/digital" className="btn-outline" style={{ padding: "16px 36px", fontSize: "13.5px" }}>
                  Explore Digital Studio
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div
                  className="stats-row"
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "24px",
                    marginTop: "16px",
                  }}
                >
                  {[
                    ["500+", "Crafts Delivered", <Icons.Box size={18} color="var(--gold)" />],
                    ["120+", "Digital Packs", <Icons.Bolt size={18} color="var(--gold)" />],
                    ["15+", "Countries", <Icons.Globe size={18} color="var(--gold)" />],
                    ["99%", "Happy Clients", <Icons.Sparkles size={18} color="var(--gold)" />],
                  ].map(([num, label, icon], i) => (
                    <motion.div
                      key={label}
                      whileHover={{ y: -5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      style={{
                        paddingRight: "16px",
                        borderRight: i < 3 ? "1px solid var(--border)" : "none",
                        paddingLeft: i > 0 ? "16px" : "0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "6px",
                        cursor: "default",
                      }}
                    >
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "var(--gold-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "2px",
                        border: "1px solid var(--gold-border)",
                      }}>
                        {icon}
                      </div>
                      <div className="stat-num" style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent)" }}>{num}</div>
                      <div style={{
                        fontSize: "10.5px", fontWeight: 600, color: "var(--text-2)",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                      }}>{label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT — ad panel + floating badges */}
            <motion.div
              className="hero-right-panel"
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
                <AdBanner placement="Large Panel" priority="high" />
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
                  flexShrink: 0,
                  border: "1px solid var(--gold-border)",
                }}>
                  <Icons.Wood size={20} color="var(--gold)" />
                </div>
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
                  flexShrink: 0,
                  border: "1px solid var(--gold-border)",
                }}>
                  <Icons.Bolt size={20} color="var(--gold)" />
                </div>
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
      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "var(--surface)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "48px" }}>
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
                  marginBottom: "28px",
                }}>
                  <Icons.Wood size={24} color="var(--gold)" />
                </div>
                <h3 className="clash" style={{
                  fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)",
                  letterSpacing: "-0.01em", marginBottom: "14px",
                }}>Physical Products</h3>
                <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.75, marginBottom: "28px" }}>
                  Precision laser-engraved acrylic & wooden arts, gifts, interior keepsakes, custom nameplates &amp; corporate gifts — more products in our design studio.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "36px" }}>
                  {["Custom Engraved Premium Art", "Acrylic Keepsake Products", "Personalized Interior Products", "Corporate Gift & More"].map((li) => (
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
                  marginBottom: "28px",
                }}>
                  <Icons.Bolt size={24} color="var(--gold)" />
                </div>
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
                  marginBottom: "28px",
                }}>
                  <Icons.Art size={24} color="var(--gold)" />
                </div>
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
                <Link to="/service#contact" className="btn-outline" style={{ fontSize: "12px", padding: "12px 24px" }}>
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
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 40px" }}>
        <AdBanner placement="Horizontal Banner" />
      </section>

      {/* ══════════════════════════════════════════════
          STUDIO STORY / ABOUT
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "#F4F4F1" }}>
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
                    width: "100%", height: "400px", objectFit: "cover",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                    display: "block", position: "relative", zIndex: 1,
                    boxShadow: "var(--shadow-md)",
                  }}
                  loading="lazy"
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
                  ["Sparkles", "Premium Products", "Finest woods, acrylics & precision laser calibration"],
                  ["Art", "Modern UI/UX", "High-performance React & sleek Figma design systems"],
                  ["Globe", "Worldwide Dispatch", "Tracked shipping & instant digital downloads"],
                  ["Pen", "Bespoke Orders", "Personalized names, logos & custom corporate styles"],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "20px",
                  }}>
                    <div style={{ marginBottom: "10px", color: "var(--gold)", display: "flex" }}>
                      {(() => {
                        const IconComponent = Icons[icon] || Icons.Sparkles;
                        return <IconComponent size={24} color="var(--gold)" />;
                      })()}
                    </div>
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
      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "#F8F8F5" }}>
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
            <Link to="/categories" style={{
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
              border: "1px solid var(--border)", height: "clamp(350px, 55vh, 460px)",
              boxShadow: "var(--shadow-md)",
            }}>
              <img
                src="/home_workshop.jpg"
                alt="Custom laser wood engraving high end personalized gifts"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, rgba(15,39,68,0.92) 0%, rgba(15,39,68,0.6) 60%, transparent 100%)",
              }} />
              <div style={{
                position: "absolute", top: "50%", left: "clamp(20px, 6vw, 64px)", right: "clamp(20px, 6vw, 64px)",
                transform: "translateY(-50%)", maxWidth: "520px",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  background: "rgba(201,168,106,0.18)", border: "1px solid rgba(201,168,106,0.35)",
                  borderRadius: "100px", padding: "7px 16px",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "var(--gold)", marginBottom: "20px",
                }}>
                  <Icons.Sparkles size={12} color="var(--gold)" />
                  Signature Craft
                </span>
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
                <button
                  onClick={() => {
                    const event = new CustomEvent("open-whatsapp-chat", {
                      detail: { text: "Hi Olive Seeds, I would like to customize a craft." }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="btn-gold cursor-pointer"
                >
                  Customize Your Craft →
                </button>
              </div>
            </div>
          </FadeUp>

          {/* Products grid */}
          {products.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
              {products.map((p, i) => (
                <FadeUp key={p.id} delay={i * 0.08}>
                  <PremiumProductCard p={p} to={`/products/${p.id}`} isDigital={false} />
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
          FEATURED COLLECTIONS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(60px, 6vw, 100px) 24px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <FadeUp>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Featured Collections</span>
            <h2 className="clash" style={{
              fontSize: "clamp(2rem, 4vw, 3.6rem)",
              fontWeight: 700, color: "var(--accent)",
              marginTop: "18px", letterSpacing: "-0.02em", lineHeight: 1.08,
              textAlign: "center", marginBottom: 8
            }}>Curated for Every Occasion</h2>
            <p style={{
              color: "var(--text-2)", maxWidth: "540px",
              margin: "0 auto", fontSize: "15px", lineHeight: 1.7,
              textAlign: "center"
            }}>
              Explore our editorial collections — each one crafted with a singular vision.
            </p>
          </FadeUp>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}>
          {COLLECTIONS.map((col, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <CollectionCard col={col} />
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DIGITAL PRODUCTS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "var(--accent)" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
              {digitalProducts.map((p, i) => (
                <FadeUp key={p.id} delay={i * 0.08}>
                  <PremiumProductCard p={p} to={`/digital/${p.id}`} isDigital={true} />
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

      {/* ── Digital Trust Section ── */}
      <section style={{ padding: "64px 24px", background: "#0B1020", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { icon: "Bolt", label: "Instant Download", sub: "Available immediately" },
              { icon: "Infinity", label: "Lifetime Access", sub: "Access forever" },
              { icon: "File", label: "Commercial License", sub: "Use in client work" },
              { icon: "Lock", label: "Secure Checkout", sub: "256-bit encrypted" },
              { icon: "Repeat", label: "Regular Updates", sub: "Always improving" },
              { icon: "Globe", label: "Global Access", sub: "Available worldwide" },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.05} style={{ display: "flex", flex: "1 1 150px", maxWidth: "200px" }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  padding: "24px 16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#12192D",
                  width: "100%",
                  transition: "all 0.3s ease",
                }}>
                  <div style={{ color: "var(--gold)", display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                    {(() => {
                      const IconComponent = Icons[item.icon] || Icons.Sparkles;
                      return <IconComponent size={28} color="var(--gold)" />;
                    })()}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#A5B4C7", fontFamily: "'Inter', sans-serif" }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CHOOSE OLIVE SEEDS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "#F8F8F5" }}>
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
              { icon: "Globe", title: "Worldwide Delivery", desc: "Fully tracked international shipping to 15+ countries with reliable logistics partners." },
              { icon: "Sparkles", title: "Premium Products", desc: "Every physical product is perfectly-finished with precision laser equipment and quality materials." },
              { icon: "Bolt", title: "Instant Downloads", desc: "Digital products delivered instantly. No waiting, no hassle — ready to use immediately." },
              { icon: "Trophy", title: "Business-Focused", desc: "Tailored solutions for startups, corporates, and entrepreneurs who demand excellence." },
              { icon: "Shield", title: "Secure Payments", desc: "End-to-end encrypted, PCI-compliant payment processing for complete peace of mind." },
              { icon: "Support", title: "Dedicated Support", desc: "Responsive, expert support for every order — physical or digital, before and after purchase." },
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
                    marginBottom: "20px",
                  }}>
                    {(() => {
                      const IconComponent = Icons[s.icon] || Icons.Sparkles;
                      return <IconComponent size={22} color="var(--gold)" />;
                    })()}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent)", marginBottom: "10px" }}>{s.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(80px, 8vw, 140px) 0", background: "var(--surface)" }}>
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
                <Link to="/gallery" className="btn-primary" style={{ display: "inline-flex" }}>
                  Explore Premium Design
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: "8px" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </FadeUp>
            </div>

            {/* Right Column (Interactive List) */}
            <div className="flex flex-col gap-6">
              {[
                { number: "01", icon: "Art", title: "Bespoke Art & Code", desc: "Tailored to your requirements. We design physical gifts and engineer modern web systems matching your exact specification." },
                { number: "02", icon: "Sparkles", title: "Impeccable Quality", desc: "Crafted with premium materials and high precision tools. We check every detail to ensure it meets our rigorous standards." },
                { number: "03", icon: "Box", title: "Seamless Experience", desc: "From instant digital downloads to securely packaged tracked worldwide shipping, we guarantee a hassle-free journey." },
                { number: "04", icon: "Sparkles", title: "Uncompromising Uniqueness", desc: "Stand out with confidence. Our custom layouts, high-end materials, and bespoke systems ensure you leave a lasting impression of quality and authenticity." },
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
                    <div style={{ color: "var(--gold)", display: "flex", alignItems: "center", marginTop: "2px" }}>
                      {(() => {
                        const IconComponent = Icons[c.icon] || Icons.Sparkles;
                        return <IconComponent size={24} color="var(--gold)" />;
                      })()}
                    </div>
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
        padding: "48px 0", background: "#0D1512",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: "24px" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Client Stories</span>
            <h2 className="clash" style={{
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              fontWeight: 700, color: "#fff",
              marginTop: "8px", letterSpacing: "-0.02em",
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
              width: 310px;
              flex-shrink: 0;
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              padding: 24px 20px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
              transition: all 0.3s ease;
              color: #fff;
              margin-right: 20px;
            }
            .story-card:hover {
              transform: translateY(-4px);
              background: rgba(255, 255, 255, 0.06);
              border-color: var(--gold);
              box-shadow: 0 10px 30px rgba(201, 168, 106, 0.12);
            }
            @media (max-width: 640px) {
              .story-card {
                width: 260px;
                padding: 18px 16px;
                margin-right: 14px;
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
                    <div style={{ display: "flex", gap: "3px", marginBottom: "12px", marginTop: "4px" }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.65, fontStyle: "italic" }}>
                      "{t.text}"
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--gold)", fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.02em", flexShrink: 0,
                    }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: "10.5px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>{t.role}</div>
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
                    <div style={{ display: "flex", gap: "3px", marginBottom: "12px", marginTop: "4px" }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.65, fontStyle: "italic" }}>
                      "{t.text}"
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      background: "var(--gold-soft)", border: "1px solid var(--gold-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--gold)", fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.02em", flexShrink: 0,
                    }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: "10.5px", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>{t.role}</div>
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
      <section className="cta-section" style={{ padding: "80px 0" }}>
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
                Let's Talk 
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/gallery" style={{
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