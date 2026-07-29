import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

/* ─── Google Fonts injected once ─────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("olive-fonts")) {
  const link = document.createElement("link");
  link.id = "olive-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

/* ─── Design tokens ───────────────────────────────────────── */
const T = {
  bg: "#0B1020",
  surface1: "#12192D",
  surface2: "#1A233A",
  textPrimary: "#F8FAFC",
  textSecondary: "#A5B4C7",
  accent1: "#6EE7F9",
  accent2: "#8B7CFF",
  accent3: "#00D4A6",
  border: "rgba(255,255,255,0.08)",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

/* ─── Shared styles injected once ────────────────────────── */
const GLOBAL_CSS = `
  :root {
    --bg: ${T.bg};
    --s1: ${T.surface1};
    --s2: ${T.surface2};
    --tp: ${T.textPrimary};
    --ts: ${T.textSecondary};
    --a1: ${T.accent1};
    --a2: ${T.accent2};
    --a3: ${T.accent3};
    --bd: ${T.border};
  }
  .sora { font-family: 'Sora', sans-serif; }
  .inter { font-family: 'Inter', sans-serif; }

  /* Vault category pill */
  .vault-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.01em;
    border: 1px solid var(--bd);
    color: var(--ts);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
  }
  .vault-pill:hover {
    border-color: rgba(110,231,249,0.35);
    color: var(--a1);
    background: rgba(110,231,249,0.06);
  }
  .vault-pill.active {
    border-color: var(--a1);
    color: var(--bg);
    background: var(--a1);
    box-shadow: 0 4px 20px rgba(110,231,249,0.3);
  }
  .dcard {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid var(--bd);
    background: var(--s1);
    transition: transform 0.4s cubic-bezier(.22,.68,0,1.2),
                box-shadow 0.4s ease,
                border-color 0.4s ease;
    will-change: transform;
  }
  .dcard:hover {
    transform: translateY(-6px) scale(1.012);
    border-color: rgba(110,231,249,0.22);
    box-shadow: 0 24px 64px rgba(0,0,0,0.55),
                0 0 40px rgba(110,231,249,0.07),
                inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .dcard__glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 0%, rgba(110,231,249,0.12), transparent 65%);
    transition: opacity 0.4s ease;
  }
  .dcard:hover .dcard__glow { opacity: 1; }
 
  .dcard__img-wrap {
    position: relative;
    aspect-ratio: 1.3/1;
    overflow: hidden;
    background: #080f1e;
  }
  .dcard__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease, filter 0.4s ease;
  }
  .dcard:hover .dcard__img {
    transform: scale(1.08);
    filter: brightness(1.1);
  }
  .dcard__img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(11,16,32,0.82) 0%, transparent 55%);
  }



  /* Filter sidebar */
  .filter-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    border: 1px solid transparent;
    color: var(--ts);
    background: transparent;
    cursor: pointer;
    transition: all 0.22s ease;
  }
  .filter-btn:hover {
    background: rgba(110,231,249,0.06);
    color: var(--a1);
    border-color: rgba(110,231,249,0.15);
  }
  .filter-btn.active {
    background: linear-gradient(90deg, rgba(110,231,249,0.14), rgba(139,124,255,0.10));
    color: var(--a1);
    border-color: rgba(110,231,249,0.28);
    font-weight: 600;
  }

  /* Input / select */
  .vault-input {
    outline: none;
    background: rgba(18,25,45,0.9);
    border: 1px solid var(--bd);
    border-radius: 12px;
    color: var(--tp);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 10px 42px 10px 16px;
    width: 260px;
    backdrop-filter: blur(16px);
    transition: border-color 0.25s;
  }
  .vault-input::placeholder { color: rgba(165,180,199,0.45); }
  .vault-input:focus { border-color: rgba(110,231,249,0.4); }

  .vault-select {
    outline: none;
    background: rgba(18,25,45,0.9);
    border: 1px solid var(--bd);
    border-radius: 12px;
    color: var(--tp);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 10px 16px;
    cursor: pointer;
    backdrop-filter: blur(16px);
    transition: border-color 0.25s;
  }
  .vault-select:focus { border-color: rgba(110,231,249,0.4); }

  /* Cart button */
  .cart-btn {
    width: 100%;
    padding: 9px 0;
    border-radius: 100px;
    font-weight: 750;
    font-size: 11.5px;
    font-family: 'Inter', sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .cart-btn:hover { transform: scale(1.025); }
  .cart-btn:active { transform: scale(0.97); }

  /* Skeleton pulse */
  @keyframes skeletonPulse {
    0%,100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  .skeleton { animation: skeletonPulse 1.6s ease-in-out infinite; }

  /* Ambient floating orbs */
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(30px,-40px) scale(1.08); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-25px,30px) scale(0.94); }
  }
  .orb1 { animation: orb1 14s ease-in-out infinite; }
  .orb2 { animation: orb2 18s ease-in-out infinite; }

  /* Sticky vault nav */
  .vault-nav-sticky {
    position: sticky;
    top: 0;
    z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(11,16,32,0.88);
    border-bottom: 1px solid var(--bd);
  }

  /* Hide scrollbar for category nav */
  .cats-scroll::-webkit-scrollbar { display: none; }
  .cats-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* Collection card */
  .coll-card {
    border-radius: 16px;
    padding: 16px;
    border: 1px solid var(--bd);
    background: var(--s1);
    cursor: pointer;
    transition: border-color 0.3s, transform 0.3s, background 0.3s;
  }
  .coll-card:hover {
    border-color: rgba(139,124,255,0.35);
    background: rgba(139,124,255,0.05);
    transform: translateY(-4px);
  }

  /* Newsletter input */
  .nl-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--bd);
    border-radius: 12px;
    padding: 12px 18px;
    color: var(--tp);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.25s;
    min-width: 0;
  }
  .nl-input::placeholder { color: rgba(165,180,199,0.4); }
  .nl-input:focus { border-color: rgba(110,231,249,0.4); }

  .mobile-filter-btn {
    display: none;
  }
  @media (max-width: 1023px) {
    .mobile-filter-btn {
      display: block !important;
    }
  }

  @keyframes mobOrb1 {
    0%, 100% { transform: translate(0,0) scale(0.7); }
    50% { transform: translate(15px,-20px) scale(0.75); }
  }
  @keyframes mobOrb2 {
    0%, 100% { transform: translate(0,0) scale(0.7); }
    50% { transform: translate(-12px,15px) scale(0.65); }
  }

  @media (max-width: 768px) {
    .vault-orb-card:nth-of-type(1) {
      left: calc(50% - 78px - 60px) !important;
      top: calc(50% - 48px - 50px) !important;
      animation: mobOrb1 12s ease-in-out infinite !important;
    }
    .vault-orb-card:nth-of-type(2) {
      left: calc(50% - 78px + 60px) !important;
      top: calc(50% - 48px - 50px) !important;
      animation: mobOrb2 15s ease-in-out infinite !important;
      animation-delay: 1.5s !important;
    }
    .vault-orb-card:nth-of-type(3) {
      left: calc(50% - 78px - 60px) !important;
      top: calc(50% - 48px + 50px) !important;
      animation: mobOrb2 18s ease-in-out infinite !important;
      animation-delay: 3s !important;
    }
    .vault-orb-card:nth-of-type(4) {
      left: calc(50% - 78px + 60px) !important;
      top: calc(50% - 48px + 50px) !important;
      animation: mobOrb1 21s ease-in-out infinite !important;
      animation-delay: 4.5s !important;
    }
  }
`;

function injectStyles() {
  if (typeof document !== "undefined") {
    let s = document.getElementById("olive-vault-css");
    if (!s) {
      s = document.createElement("style");
      s.id = "olive-vault-css";
      document.head.appendChild(s);
    }
    s.textContent = GLOBAL_CSS;
  }
}



/* ─── Featured collections ───────────────────────────────── */
const COLLECTIONS = [
  { icon: "🤖", title: "AI Automation Vault", desc: "Next-gen agent workflows & AI systems", accent: T.accent1 },
  { icon: "🚀", title: "Startup Launch Kit", desc: "Everything to launch fast and look great", accent: T.accent2 },
  { icon: "🎨", title: "Creator Toolkit", desc: "Assets built for content creators", accent: T.accent3 },
  { icon: "🧩", title: "Design System Collection", desc: "Scalable component systems & libraries", accent: "#F59E0B" },
  { icon: "⚙️", title: "Business Automation", desc: "Automate ops with N8N & AI", accent: "#F472B6" },
];


/* ─── DigitalCard ─────────────────────────────────────────── */
function DigitalCard({ p }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const img = p.thumbnail_url || (p.images && p.images[0]);
  const finalPrice = p.discount_price || p.price;
  const discount = p.discount_price
    ? Math.round((1 - p.discount_price / p.price) * 100)
    : 0;
  const tags = Array.isArray(p.tags) ? p.tags : [];

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart({ ...p, type: "digital" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="dcard">
      <div className="dcard__glow" />

      {/* Image */}
      <Link to={`/digital/${p.id}`} style={{ display: "block" }}>
        <div className="dcard__img-wrap">
          {img ? (
            <img src={img} alt={p.name} className="dcard__img" />
          ) : (
            <div
              style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 48, color: "rgba(110,231,249,0.15)",
              }}
            >
              ⬡
            </div>
          )}
          <div className="dcard__img-overlay" />

          {discount > 0 && (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                background: "linear-gradient(90deg,#F59E0B,#EF4444)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
              }}>
                -{discount}%
              </span>
            </div>
          )}

          {p.file_format && (
            <div style={{ position: "absolute", bottom: 10, left: 12 }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}>
                {p.file_format}
              </span>
            </div>
          )}

          {tags.length > 0 && (
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <span style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                background: "linear-gradient(90deg, rgba(110,231,249,0.25), rgba(139,124,255,0.25))",
                border: "1px solid rgba(110,231,249,0.3)",
                color: T.accent1,
                backdropFilter: "blur(8px)",
              }}>
                {tags[0]}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {p.category_name && (
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: T.accent1,
            margin: 0,
          }}>
            {p.category_name}
          </p>
        )}

        <Link to={`/digital/${p.id}`} style={{ textDecoration: "none" }}>
          <h3
            className="sora"
            style={{
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.35,
              color: T.textPrimary,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {p.name}
          </h3>
        </Link>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                color: i <= Math.round(p.rating) ? "#FBBF24" : "rgba(255,255,255,0.12)",
              }}
            >
              ★
            </span>
          ))}
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            color: "rgba(165,180,199,0.5)",
            marginLeft: 4,
          }}>
            ({p.review_count || 0})
          </span>
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <span
            className="sora"
            style={{
              fontSize: 22,
              fontWeight: 800,
              background: `linear-gradient(90deg, ${T.accent1}, ${T.textPrimary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ₹{finalPrice}
          </span>
          {p.discount_price && (
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              textDecoration: "line-through",
              color: "rgba(165,180,199,0.35)",
            }}>
              ₹{p.price}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="cart-btn"
          style={{
            background: added
              ? `linear-gradient(90deg, ${T.accent3}, #00b899)`
              : `linear-gradient(90deg, ${T.accent2}, ${T.accent1})`,
            color: added ? "#fff" : T.bg,
            boxShadow: added
              ? "0 8px 24px rgba(0,212,166,0.28)"
              : "0 8px 24px rgba(110,231,249,0.22)",
            marginTop: 4,
          }}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="skeleton"
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        background: T.surface1,
      }}
    >
      <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.05)", width: "40%" }} />
        <div style={{ height: 14, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
        <div style={{ height: 14, borderRadius: 6, background: "rgba(255,255,255,0.05)", width: "70%" }} />
        <div style={{ height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)", marginTop: 8 }} />
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function DigitalProductList() {
  injectStyles();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const [r, c] = await Promise.all([
      API.get(`/digital-products?${params}`),
      API.get("/categories?type=digital"),
    ]);
    setProducts(r.data);
    setCategories(c.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

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
      await API.post("/digital-inquiries", form);
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
      className="inter"
      style={{
        minHeight: "100vh",
        background: T.bg,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <SEO
        title="Digital Products — Instant Download | Figma Templates, Web Templates & More | Olive Seeds"
        description="Download premium Figma UI templates, website templates, printables, 3D models and n8n automation tools instantly. Commercial license included. Designed for creators and businesses."
        keywords="buy Figma templates online, instant download design templates, UI kit download for designers, website template instant download, printable design assets download, n8n automation workflow template, 3D model files instant download, branding kit download, social media template pack, Figma UI components download, web design templates purchase"
      />

      <style>{`
        /* Contact Section Responsive Adjustments for Mobile */
        @media (max-width: 768px) {
          #contact-section {
            padding: 48px 16px !important;
          }
          .responsive-split-1-2 {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .contact-form-card {
            padding: 24px 16px !important;
            border-radius: 16px !important;
          }
          .responsive-form {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .responsive-form > div {
            grid-column: span 1 !important;
          }
          .responsive-form > button {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      {/* ── Ambient background orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div
          className="orb1"
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(110,231,249,0.07) 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <div
          className="orb2"
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-12%",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(139,124,255,0.07) 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(0,212,166,0.04) 0%, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Global Navbar ── */}
      <div style={{ position: "relative", zIndex: 50 }}>
        <Navbar />
      </div>



      {/* ── Hero ── */}
      <section
        className="digital-hero"
        style={{
          position: "relative",
          padding: "100px 24px 80px",
          overflow: "hidden",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="digital-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  background: "rgba(110,231,249,0.08)",
                  border: "1px solid rgba(110,231,249,0.2)",
                  color: T.accent1,
                  whiteSpace: "nowrap",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent1, display: "inline-block" }} />
                  Premium Digital Vault
                </span>
              </div>

              <h1
                className="sora"
                style={{
                  fontSize: "clamp(36px, 5vw, 58px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: T.textPrimary,
                  margin: "0 0 12px",
                  letterSpacing: "-2px",
                }}
              >
                Digital Assets That
                <span style={{
                  display: "block",
                  background: `linear-gradient(90deg, ${T.accent1}, ${T.accent2})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Accelerate Creation.
                </span>
              </h1>

              <p
                className="inter"
                style={{
                  fontSize: "clamp(15px, 1.8vw, 18px)",
                  lineHeight: 1.7,
                  color: T.textSecondary,
                  margin: "20px 0 36px",
                  maxWidth: 480,
                }}
              >
                Premium templates, AI systems, automation workflows, and creative resources built for professionals and businesses.
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    const el = document.getElementById("products-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    padding: "14px 30px",
                    borderRadius: 12,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "0.04em",
                    border: "none",
                    cursor: "pointer",
                    background: `linear-gradient(135deg, ${T.accent1}, ${T.accent2})`,
                    color: T.bg,
                    boxShadow: `0 10px 32px rgba(110,231,249,0.3)`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(110,231,249,0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 32px rgba(110,231,249,0.3)";
                  }}
                >
                  Explore Assets
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("contact-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    padding: "14px 30px",
                    borderRadius: 12,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    background: "transparent",
                    color: T.textPrimary,
                    border: `1px solid ${T.border}`,
                    transition: "border-color 0.25s, background 0.25s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "rgba(110,231,249,0.35)";
                    e.currentTarget.style.background = "rgba(110,231,249,0.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Custom Project
                </button>
              </div>
            </div>

            {/* Right: floating preview cards */}
            <div style={{ position: "relative", height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {[
                { label: "Figma Template", icon: "🎨", x: 0, y: 0, accent: T.accent1 },
                { label: "AI Agent", icon: "🤖", x: 160, y: -50, accent: T.accent2 },
                { label: "3D Asset", icon: "⬡", x: 30, y: 140, accent: T.accent3 },
                { label: "N8N Workflow", icon: "⚙️", x: 200, y: 90, accent: "#F59E0B" },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className="vault-orb-card"
                  style={{
                    position: "absolute",
                    left: `calc(50% - 90px + ${card.x}px)`,
                    top: `calc(50% - 48px + ${card.y}px)`,
                    width: 156,
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid rgba(255,255,255,0.09)`,
                    background: "rgba(18,25,45,0.85)",
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03)`,
                    animation: `orb${(i % 2) + 1} ${12 + i * 3}s ease-in-out infinite`,
                    animationDelay: `${i * 1.5}s`,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{
                    fontFamily: "Sora, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.textPrimary,
                    marginBottom: 4,
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    height: 3,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${card.accent}, transparent)`,
                    width: "70%",
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ── Ad Banner ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 24px", position: "relative", zIndex: 2 }}>
        <AdBanner placement="Horizontal Banner" />
      </div>



      {/* ── Main Products Section ── */}
      <section id="products-section" style={{ padding: "32px 24px 80px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 28 }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: 240, flexShrink: 0, display: "none" }} className="vault-sidebar">
            <style>{`
              @media(min-width:1024px){.vault-sidebar{display:block!important;}}
            `}</style>
            <div style={{
              position: "sticky",
              top: 72,
              borderRadius: 18,
              border: `1px solid ${T.border}`,
              background: T.surface1,
              overflow: "hidden",
            }}>
              {/* Categories */}
              <div style={{ padding: "20px 16px" }}>
                <p className="sora" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: T.accent1,
                  marginBottom: 14,
                }}>
                  Categories
                </p>
                <button
                  onClick={() => setFilter("category", "")}
                  className={`filter-btn${!filters.category ? " active" : ""}`}
                >
                  All Products
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilter("category", c.name)}
                    className={`filter-btn${filters.category === c.name ? " active" : ""}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: T.border, margin: "0 16px" }} />

              {/* Sort */}
              <div style={{ padding: "16px" }}>
                <p className="sora" style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: T.accent2,
                  marginBottom: 12,
                }}>
                  Sort By
                </p>
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setFilter("sort", o.value)}
                    className={`filter-btn${filters.sort === o.value ? " active" : ""}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Ad */}
            <div style={{ marginTop: 20 }}>
              <AdBanner placement="Vertical Tower" />
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Controls bar */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
              paddingTop: 8,
            }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: T.textSecondary, margin: 0 }}>
                {loading
                  ? "Loading premium assets…"
                  : `${products.length} products available`}
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <input
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    placeholder="Search premium products…"
                    className="vault-input"
                  />
                  <span style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: T.accent1,
                    fontSize: 16,
                    pointerEvents: "none",
                  }}>
                    ⌕
                  </span>
                </div>

                {/* Sort (mobile) */}
                <select
                  value={filters.sort}
                  onChange={(e) => setFilter("sort", e.target.value)}
                  className="vault-select"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} style={{ background: T.bg }}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* Mobile Filter Toggle */}
                <button
                  className="mobile-filter-btn"
                  onClick={() => setShowMobileFilters(true)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12, border: `1px solid ${T.border}`,
                    fontFamily: "Inter, sans-serif", fontSize: 13,
                    background: T.surface1, color: T.textPrimary,
                    cursor: "pointer",
                    display: "none"
                  }}
                >
                  🎛️ Filters
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{
                padding: "80px 24px",
                textAlign: "center",
                borderRadius: 20,
                border: `1px solid ${T.border}`,
                background: T.surface1,
              }}>
                <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>⬡</div>
                <p className="sora" style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, margin: "0 0 8px" }}>
                  No products found
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: T.textSecondary, margin: 0 }}>
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 20,
              }}>
                {products.map((p) => (
                  <DigitalCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Collections ── */}
      <section style={{ padding: "48px 24px 72px", position: "relative", zIndex: 2, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <p style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.accent2,
              marginBottom: 8,
            }}>
              Curated Vaults
            </p>
            <h2 className="sora" style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 800,
              color: T.textPrimary,
              letterSpacing: "-0.5px",
              margin: 0,
            }}>
              Featured Collections
            </h2>
          </div>
          <div className="collections-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {COLLECTIONS.map((col) => (
              <div key={col.title} className="coll-card" style={{ padding: "20px", borderRadius: "18px" }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{col.icon}</div>
                <h3 className="sora" style={{ fontSize: 13.5, fontWeight: 700, color: T.textPrimary, margin: "0 0 6px", letterSpacing: "-0.2px" }}>
                  {col.title}
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.textSecondary, margin: "0 0 14px", lineHeight: 1.5 }}>
                  {col.desc}
                </p>
                <div style={{ height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${col.accent}, transparent)`, width: "40%" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section style={{
        position: "relative",
        zIndex: 2,
        borderTop: `1px solid ${T.border}`,
        padding: "72px 24px",
        overflow: "hidden",
      }}>
        {/* bg accent */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, rgba(139,124,255,0.08), transparent 60%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
            background: "rgba(139,124,255,0.1)",
            border: "1px solid rgba(139,124,255,0.2)",
            color: T.accent2,
            marginBottom: 20,
          }}>
            Vault Insider
          </span>

          <h2 className="sora" style={{
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontWeight: 800,
            color: T.textPrimary,
            letterSpacing: "-1px",
            margin: "0 0 14px",
          }}>
            Stay Ahead of the Curve
          </h2>
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            color: T.textSecondary,
            margin: "0 0 32px",
            lineHeight: 1.6,
          }}>
            Get new releases, exclusive assets, early access drops, and industry resources delivered first.
          </p>

          <div style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="your@email.com"
              className="nl-input"
            />
            <button style={{
              padding: "12px 22px",
              borderRadius: 12,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              background: `linear-gradient(135deg, ${T.accent1}, ${T.accent2})`,
              color: T.bg,
              whiteSpace: "nowrap",
              boxShadow: "0 8px 24px rgba(110,231,249,0.25)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.04)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Get Access
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {["New Releases", "Exclusive Assets", "Early Access"].map((t) => (
              <span key={t} style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(165,180,199,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <span style={{ color: T.accent3, fontSize: 10 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer Overlay */}
      {showMobileFilters && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "flex-end"
        }}>
          <div style={{
            width: "300px", background: T.surface1, height: "100%", overflowY: "auto",
            padding: "30px 24px", display: "flex", flexDirection: "column", gap: 20,
            position: "relative", boxShadow: "-8px 0 32px rgba(0,0,0,0.15)"
          }}>
            <button
              onClick={() => setShowMobileFilters(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                border: "none", background: "none", fontSize: 24, cursor: "pointer",
                color: T.textPrimary
              }}
            >
              ×
            </button>
            <h3 className="sora" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px 0", color: T.textPrimary }}>Filters</h3>
            
            {/* Categories */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p className="sora" style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: T.accent1,
                marginBottom: 10,
              }}>
                Categories
              </p>
              <button
                onClick={() => { setFilter("category", ""); setShowMobileFilters(false); }}
                className={`filter-btn${!filters.category ? " active" : ""}`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setFilter("category", c.name); setShowMobileFilters(false); }}
                  className={`filter-btn${filters.category === c.name ? " active" : ""}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p className="sora" style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: T.accent1,
              }}>
                Price Range
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter("minPrice", e.target.value)}
                  className="vault-input"
                  style={{ width: "100%", paddingRight: 10 }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter("maxPrice", e.target.value)}
                  className="vault-input"
                  style={{ width: "100%", paddingRight: 10 }}
                />
              </div>
            </div>

            {/* Rating */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p className="sora" style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: T.accent1,
              }}>
                Rating
              </p>
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => { setFilter("minRating", filters.minRating === r ? "" : r); setShowMobileFilters(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 12px", borderRadius: 10, border: "none",
                    cursor: "pointer", width: "100%",
                    fontFamily: "Inter, sans-serif", fontSize: 13,
                    background: filters.minRating === r ? "rgba(110,231,249,0.1)" : "transparent",
                    color: filters.minRating === r ? T.accent1 : T.textSecondary,
                    textAlign: "left",
                  }}
                >
                  <span>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} style={{ color: i <= r ? "#FBBF24" : "rgba(255,255,255,0.1)", fontSize: 12 }}>★</span>
                    ))}
                  </span>
                  & Up
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Section ── */}
      <section id="contact-section" style={{ padding: "80px 24px", position: "relative", zIndex: 2, background: "rgba(18, 25, 45, 0.4)", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px" }} className="responsive-split-1-2">
            {/* Left Column */}
            <div>
              <div style={{ width: 44, height: 3, background: "linear-gradient(90deg, #6EE7F9, #8B7CFF)", marginBottom: 20, borderRadius: 2 }} />
              <span className="sora" style={{ display: "block", marginBottom: 14, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: T.accent1 }}>Start Your Project</span>
              <h2 className="clash" style={{ fontSize: 36, color: T.textPrimary, marginBottom: 20, fontWeight: 700, lineHeight: 1.15 }}>
                Let's build something extraordinary
              </h2>
              <p style={{ fontSize: 15.5, color: T.textSecondary, lineHeight: 1.8, marginBottom: 40 }}>
                Fill out the brief and our senior design director will review your project specifications and respond within 24 hours.
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Form */}
            <div
              className="contact-form-card"
              style={{
                background: T.surface1,
                border: `1px solid ${T.border}`,
                borderRadius: 24,
                padding: "36px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
              }}
            >
              {success ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "48px", color: T.accent1, marginBottom: "16px" }}>✓</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: T.textPrimary, marginBottom: "10px" }}>Enquiry Received</h3>
                  <p style={{ fontSize: "14.5px", color: T.textSecondary, lineHeight: 1.6 }}>
                    Thank you for reaching out! Our creative director will review your project details and get in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="responsive-form">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Company *</label>
                    <input
                      type="text"
                      placeholder="Acme Inc."
                      required
                      value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Project Type *</label>
                    <select
                      required
                      value={form.project_type}
                      onChange={e => setForm({ ...form, project_type: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14, cursor: "pointer"
                      }}
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Budget Range</label>
                    <select
                      value={form.budget_range}
                      onChange={e => setForm({ ...form, budget_range: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14, cursor: "pointer"
                      }}
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Timeline</label>
                    <select
                      value={form.timeline}
                      onChange={e => setForm({ ...form, timeline: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14, cursor: "pointer"
                      }}
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
                    <label style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Project Details *</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your project, goals, and any specific requirements..."
                      required
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={{
                        padding: "12px 16px", borderRadius: 12, border: `1px solid ${T.border}`,
                        background: T.surface2, color: T.textPrimary, outline: "none", fontSize: 14, resize: "none"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      gridColumn: "span 2", padding: "14px", borderRadius: 12, border: "none",
                      background: `linear-gradient(135deg, ${T.accent1}, ${T.accent2})`,
                      color: T.bg, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                      cursor: submitting ? "not-allowed" : "pointer", fontSize: 13, marginTop: 10
                    }}
                  >
                    {submitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Footer dark />
      </div>
    </div>
  );
}