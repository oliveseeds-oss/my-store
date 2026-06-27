import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

/* ─── Google Fonts ────────────────────────────────────────────────────── */
const FontLink = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

/* ─── Design tokens ───────────────────────────────────────────────────── */
const T = {
  bg: "#F6F3EE",
  card: "#FFFFFF",
  text: "#1B1B1B",
  textSec: "#66615B",
  accent: "#8C6A43",
  highlight: "#C6A77D",
  border: "#E5DED6",
  hover: "#6A4D2E",
  headingFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'Inter', sans-serif",
};

/* ─── Sort options (unchanged logic) ─────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "newest",     label: "Featured"           },
  { value: "rating",     label: "Best Selling"       },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];


const TRUST_ITEMS = [
  { icon: "✈️", label: "Worldwide Shipping"  },
  { icon: "🔒", label: "Secure Payments"     },
  { icon: "🪵", label: "Premium Materials"   },
  { icon: "✂️", label: "Made To Order"       },
  { icon: "🔏", label: "Custom Engraving"    },
  { icon: "🎁", label: "Gift Ready Packaging"},
];

const MATERIALS = [
  { name: "Wood",        desc: "Natural grain, warm tones", emoji: "🪵" },
  { name: "Acrylic",    desc: "Crystal clarity, bold finish", emoji: "💠" },
  { name: "Leather",    desc: "Rich texture, lasting luxury", emoji: "🧶" },
  { name: "Glass",      desc: "Precision-cut, timeless shine", emoji: "⚙️" },
  { name: "Premium MDF",desc: "Smooth surface, perfect engraving", emoji: "📐" },
];

const COLLECTIONS = [
  { title: "Corporate Excellence", sub: "Elevate your brand identity",   emoji: "🏆" },
  { title: "Modern Workspace",     sub: "Desk accessories & name plates", emoji: "🖊️" },
  { title: "Wedding Collection",   sub: "Timeless keepsakes for love",   emoji: "💍" },
  { title: "Business Branding",    sub: "Custom branding at scale",      emoji: "📦" },
];

const WHY_US = [
  { icon: "🪵", title: "Premium Materials",     desc: "Only the finest wood, acrylic, metal and MDF." },
  { icon: "🔏", title: "Precision Engraving",   desc: "Laser-cut to micron accuracy every time." },
  { icon: "✈️", title: "Worldwide Shipping",    desc: "Fast, insured delivery to your doorstep." },
  { icon: "🎁", title: "Gift Ready Packaging",  desc: "Luxury packaging that makes unboxing special." },
  { icon: "💬", title: "Dedicated Support",     desc: "Expert guidance from order to delivery." },
  { icon: "🏢", title: "Business Orders",       desc: "Bulk corporate gifting with volume pricing." },
];

const STEPS = [
  { num: "01", title: "Choose Product",      desc: "Browse our curated collection of premium engravables." },
  { num: "02", title: "Add Personalization", desc: "Upload your name, logo or message for engraving." },
  { num: "03", title: "Review Design",       desc: "We send a digital proof before production begins." },
  { num: "04", title: "Worldwide Delivery",  desc: "Gift-packaged and shipped straight to your door." },
];

/* ─── Star Rating (unchanged logic) ──────────────────────────────────── */
function StarRating({ rating, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              fontSize: 12,
              color: i <= Math.round(rating) ? "#C6A77D" : "#D6CEC4",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: 11, color: T.textSec }}>({count || 0})</span>
    </div>
  );
}

/* ─── Product Card ────────────────────────────────────────────────────── */
function ProductCard({ p, onWishlist, isWishlisted }) {
  const { addToCart } = useCart();
  const { convert } = useCurrency();
  const [added, setAdded]       = useState(false);
  const [hovered, setHovered]   = useState(false);

  const img         = p.image_url || (p.images && p.images[0]);
  const finalPrice  = p.discount_price || p.price;
  const discount    = p.discount_price
    ? Math.round((1 - p.discount_price / p.price) * 100)
    : 0;
  const tags = Array.isArray(p.tags) ? p.tags : [];

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart({ ...p, type: "physical" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.4s ease, transform 0.4s ease",
        boxShadow: hovered
          ? "0 24px 60px rgba(140,106,67,0.18)"
          : "0 4px 24px rgba(27,27,27,0.06)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Image */}
      <Link to={`/products/${p.id}`} style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <div style={{ aspectRatio: "1/1", background: "#F0EBE3", overflow: "hidden", position: "relative" }}>
          {img ? (
            <img
              src={img}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.7s ease",
                transform: hovered ? "scale(1.08)" : "scale(1)",
                display: "block",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 56 }}>🪵</span>
            </div>
          )}

          {/* Dark overlay on hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(27,27,27,0.25), transparent 60%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }} />

          {/* Quick Preview pill */}
          {hovered && (
            <div style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              borderRadius: 50,
              padding: "6px 18px",
              fontSize: 11,
              fontFamily: T.bodyFont,
              fontWeight: 600,
              color: T.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}>
              Quick Preview
            </div>
          )}
        </div>

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {discount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "4px 10px",
              borderRadius: 50, background: "#7f1d1d", color: "#fff",
              fontFamily: T.bodyFont, letterSpacing: "0.05em",
            }}>
              -{discount}% OFF
            </span>
          )}
          {tags.slice(0, 1).map((t) => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 700, padding: "4px 10px",
              borderRadius: 50, fontFamily: T.bodyFont, letterSpacing: "0.05em",
              background: t === "Best Seller" ? T.highlight : t === "New Arrival" ? "#0f766e" : T.accent,
              color: "#fff",
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); onWishlist(p.id); }}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            opacity: hovered || isWishlisted ? 1 : 0,
            transition: "opacity 0.3s ease, transform 0.2s ease",
            transform: isWishlisted ? "scale(1.15)" : "scale(1)",
            color: isWishlisted ? "#c0392b" : T.textSec,
          }}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </Link>

      {/* Card Body */}
      <div style={{ padding: "20px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        {p.category_name && (
          <p style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em",
            color: T.accent, fontFamily: T.bodyFont, fontWeight: 600, marginBottom: 6,
          }}>
            {p.category_name}
          </p>
        )}

        <Link to={`/products/${p.id}`}>
          <h3 style={{
            fontFamily: T.headingFont, fontWeight: 600,
            fontSize: 17, lineHeight: 1.4,
            color: hovered ? T.hover : T.text,
            transition: "color 0.3s ease",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            marginBottom: 10,
          }}>
            {p.name}
          </h3>
        </Link>

        <StarRating rating={p.rating} count={p.review_count} />

        {/* Badges row */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, padding: "3px 9px", borderRadius: 50,
            background: "#F0EBE3", color: T.accent,
            fontFamily: T.bodyFont, fontWeight: 600, letterSpacing: "0.08em",
          }}>
            🔏 Engravable
          </span>
          {tags.includes("Best Seller") && (
            <span style={{
              fontSize: 10, padding: "3px 9px", borderRadius: 50,
              background: "#FFF8EC", color: "#92600A",
              fontFamily: T.bodyFont, fontWeight: 600, letterSpacing: "0.08em",
            }}>
              ⭐ Best Seller
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 14 }}>
          <span style={{
            fontFamily: T.headingFont, fontSize: 24, fontWeight: 700, color: T.text,
          }}>
            {convert(finalPrice)}
          </span>
          {p.discount_price && (
            <span style={{ fontSize: 13, textDecoration: "line-through", color: "#A8A29E", marginBottom: 3 }}>
              {convert(p.price)}
            </span>
          )}
        </div>

        {p.stock <= 5 && p.stock > 0 && (
          <p style={{ fontSize: 11, color: "#b91c1c", marginTop: 6, fontFamily: T.bodyFont, fontWeight: 600 }}>
            Only {p.stock} left in stock
          </p>
        )}

        <button
          onClick={handleAdd}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "12px 0",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontFamily: T.bodyFont,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
            background: added
              ? "linear-gradient(135deg, #15803d, #16a34a)"
              : `linear-gradient(135deg, ${T.accent}, ${T.hover})`,
            color: "#fff",
            boxShadow: added
              ? "0 8px 20px rgba(34,197,94,0.25)"
              : `0 8px 24px rgba(140,106,67,0.28)`,
          }}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────────────── */
export default function ProductList() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [wishlist,   setWishlist]   = useState([]);
  const [email,      setEmail]      = useState("");

  const [filters, setFilters] = useState({
    search:    "",
    category:  "",
    sort:      "newest",
    minPrice:  "",
    maxPrice:  "",
    minRating: "",
  });

  /* ── Unchanged data-loading logic ── */
  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const [r, c] = await Promise.all([
      API.get(`/products?${params}`),
      API.get("/categories?type=physical"),
    ]);
    setProducts(r.data);
    setCategories(c.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);



  const toggleWishlist = (id) =>
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const ratingOptions = [4, 3, 2, 1];

  /* ─── helper styles ─────────────────────────────────── */
  const sectionHeading = (centered = false) => ({
    fontFamily: T.headingFont,
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "clamp(32px, 5vw, 52px)",
    color: T.text,
    lineHeight: 1.15,
    textAlign: centered ? "center" : "left",
    marginBottom: 8,
  });

  const sectionSub = (centered = false) => ({
    fontFamily: T.bodyFont,
    fontSize: 15,
    color: T.textSec,
    lineHeight: 1.7,
    textAlign: centered ? "center" : "left",
    maxWidth: 540,
    margin: centered ? "0 auto" : undefined,
  });

  const eyebrow = (centered = false) => ({
    fontFamily: T.bodyFont,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: T.accent,
    textAlign: centered ? "center" : "left",
    marginBottom: 12,
  });

  /* ─── JSX ───────────────────────────────────────────── */
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.bodyFont }}>
      <FontLink />

      <SEO
        title="Buy Custom Engraved Products Online | MDF, Acrylic, Wood & Leather | Olive Seeds"
        description="Shop premium custom laser-engraved name plates, corporate gifts, wooden plaques and leather products. Personalized to order with worldwide shipping. Fast delivery guaranteed."
        keywords="custom engraved name plates online, laser engraved gifts worldwide shipping, personalized MDF name plate, buy acrylic engraved products online, custom wooden engraved gifts, corporate engraved gifts with logo"
      />

      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(135deg, #1B1510 0%, #2C1F14 55%, #3D2B1F 100%)`,
        padding: "100px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative warm glow */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,167,125,0.18), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(140,106,67,0.12), transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Thin decorative line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(to right, transparent, ${T.highlight}, transparent)`,
          opacity: 0.4,
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p style={{
            fontFamily: T.bodyFont, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.4em", textTransform: "uppercase",
            color: T.highlight, marginBottom: 20,
          }}>
            Olive Seeds Design Studio · Premium Collection
          </p>

          <h1 style={{
            fontFamily: T.headingFont,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(44px, 7vw, 80px)",
            color: "#F6F3EE",
            lineHeight: 1.08,
            maxWidth: 700,
            marginBottom: 24,
          }}>
            Uniquely Designed.<br />
            <em style={{ color: T.highlight }}>Expertly Engraved.</em>
          </h1>

          <p style={{
            fontFamily: T.bodyFont,
            fontSize: 16,
            lineHeight: 1.8,
            color: "rgba(246,243,238,0.72)",
            maxWidth: 520,
            marginBottom: 40,
          }}>
            Premium personalized products designed to leave lasting impressions.
            Every piece crafted with precision and care.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={() => document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "16px 36px",
                background: T.highlight,
                color: "#1B1510",
                border: "none",
                borderRadius: 50,
                fontFamily: T.bodyFont,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: `0 12px 36px rgba(198,167,125,0.4)`,
                transition: "all 0.3s ease",
              }}
            >
              Shop Collection
            </button>
            <button
              onClick={() => {
                setFilter("category", "Best Sellers");
                document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "16px 36px",
                background: "transparent",
                color: "#F6F3EE",
                border: `1px solid rgba(198,167,125,0.5)`,
                borderRadius: 50,
                fontFamily: T.bodyFont,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Explore Best Sellers
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 24px",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 0,
        }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "20px 16px",
              borderRight: i < TRUST_ITEMS.length - 1 ? `1px solid ${T.border}` : "none",
              flex: "1 1 140px",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{
                fontFamily: T.bodyFont, fontSize: 12, fontWeight: 600,
                color: T.text, letterSpacing: "0.03em",
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          AD BANNER
      ═══════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1280, margin: "40px auto 0", padding: "0 24px" }}>
        <AdBanner placement="Horizontal Banner" />
      </div>

      {/* ═══════════════════════════════════════════════════
          FEATURED COLLECTIONS
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <p style={eyebrow(true)}>Featured Collections</p>
          <h2 style={sectionHeading(true)}>Curated for Every Occasion</h2>
          <p style={sectionSub(true)}>
            Explore our editorial collections — each one crafted with a singular vision.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24,
        }}>
          {COLLECTIONS.map((col, i) => (
            <CollectionCard key={i} col={col} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MAIN PRODUCT AREA (Sidebar + Grid)
      ═══════════════════════════════════════════════════ */}
      <section id="product-grid" style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px",
        display: "flex", gap: 32, alignItems: "flex-start",
      }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          display: "none", /* shown via media query override below */
          width: 240, flexShrink: 0,
          position: "sticky", top: 80,
          flexDirection: "column", gap: 20,
        }}
          className="luxury-sidebar"
        >
          {/* Categories */}
          <SidebarPanel title="Categories">
            {[{ id: "", name: "All Products" }, ...categories].map((c) => (
              <SidebarBtn
                key={c.id}
                label={c.name}
                active={filters.category === c.name || (!filters.category && c.id === "")}
                onClick={() => setFilter("category", c.id === "" ? "" : c.name)}
              />
            ))}
          </SidebarPanel>

          {/* Price Range */}
          <SidebarPanel title="Price Range">
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                style={priceInputStyle}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                style={priceInputStyle}
              />
            </div>
          </SidebarPanel>

          {/* Customer Rating */}
          <SidebarPanel title="Customer Rating">
            {ratingOptions.map((r) => (
              <button
                key={r}
                onClick={() => setFilter("minRating", filters.minRating === r ? "" : r)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px", borderRadius: 10, border: "none",
                  cursor: "pointer", width: "100%",
                  fontFamily: T.bodyFont, fontSize: 12,
                  background: filters.minRating === r ? "#FFF8EC" : "transparent",
                  color: filters.minRating === r ? T.accent : T.textSec,
                  fontWeight: filters.minRating === r ? 600 : 400,
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
              >
                <span>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} style={{ color: i <= r ? "#C6A77D" : "#D6CEC4", fontSize: 12 }}>★</span>
                  ))}
                </span>
                & Up
              </button>
            ))}
          </SidebarPanel>
        </aside>

        {/* ── PRODUCT MAIN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: 16, marginBottom: 36, flexWrap: "wrap",
          }}>
            <div>
              <h2 style={{
                fontFamily: T.headingFont, fontStyle: "italic",
                fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 400,
                color: T.text, marginBottom: 4,
              }}>
                {filters.category || "All Engraved Products"}
              </h2>
              <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.textSec }}>
                {loading ? "Loading collection…" : `${products.length} premium products available`}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <input
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  placeholder="Search products…"
                  style={{
                    width: 240, padding: "12px 40px 12px 16px",
                    borderRadius: 12, border: `1px solid ${T.border}`,
                    fontFamily: T.bodyFont, fontSize: 13,
                    background: T.card, color: T.text,
                    outline: "none",
                    boxShadow: "0 4px 16px rgba(27,27,27,0.05)",
                  }}
                />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.textSec, fontSize: 14 }}>🔍</span>
              </div>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12, border: `1px solid ${T.border}`,
                  fontFamily: T.bodyFont, fontSize: 13,
                  background: T.card, color: T.text,
                  outline: "none",
                  boxShadow: "0 4px 16px rgba(27,27,27,0.05)",
                  cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  background: T.card, borderRadius: 20,
                  overflow: "hidden", border: `1px solid ${T.border}`,
                }}>
                  <div style={{ aspectRatio: "1/1", background: "#EDE8E0", animation: "pulse 1.5s infinite" }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 12, background: "#EDE8E0", borderRadius: 6, marginBottom: 10, width: "70%" }} />
                    <div style={{ height: 10, background: "#EDE8E0", borderRadius: 6, width: "50%" }} />
                    <div style={{ height: 40, background: "#F0EBE3", borderRadius: 12, marginTop: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{
              background: T.card, borderRadius: 20, padding: "80px 24px",
              textAlign: "center", border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🪵</p>
              <p style={{ fontFamily: T.headingFont, fontStyle: "italic", fontSize: 28, color: T.text, marginBottom: 8 }}>
                No Products Found
              </p>
              <p style={{ fontFamily: T.bodyFont, fontSize: 14, color: T.textSec }}>
                Try adjusting your filters or browse all products.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CUSTOMIZATION STEPS
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: T.card,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={eyebrow(true)}>How It Works</p>
            <h2 style={sectionHeading(true)}>Your Customization Journey</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 32,
          }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#F0EBE3",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  border: `2px solid ${T.border}`,
                }}>
                  <span style={{
                    fontFamily: T.headingFont, fontSize: 22, fontWeight: 700,
                    color: T.accent,
                  }}>
                    {step.num}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: T.headingFont, fontStyle: "italic",
                  fontSize: 20, fontWeight: 500, color: T.text,
                  marginBottom: 10,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: T.bodyFont, fontSize: 14,
                  color: T.textSec, lineHeight: 1.7,
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MATERIAL SHOWCASE
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={eyebrow()}>Our Materials</p>
          <h2 style={sectionHeading()}>Tactile. Premium. Lasting.</h2>
          <p style={sectionSub()}>
            Every material is selected for its engraving quality, durability, and luxurious appearance.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20,
        }}>
          {MATERIALS.map((mat, i) => (
            <MaterialCard key={i} mat={mat} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: T.card,
        borderTop: `1px solid ${T.border}`,
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={eyebrow(true)}>Why Olive Seeds</p>
            <h2 style={sectionHeading(true)}>Craftsmanship You Can Trust</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 28,
          }}>
            {WHY_US.map((item, i) => (
              <WhyCard key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          NEWSLETTER — DARK LUXURY
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: "#1B1510",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,167,125,0.1), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <p style={{ ...eyebrow(true), color: T.highlight }}>Stay Inspired</p>
          <h2 style={{
            fontFamily: T.headingFont, fontStyle: "italic",
            fontWeight: 300, fontSize: "clamp(30px, 5vw, 52px)",
            color: "#F6F3EE", lineHeight: 1.15, marginBottom: 16,
          }}>
            Design Inspiration &amp;<br />Exclusive Launches
          </h2>
          <p style={{
            fontFamily: T.bodyFont, fontSize: 15, color: "rgba(246,243,238,0.6)",
            lineHeight: 1.7, marginBottom: 36,
          }}>
            Join our community of design lovers. Be first to discover new collections,
            engraving techniques, and bespoke launch offers.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: "1 1 240px", maxWidth: 320,
                padding: "14px 20px",
                borderRadius: 50,
                border: `1px solid rgba(198,167,125,0.3)`,
                background: "rgba(255,255,255,0.06)",
                color: "#F6F3EE",
                fontFamily: T.bodyFont, fontSize: 14,
                outline: "none",
              }}
            />
            <button style={{
              padding: "14px 28px",
              borderRadius: 50,
              border: "none",
              background: T.highlight,
              color: "#1B1510",
              fontFamily: T.bodyFont, fontSize: 13,
              fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              flexShrink: 0,
            }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {/* ─── Inline responsive styles ─────────────────── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @media (min-width: 1024px) {
          .luxury-sidebar { display: flex !important; }
        }
        @media (max-width: 600px) {
          #product-grid > div > div[style*="grid-template-columns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function SidebarPanel({ title, children }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: "20px",
      boxShadow: "0 4px 20px rgba(27,27,27,0.04)",
    }}>
      <h3 style={{
        fontFamily: T.bodyFont, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: T.text, marginBottom: 14,
        paddingBottom: 12, borderBottom: `1px solid ${T.border}`,
      }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function SidebarBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "9px 12px",
        borderRadius: 10, border: "none",
        cursor: "pointer", width: "100%",
        fontFamily: T.bodyFont, fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? "#FFF8EC" : "transparent",
        color: active ? T.accent : T.textSec,
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}

const priceInputStyle = {
  flex: 1, padding: "10px 12px", borderRadius: 10,
  border: `1px solid ${T.border}`,
  fontFamily: "'Inter', sans-serif", fontSize: 13,
  color: "#1B1B1B", background: "#F6F3EE",
  outline: "none", width: "100%",
};

function CollectionCard({ col }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#F0EBE3" : T.card,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: "36px 28px",
        cursor: "pointer",
        transition: "all 0.35s ease",
        boxShadow: hov ? "0 16px 48px rgba(140,106,67,0.14)" : "0 4px 20px rgba(27,27,27,0.05)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <span style={{ fontSize: 36, display: "block", marginBottom: 16 }}>{col.emoji}</span>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: "italic", fontWeight: 600,
        fontSize: 22, color: "#1B1B1B", marginBottom: 8,
      }}>
        {col.title}
      </h3>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#66615B", lineHeight: 1.6 }}>
        {col.sub}
      </p>
      <div style={{
        marginTop: 20, display: "flex", alignItems: "center", gap: 6,
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
        color: "#8C6A43", letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        Explore <span style={{ fontSize: 14 }}>→</span>
      </div>
    </div>
  );
}

function MaterialCard({ mat }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#F0EBE3" : "#FAF8F5",
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        padding: "32px 24px",
        textAlign: "center",
        cursor: "default",
        transition: "all 0.3s ease",
        boxShadow: hov ? "0 12px 36px rgba(140,106,67,0.12)" : "none",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <span style={{ fontSize: 40, display: "block", marginBottom: 14 }}>{mat.emoji}</span>
      <h4 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: "italic", fontSize: 18, fontWeight: 600,
        color: "#1B1B1B", marginBottom: 6,
      }}>
        {mat.name}
      </h4>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12,
        color: "#66615B", lineHeight: 1.6,
      }}>
        {mat.desc}
      </p>
    </div>
  );
}

function WhyCard({ item }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: 18, alignItems: "flex-start",
        padding: "24px", borderRadius: 20,
        border: `1px solid ${hov ? "#C6A77D" : T.border}`,
        background: hov ? "#FFF8EC" : T.card,
        transition: "all 0.3s ease",
        boxShadow: hov ? "0 8px 32px rgba(198,167,125,0.15)" : "none",
      }}
    >
      <span style={{
        fontSize: 28, flexShrink: 0,
        width: 52, height: 52, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F0EBE3", borderRadius: 14,
      }}>
        {item.icon}
      </span>
      <div>
        <h4 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic", fontSize: 19, fontWeight: 600,
          color: "#1B1B1B", marginBottom: 6,
        }}>
          {item.title}
        </h4>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13,
          color: "#66615B", lineHeight: 1.7,
        }}>
          {item.desc}
        </p>
      </div>
    </div>
  );
}