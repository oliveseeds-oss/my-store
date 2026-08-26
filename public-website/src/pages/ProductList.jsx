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
  { value: "newest", label: "Featured" },
  { value: "rating", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
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
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const img = p.image_url || (p.images && p.images[0]);
  const finalPrice = p.discount_price || p.price;
  const discount = p.discount_price
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
        borderRadius: 24,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.4s ease, transform 0.4s ease",
        boxShadow: hovered
          ? "0 24px 60px rgba(140,106,67,0.18)"
          : "0 4px 24px rgba(27,27,27,0.04)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Image */}
      <Link to={`/products/${p.id}`} style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <div style={{ aspectRatio: "1.3/1", background: "#F0EBE3", overflow: "hidden", position: "relative" }}>
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
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
          aria-label="Add to Wishlist"
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            opacity: 1,
            transition: "all 0.2s ease",
            transform: isWishlisted ? "scale(1.1)" : "scale(1)",
            color: isWishlisted ? "#e11d48" : "#64748b",
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
            padding: "10px 0",
            borderRadius: 100,
            border: "none",
            cursor: "pointer",
            fontFamily: T.bodyFont,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
            background: added
              ? "linear-gradient(135deg, #15803d, #16a34a)"
              : `linear-gradient(135deg, ${T.accent}, ${T.hover})`,
            color: "#fff",
            boxShadow: added
              ? "0 6px 16px rgba(34,197,94,0.25)"
              : `0 6px 16px rgba(140,106,67,0.2)`,
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [email, setEmail] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("category");
    if (cat) {
      setFilters(f => ({ ...f, category: cat }));
    }
  }, []);



  const loadWishlist = useCallback(async () => {
    try {
      const res = await API.get("/wishlist/my");
      if (Array.isArray(res.data)) {
        setWishlist(res.data.map(item => item.product_uid || item.id));
      }
    } catch {
      // Guest mode or not logged in
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const toggleWishlist = async (product_uid) => {
    const isWishlisted = wishlist.includes(product_uid);
    setWishlist((w) => isWishlisted ? w.filter((x) => x !== product_uid) : [...w, product_uid]);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${product_uid}`);
      } else {
        await API.post("/wishlist/add", { product_uid, product_type: "physical" });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const ratingOptions = [4, 3, 2, 1];

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
      <section className="products-hero" style={{
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
            Olive Seeds · Premium Collection
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
          AD BANNER
      ═══════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1280, margin: "40px auto 48px", padding: "0 24px" }}>
        <AdBanner placement="Horizontal Banner" />
      </div>



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

              {/* Mobile Filter Toggle */}
              <button
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12, border: `1px solid ${T.border}`,
                  fontFamily: T.bodyFont, fontSize: 13,
                  background: T.card, color: T.text,
                  cursor: "pointer",
                  display: "none",
                  boxShadow: "0 4px 16px rgba(27,27,27,0.05)",
                }}
              >
                🎛️ Filters
              </button>
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
                  onWishlist={() => toggleWishlist(p.product_uid || p.id)}
                  isWishlisted={wishlist.includes(p.product_uid || p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          NEWSLETTER — DARK LUXURY
      ═══════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(135deg, #0F2744 0%, #071524 100%)",
        padding: "clamp(60px, 6vw, 100px) 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,106,0.1), transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            background: "#081322",
            border: "2px solid #C9A86A",
            borderRadius: "32px",
            padding: "48px 32px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)"
          }}>
            <p style={{ ...eyebrow(true), color: "#C9A86A", marginBottom: "12px" }}>Stay Inspired</p>
            <h2 className="clash" style={{
              fontWeight: 400, fontSize: "clamp(28px, 4vw, 44px)",
              color: "#ffffff", lineHeight: 1.15, marginBottom: "16px",
            }}>
              Design Inspiration &amp;<br />Exclusive Launches
            </h2>
            <p style={{
              fontFamily: T.bodyFont, fontSize: "14px", color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7, marginBottom: "32px",
            }}>
              Join our community of design lovers. Be first to discover new collections,
              engraving techniques, and bespoke launch offers.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: "32px" }}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: "1 1 240px", maxWidth: "300px",
                  padding: "14px 20px",
                  borderRadius: 50,
                  border: `1px solid #C9A86A`,
                  background: "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  fontFamily: T.bodyFont, fontSize: 13,
                  outline: "none",
                }}
              />
              <button style={{
                padding: "14px 28px",
                borderRadius: 50,
                border: "none",
                background: "linear-gradient(135deg, #C9A86A 0%, #a87c3a 100%)",
                color: "#081322",
                fontFamily: T.bodyFont, fontSize: 12,
                fontWeight: 750, letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 8px 24px rgba(201,168,106,0.3)"
              }}>
                Subscribe
              </button>
            </div>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <Link to="/engraving#bulk-order" style={{
                display: "inline-flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #C9A86A 0%, #a87c3a 100%)",
                color: "#081322",
                fontSize: 12,
                fontWeight: 750,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 30px",
                borderRadius: 100,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(201,168,106,0.25)",
                transition: "all 0.3s ease",
              }}>
                Bulk Order Form
              </Link>
              <Link to="/engraving" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 750,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 30px",
                borderRadius: 100,
                border: `1.5px solid #C9A86A`,
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#C9A86A"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >
                Learn About Engraving
              </Link>
            </div>
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
            width: "300px", background: "#FAF8F5", height: "100%", overflowY: "auto",
            padding: "30px 24px", display: "flex", flexDirection: "column", gap: 20,
            position: "relative", boxShadow: "-8px 0 32px rgba(0,0,0,0.15)"
          }}>
            <button
              onClick={() => setShowMobileFilters(false)}
              style={{
                position: "absolute", top: 20, right: 20,
                border: "none", background: "none", fontSize: 24, cursor: "pointer",
                color: T.text
              }}
            >
              ×
            </button>
            <h3 style={{ fontFamily: T.headingFont, fontSize: 22, fontStyle: "italic", margin: "0 0 10px 0", color: T.text }}>Filters</h3>

            {/* Categories */}
            <SidebarPanel title="Categories">
              {[{ id: "", name: "All Products" }, ...categories].map((c) => (
                <SidebarBtn
                  key={c.id}
                  label={c.name}
                  active={filters.category === c.name || (!filters.category && c.id === "")}
                  onClick={() => { setFilter("category", c.id === "" ? "" : c.name); setShowMobileFilters(false); }}
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
                  onClick={() => { setFilter("minRating", filters.minRating === r ? "" : r); setShowMobileFilters(false); }}
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
          </div>
        </div>
      )}

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
        @media (max-width: 1023px) {
          .mobile-filter-btn { display: block !important; }
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

