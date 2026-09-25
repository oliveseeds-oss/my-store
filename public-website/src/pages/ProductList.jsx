import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { useMember } from "../context/MemberContext";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";
import { getProductMainImage } from "../utils/imageHelper";

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
  bg: "#FFFFFF",
  card: "#FFFFFF",
  text: "#181A18",
  textSec: "#676A65",
  accent: "#23483D",
  highlight: "#A48855",
  border: "#E7E7E2",
  hover: "#16352D",
  headingFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'DM Sans', sans-serif",
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
              color: i <= Math.round(rating) ? "#A48855" : "#E7E7E2",
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

  const img = getProductMainImage(p);
  const finalPrice = (p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < Number(p.price))
    ? Number(p.discount_price)
    : Number(p.price);
  const discount = (p.discount_price && Number(p.discount_price) < Number(p.price))
    ? Math.round((1 - Number(p.discount_price) / Number(p.price)) * 100)
    : 0;
  const tags = Array.isArray(p.tags) ? p.tags : [];

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart({
      ...p,
      type: "physical",
      price: finalPrice,
      original_price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        borderRadius: 4,
        border: `1px solid ${hovered ? "#CACCC6" : T.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
        boxShadow: hovered
          ? "0 12px 30px rgba(20,25,22,0.06)"
          : "0 2px 10px rgba(20,25,22,0.02)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Image */}
      <Link to={`/products/${p.id}`} style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <div className="product-card-image-wrap" style={{ height: 220, width: "100%", background: "#FAF6EE", overflow: "hidden", position: "relative", flexShrink: 0 }}>
          {img ? (
            <img
              src={img}
              alt={p.name}
              className="product-card-image"
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.6s ease",
                transform: hovered ? "scale(1.05)" : "scale(1)",
                display: "block",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 56 }}>🪵</span>
            </div>
          )}

          {/* Quick Preview pill */}
          {hovered && (
            <div style={{
              position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              borderRadius: 4,
              border: `1px solid ${T.border}`,
              padding: "6px 14px",
              fontSize: 11,
              fontFamily: T.bodyFont,
              fontWeight: 600,
              color: T.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}>
              Quick Preview
            </div>
          )}
        </div>

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexWrap: "wrap", gap: 6, zIndex: 10, maxWidth: "calc(100% - 54px)" }}>
          {discount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "3px 8px",
              borderRadius: 4, background: "#7f1d1d", color: "#fff",
              fontFamily: T.bodyFont, letterSpacing: "0.05em",
            }}>
              -{discount}% OFF
            </span>
          )}
          {tags.slice(0, 1).map((t) => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 700, padding: "3px 8px",
              borderRadius: 4, fontFamily: T.bodyFont, letterSpacing: "0.05em",
              background: "#FAF6EE",
              border: `1px solid ${T.border}`,
              color: T.accent,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Wishlist Button - minimum 44px tap target */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
          aria-label="Add to Wishlist"
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 25,
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${T.border}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.2s ease",
            color: isWishlisted ? "#e11d48" : "#64748b",
          }}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </Link>

      {/* Card Body */}
      <div className="product-card-content" style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        {p.category_name && (
          <p style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em",
            color: T.accent, fontFamily: T.bodyFont, fontWeight: 600, marginBottom: 6,
          }}>
            {p.category_name}
          </p>
        )}

        <Link to={`/products/${p.id}`} style={{ textDecoration: "none" }}>
          <h3 className="product-card-name" style={{
            fontFamily: T.headingFont, fontWeight: 600,
            fontSize: 17, lineHeight: 1.4,
            color: hovered ? T.accent : T.text,
            transition: "color 0.2s ease",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            minHeight: "2.8em",
            marginBottom: 10,
          }}>
            {p.name}
          </h3>
        </Link>

        <StarRating rating={p.rating} count={p.review_count} />

        {/* Badges row */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, padding: "3px 9px", borderRadius: 4,
            background: "#FAF6EE", color: T.accent, border: `1px solid ${T.border}`,
            fontFamily: T.bodyFont, fontWeight: 600, letterSpacing: "0.08em",
          }}>
            ✨ Precision-Marked
          </span>
          {tags.includes("Best Seller") && (
            <span style={{
              fontSize: 10, padding: "3px 9px", borderRadius: 4,
              background: "#FAF6EE", color: T.highlight, border: `1px solid ${T.border}`,
              fontFamily: T.bodyFont, fontWeight: 600, letterSpacing: "0.08em",
            }}>
              ⭐ Best Seller
            </span>
          )}
        </div>

        <div className="product-card-price" style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: "auto", paddingTop: 14 }}>
          <span style={{
            fontFamily: T.headingFont, fontSize: 24, fontWeight: 700, color: T.text,
          }}>
            {convert(finalPrice)}
          </span>
          {p.discount_price && (
            <span style={{ fontSize: 13, textDecoration: "line-through", color: "#8A8D88", marginBottom: 3 }}>
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
          className="product-card-button"
          style={{
            marginTop: 14,
            width: "100%",
            padding: "10px 0",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            fontFamily: T.bodyFont,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
            background: added ? "#16a34a" : T.accent,
            color: "#fff",
          }}
        >
          {added ? "✓ Added to Order" : "Add to Order"}
        </button>
      </div>
    </div>
  );
}

const BADGE_FILTERS = [
  { id: "", name: "All Products", icon: "✨" },
  { id: "Best Seller", name: "Best Seller", icon: "⭐" },
  { id: "New Arrival", name: "New Arrival", icon: "🆕" },
  { id: "Limited Edition", name: "Limited Edition", icon: "💎" },
  { id: "Top Rated", name: "Top Rated", icon: "★" },
  { id: "Flash Sale", name: "Flash Sale", icon: "⚡" },
  { id: "Staff Pick", name: "Staff Pick", icon: "🏷️" },
];

/* ─── Main Export ─────────────────────────────────────────────────────── */
export default function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { member } = useMember();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [email, setEmail] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    tag: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  /* ── Page Title & Meta ── */
  useEffect(() => {
    document.title = "Bespoke Design Products | Olive Seeds Design Studio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore our curated collection of bespoke design products — custom corporate gifts, branded décor, and premium design objects for discerning B2B clients.");
    }
  }, []);

  /* ── Sync category & tag from URL search query or route parameter ── */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const cat = slug || urlParams.get("category") || urlParams.get("category_id") || "";
    const isBestSeller = cat && ["best-sellers", "best-seller", "best sellers", "best seller"].includes(cat.toLowerCase());
    const tagParam = urlParams.get("tag") || (isBestSeller ? "Best Seller" : "");
    setFilters((f) => ({
      ...f,
      category: isBestSeller ? "" : cat,
      tag: tagParam,
      sort: isBestSeller ? "rating" : f.sort,
    }));
  }, [location.search, slug]);

  /* ── Data-loading logic ── */
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



  const loadWishlist = useCallback(async () => {
    if (!member) {
      setWishlist([]);
      return;
    }
    try {
      const res = await API.get("/wishlist/my");
      if (Array.isArray(res.data)) {
        setWishlist(res.data.map(item => String(item)));
      }
    } catch {
      // Guest mode or not logged in
    }
  }, [member]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const toggleWishlist = async (targetUid) => {
    if (!member) {
      navigate("/login");
      return;
    }
    const uidStr = String(targetUid);
    const isWishlisted = wishlist.some(x => String(x) === uidStr);
    setWishlist((w) => isWishlisted ? w.filter((x) => String(x) !== uidStr) : [...w, uidStr]);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${targetUid}`);
      } else {
        await API.post("/wishlist/add", { product_id: !isNaN(targetUid) ? parseInt(targetUid) : 0, product_uid: uidStr, product_type: "physical" });
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
        title="Bespoke Design Products | Olive Seeds Design Studio"
        description="Explore our curated collection of bespoke design products — custom corporate gifts, branded décor, and premium design objects for discerning B2B clients."
        keywords="bespoke design products, custom corporate gifts, branded décor, premium design objects, olive seeds design studio"
      />

      <Navbar />

      {/* ═══════════════════════════════════════════════════
          HERO SECTION (QUIET LUXURY ATELIER SHOWCASE)
      ═══════════════════════════════════════════════════ */}
      <section className="products-hero relative" style={{
        background: "#FFFFFF",
        borderBottom: `1px solid ${T.border}`,
        padding: "clamp(80px, 9vw, 120px) 24px clamp(60px, 7vw, 90px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient Warm Champagne Gold Glow Decoration with Motion */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.65, 0.4],
            x: [0, 25, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-15%",
            right: "12%",
            width: 580,
            height: 580,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, rgba(197, 168, 128, 0.04) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1
          }}
        />

        {/* Ambient Second Subtle Halo Bottom-Left */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
            y: [0, 20, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "5%",
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
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            position: "absolute",
            top: "18%",
            right: "10%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            border: "1px dashed rgba(197, 168, 128, 0.28)",
            pointerEvents: "none",
            zIndex: 1,
            display: "none",
          }}
          className="lg:block"
        >
          <div style={{
            position: "absolute",
            inset: 32,
            borderRadius: "50%",
            border: "1px solid rgba(197, 168, 128, 0.18)",
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

        {/* Clean, Serene, Uncluttered Editorial Content */}
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FAF6EE",
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              padding: "6px 16px",
              marginBottom: 24,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.accent,
            }}>
              <span style={{ color: "#C5A880" }}>✦</span>
              Olive Seeds Atelier · Physical Editions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.headingFont,
              fontWeight: 400,
              fontSize: "clamp(38px, 5.5vw, 68px)",
              color: T.text,
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
              marginBottom: 20,
            }}
          >
            The Physical Collection
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.bodyFont,
              fontSize: "clamp(15px, 1.8vw, 17px)",
              lineHeight: 1.8,
              color: T.textSec,
              maxWidth: 640,
              margin: "0 auto 36px",
              fontWeight: 400,
            }}
          >
            Curated objects of enduring presence and tactile weight — hand-finished in organic hardwoods, optical acrylic, and precious metals for discerning brands and private collectors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
          >
            <button
              onClick={() => {
                setFilters((f) => ({ ...f, category: "", sort: "newest" }));
                document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "14px 32px",
                background: T.accent,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 4,
                fontFamily: T.bodyFont,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-[#16352D] shadow-sm hover:shadow"
            >
              Explore Catalog ↓
            </button>
            <Link
              to="/bulk-order"
              style={{
                padding: "14px 28px",
                background: "#FFFFFF",
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 4,
                fontFamily: T.bodyFont,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-[#FAF6EE]"
            >
              B2B &amp; Corporate Orders
            </Link>
          </motion.div>
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
          width: 250, flexShrink: 0,
          position: "sticky", top: 88,
          maxHeight: "calc(100vh - 108px)",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          flexDirection: "column", gap: 16,
          paddingRight: 6,
          scrollbarWidth: "thin",
          scrollbarColor: "#C6A77D transparent",
        }}
          className="luxury-sidebar"
        >
          {/* Categories */}
          <SidebarPanel title="Categories">
            {[
              { id: "", name: "All Products" },
              ...categories,
            ].map((c) => {
              const isAllOption = c.id === "";
              const isActive = isAllOption
                ? (!filters.category)
                : filters.category === c.name;
              return (
                <SidebarBtn
                  key={c.id || "all"}
                  label={c.name}
                  active={isActive}
                  onClick={() => {
                    setFilters((f) => ({ ...f, category: isAllOption ? "" : c.name, sort: isAllOption ? "newest" : f.sort }));
                  }}
                />
              );
            })}
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
                {filters.tag
                  ? `${filters.tag} Objects`
                  : filters.category === "Best Sellers" || filters.category === "best-sellers"
                  ? "⭐ Best Selling Pieces"
                  : filters.category || "The Collection"}
              </h2>
              <p style={{ fontFamily: T.bodyFont, fontSize: 13, color: T.textSec }}>
                {loading ? "Loading collection…" : `${products.length} bespoke pieces available`}
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
                    width: 240, padding: "10px 36px 10px 14px",
                    borderRadius: 4, border: `1px solid ${T.border}`,
                    fontFamily: T.bodyFont, fontSize: 13,
                    background: T.card, color: T.text,
                    outline: "none",
                  }}
                />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.textSec, fontSize: 13 }}>🔍</span>
              </div>

              {/* Sort */}
              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 4, border: `1px solid ${T.border}`,
                  fontFamily: T.bodyFont, fontSize: 13,
                  background: T.card, color: T.text,
                  outline: "none",
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
                  padding: "10px 14px",
                  borderRadius: 4, border: `1px solid ${T.border}`,
                  fontFamily: T.bodyFont, fontSize: 13,
                  background: T.card, color: T.text,
                  cursor: "pointer",
                  display: "none",
                }}
              >
                🎛️ Filters
              </button>
            </div>
          </div>

          {/* Horizontal Badge & Collection Filter Pills (corner round buttons) */}
          <div className="category-pills-bar" style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "14px",
            marginBottom: "24px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {BADGE_FILTERS.map((badge) => {
              const isActive = (!filters.tag && !badge.id) || filters.tag === badge.id;
              return (
                <button
                  key={badge.id || "all"}
                  onClick={() => {
                    setFilters((f) => ({
                      ...f,
                      tag: f.tag === badge.id ? "" : badge.id,
                      sort: badge.id === "Best Seller" ? "rating" : f.sort,
                    }));
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: T.bodyFont,
                    border: `1px solid ${isActive ? T.accent : T.border}`,
                    background: isActive ? "#FAF6EE" : T.card,
                    color: isActive ? T.accent : T.textSec,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="products-grid" style={{
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
              background: T.card, borderRadius: 20, padding: "60px 20px",
              textAlign: "center", border: `1px solid ${T.border}`,
              color: "#888",
            }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🪵</p>
              <p style={{ fontFamily: T.headingFont, fontStyle: "italic", fontSize: 26, color: T.text, marginBottom: 8 }}>
                No Products Found
              </p>
              <p style={{ fontSize: "1.1rem", color: "#888", fontFamily: T.bodyFont }}>
                {filters.tag
                  ? `No products found under "${filters.tag}" right now. Try another filter or browse all products.`
                  : filters.category === "Best Sellers" || filters.category === "best-sellers"
                  ? "No best seller products found right now. Check back soon or browse all collections."
                  : filters.category
                  ? `No products found in "${filters.category}" yet.`
                  : "Try adjusting your filters or browse all products."}
              </p>
              {(filters.tag || filters.category) && (
                <button
                  onClick={() => setFilters(f => ({ ...f, tag: "", category: "", search: "" }))}
                  style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    borderRadius: 50,
                    background: T.accent,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: T.bodyFont
                  }}
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}>
              {products.map((p) => {
                const pUid = String(p.product_uid || p.id);
                return (
                  <ProductCard
                    key={p.id}
                    p={p}
                    onWishlist={() => toggleWishlist(pUid)}
                    isWishlisted={wishlist.some(x => String(x) === pUid)}
                  />
                );
              })}
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
            <p style={{ ...eyebrow(true), color: "#C9A86A", marginBottom: "12px" }}>B2B &amp; Volume Orders</p>
            <h2 className="clash" style={{
              fontWeight: 400, fontSize: "clamp(28px, 4vw, 44px)",
              color: "#ffffff", lineHeight: 1.15, marginBottom: "16px",
            }}>
              Ordering for Your Organisation?
            </h2>
            <p style={{
              fontFamily: T.bodyFont, fontSize: "14px", color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7, marginBottom: "32px",
            }}>
              We work directly with corporate procurement teams, interior design studios, and event agencies. Tiered pricing, custom branding, and dedicated production management available.
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
              <Link to="/contact" style={{
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
                Request a B2B Quote
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
                Learn About Our Craft
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
              {[
                { id: "", name: "All Products" },
                { id: "best-sellers", name: "⭐ Best Sellers" },
                ...categories,
              ].map((c) => {
                const isBestSellerOption = c.id === "best-sellers";
                const isAllOption = c.id === "";
                const isActive = isBestSellerOption
                  ? (filters.category === "Best Sellers" || filters.category === "best-sellers")
                  : isAllOption
                  ? (!filters.category)
                  : filters.category === c.name;
                return (
                  <SidebarBtn
                    key={c.id || "all"}
                    label={c.name}
                    active={isActive}
                    onClick={() => {
                      if (isBestSellerOption) {
                        setFilters((f) => ({ ...f, category: "Best Sellers", sort: "rating" }));
                      } else {
                        setFilters((f) => ({ ...f, category: isAllOption ? "" : c.name, sort: isAllOption ? "newest" : f.sort }));
                      }
                      setShowMobileFilters(false);
                    }}
                  />
                );
              })}
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

      {/* ─── B2B Ordering Strip ─── */}
      <section style={{
        background: "#FAF6EE",
        color: T.text,
        padding: "60px 24px",
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ maxWidth: 720 }}>
            <span style={{
              fontFamily: T.bodyFont,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.accent,
              display: "block",
              marginBottom: 8,
            }}>
              Corporate & Institutional
            </span>
            <h2 style={{
              fontFamily: T.headingFont,
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 400,
              color: T.text,
              marginBottom: 12,
            }}>
              Ordering for Your Organisation?
            </h2>
            <p style={{
              fontFamily: T.bodyFont,
              fontSize: 15,
              lineHeight: 1.75,
              color: T.textSec,
            }}>
              We welcome B2B enquiries for bulk, corporate, and institutional orders. Whether you require 50 pieces or 5,000 — our studio manages production, customisation, and delivery with the same precision applied to every individual commission.
            </p>
          </div>
          <div>
            <Link
              to="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 32px",
                background: T.accent,
                color: "#FFFFFF",
                borderRadius: 4,
                fontFamily: T.bodyFont,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              Request a B2B Quote
            </Link>
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
        .category-pills-bar::-webkit-scrollbar {
          display: none;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          align-items: stretch;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .luxury-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .luxury-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .luxury-sidebar::-webkit-scrollbar-thumb {
          background: #DADCD7;
          border-radius: 4px;
        }
        @media (min-width: 1024px) {
          .luxury-sidebar { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .mobile-filter-btn { display: block !important; }
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .product-card-image-wrap {
            height: 180px !important;
          }
          .product-card-content {
            padding: 12px !important;
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
      borderRadius: 4,
      border: `1px solid ${T.border}`,
      padding: "18px",
    }}>
      <h3 style={{
        fontFamily: T.bodyFont, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.15em", textTransform: "uppercase",
        color: T.text, marginBottom: 12,
        paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
      }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
        textAlign: "left", padding: "8px 10px",
        borderRadius: 4, border: "none",
        cursor: "pointer", width: "100%",
        fontFamily: T.bodyFont, fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? "#FAF6EE" : "transparent",
        color: active ? T.accent : T.textSec,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

const priceInputStyle = {
  flex: 1, padding: "8px 10px", borderRadius: 4,
  border: `1px solid ${T.border}`,
  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
  color: "#181A18", background: "#FFFFFF",
  outline: "none", width: "100%",
};

