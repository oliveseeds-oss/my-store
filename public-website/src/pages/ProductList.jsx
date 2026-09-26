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
import { 
  MdSearch, MdTune, MdStar, MdFavorite, MdFavoriteBorder, 
  MdShoppingBag, MdCheck, MdClose
} from "react-icons/md";

/* ─── Design Tokens ───────────────────────────────────────────────────── */
const T = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  text: "#181A18",
  textSec: "#676A65",
  accent: "#23483D",
  highlight: "#A48855",
  border: "#EAE4D6",
  hover: "#16352D",
  headingFont: "'Cormorant Garamond', Georgia, serif",
  bodyFont: "'DM Sans', sans-serif",
};

/* ─── Sort options ───────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "newest", label: "Featured" },
  { value: "rating", label: "Signature Works" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

/* ─── Badge / Curated Filter Tags (No Emojis / Smileys) ──────────────── */
const BADGE_FILTERS = [
  { id: "", name: "All Works" },
  { id: "Best Seller", name: "Signature Works" },
  { id: "New Arrival", name: "Recent Releases" },
  { id: "Limited Edition", name: "Limited Commissions" },
  { id: "Top Rated", name: "Private Reserve" },
  { id: "Staff Pick", name: "Studio Selection" },
];

/* ─── Product Card (High Luxury Atelier Styling) ─────────────────────── */
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
    e.stopPropagation();
    addToCart({
      ...p,
      type: "physical",
      price: finalPrice,
      original_price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: 4,
        border: `1px solid ${hovered ? "#C5A880" : "#EAE4D6"}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
        boxShadow: hovered
          ? "0 14px 32px rgba(20,25,22,0.06)"
          : "0 2px 8px rgba(20,25,22,0.02)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Image Frame */}
      <Link to={`/products/${p.id}`} style={{ display: "block", position: "relative", overflow: "hidden" }}>
        <div style={{ height: 240, width: "100%", background: "#FAF6EE", overflow: "hidden", position: "relative", flexShrink: 0 }}>
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
                transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: hovered ? "scale(1.06)" : "scale(1)",
                display: "block",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FAF6EE" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, color: "rgba(164, 136, 85, 0.4)", letterSpacing: "0.1em" }}>OS</span>
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "#A48855", fontWeight: 700, marginTop: 4 }}>Atelier Archive</span>
            </div>
          )}

          {/* Quick View Overlay Pill */}
          <div 
            style={{
              position: "absolute", bottom: 12, left: "50%", transform: `translateX(-50%) translateY(${hovered ? "0" : "8px"})`,
              opacity: hovered ? 1 : 0,
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(8px)",
              borderRadius: 3,
              border: "1px solid #EAE4D6",
              padding: "6px 16px",
              fontSize: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#23483D",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              transition: "all 0.25s ease",
            }}
          >
            Inspect Piece
          </div>
        </div>

        {/* Single Discreet Luxury Status Tag (No Clutter, No Emoji) */}
        {(discount > 0 || tags.length > 0) && (
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 5 }}>
            {discount > 0 ? (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "3px 8px",
                borderRadius: 2, background: "#23483D", color: "#FFFFFF",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em",
                textTransform: "uppercase"
              }}>
                Privilege · -{discount}%
              </span>
            ) : (
              <span style={{
                fontSize: 9, fontWeight: 600, padding: "3px 8px",
                borderRadius: 2, background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                border: "1px solid #EAE4D6", color: "#23483D",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em",
                textTransform: "uppercase"
              }}>
                {tags[0]}
              </span>
            )}
          </div>
        )}

        {/* Wishlist Button (Sleek Minimal SVG Icon) */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 25,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            border: "1px solid #EAE4D6", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            transition: "all 0.2s ease",
          }}
        >
          {isWishlisted ? (
            <MdFavorite className="text-rose-600 text-sm" />
          ) : (
            <MdFavoriteBorder className="text-stone-400 hover:text-stone-700 text-sm" />
          )}
        </button>
      </Link>

      {/* Card Body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        {p.category_name && (
          <p style={{
            fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.18em",
            color: "#A48855", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 5,
          }}>
            {p.category_name}
          </p>
        )}

        <Link to={`/products/${p.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500,
            fontSize: 19, lineHeight: 1.3,
            color: hovered ? "#23483D" : "#181A18",
            transition: "color 0.2s ease",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            minHeight: "2.6em",
            marginBottom: 6,
          }}>
            {p.name}
          </h3>
        </Link>

        {/* Quiet Price & Stock Row */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "auto", paddingTop: 10, borderTop: "1px solid #FAF6EE" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#181A18",
            }}>
              {convert(finalPrice)}
            </span>
            {p.discount_price && (
              <span style={{ fontSize: 12, textDecoration: "line-through", color: "#8A8D88" }}>
                {convert(p.price)}
              </span>
            )}
          </div>
          {p.stock <= 5 && p.stock > 0 && (
            <span style={{ fontSize: 9.5, color: "#A48855", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Limited Reserve
            </span>
          )}
        </div>

        {/* Clean Luxury Action Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
          <Link
            to={`/products/${p.id}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0",
              borderRadius: 3,
              border: "1px solid #EAE4D6",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              transition: "all 0.25s ease",
              background: "#FAF6EE",
              color: "#181A18",
            }}
            className="hover:bg-[#23483D] hover:text-white hover:border-[#23483D]"
          >
            Inspect Piece
          </Link>
          <button
            onClick={handleAdd}
            aria-label="Add to cart"
            title={added ? "Added to Order" : "Add to Order"}
            style={{
              padding: "10px 14px",
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: added ? "#16a34a" : "#23483D",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              shrink: 0,
            }}
          >
            {added ? <MdCheck className="text-sm" /> : <MdShoppingBag className="text-sm" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ProductList Component ──────────────────────────────────────── */
export default function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { member } = useMember();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
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

  /* Sync category & tag from URL search query or route parameter */
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

  const loadWishlist = useCallback(async () => {
    if (!member) {
      setWishlist([]);
      return;
    }
    try {
      const res = await API.get("/wishlist/my");
      if (Array.isArray(res.data)) {
        setWishlist(res.data.map((item) => String(item)));
      }
    } catch {
      // Guest mode
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
    const isWishlisted = wishlist.some((x) => String(x) === uidStr);
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

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    try {
      const [pRes, cRes] = await Promise.all([
        API.get(`/products?${params.toString()}`),
        API.get("/categories?type=physical"),
      ]);
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const ratingOptions = [4, 3, 2, 1];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.bodyFont }}>
      <SEO
        title="Bespoke Design Products | Olive Seeds Design Studio"
        description="Explore our curated collection of bespoke design products — custom corporate gifts, branded décor, and premium design objects for discerning B2B clients."
        keywords="bespoke design products, custom corporate gifts, branded décor, premium design objects, olive seeds design studio"
      />

      <Navbar />

      {/* ── Hero Showcase Section ── */}
      <section className="products-hero relative" style={{
        background: "#FFFFFF",
        borderBottom: `1px solid ${T.border}`,
        padding: "clamp(80px, 9vw, 120px) 24px clamp(60px, 7vw, 90px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle Warm Halo Decor */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-15%", right: "12%", width: 580, height: 580,
            borderRadius: "50%", background: "radial-gradient(circle, rgba(197, 168, 128, 0.16) 0%, transparent 70%)",
            pointerEvents: "none", zIndex: 1
          }}
        />

        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FAF6EE", border: `1px solid ${T.border}`,
              borderRadius: 4, padding: "6px 16px", marginBottom: 24,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: T.accent,
            }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
              Olive Seeds Atelier · Physical Editions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.headingFont, fontWeight: 400,
              fontSize: "clamp(38px, 5.5vw, 68px)", color: T.text,
              lineHeight: 1.12, letterSpacing: "-0.01em", marginBottom: 20,
            }}
          >
            The Physical Collection
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: T.bodyFont, fontSize: "clamp(15px, 1.8vw, 17px)",
              lineHeight: 1.8, color: T.textSec, maxWidth: 640,
              margin: "0 auto 36px", fontWeight: 400,
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
                padding: "14px 32px", background: T.accent, color: "#FFFFFF",
                border: "none", borderRadius: 4, fontFamily: T.bodyFont,
                fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
              }}
              className="hover:bg-[#16352D] shadow-sm hover:shadow"
            >
              Explore Catalog ↓
            </button>
            <Link
              to="/bulk-order"
              style={{
                padding: "14px 28px", background: "#FFFFFF", color: T.text,
                border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: T.bodyFont,
                fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", textDecoration: "none", display: "inline-flex",
                alignItems: "center", transition: "all 0.2s ease",
              }}
              className="hover:bg-[#FAF6EE]"
            >
              B2B &amp; Corporate Orders
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Ad Banner ── */}
      <div style={{ maxWidth: 1280, margin: "40px auto 48px", padding: "0 24px" }}>
        <AdBanner placement="Horizontal Banner" />
      </div>

      {/* ── Main Product Area (Sidebar + Grid) ── */}
      <section id="product-grid" style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px",
        display: "flex", gap: 32, alignItems: "flex-start",
      }}>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside style={{
          display: "none",
          width: 250, flexShrink: 0,
          position: "sticky", top: 88,
          maxHeight: "calc(100vh - 108px)",
          overflowY: "auto", overflowX: "hidden",
          overscrollBehavior: "contain",
          flexDirection: "column", gap: 16,
          paddingRight: 6,
          scrollbarWidth: "thin",
          scrollbarColor: "#C5A880 transparent",
        }}
          className="luxury-sidebar"
        >
          {/* Categories */}
          <SidebarPanel title="Categories">
            {[
              { id: "", name: "All Works" },
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
                  padding: "9px 12px", borderRadius: 4, border: "none",
                  cursor: "pointer", width: "100%",
                  fontFamily: T.bodyFont, fontSize: 12,
                  background: filters.minRating === r ? "#FAF6EE" : "transparent",
                  color: filters.minRating === r ? T.accent : T.textSec,
                  fontWeight: filters.minRating === r ? 700 : 400,
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <MdStar
                      key={i}
                      style={{
                        color: i <= r ? "#A48855" : "#EAE4D6",
                        fontSize: 14,
                      }}
                    />
                  ))}
                </div>
                <span>&amp; Above</span>
              </button>
            ))}
          </SidebarPanel>
        </aside>

        {/* ── PRODUCT MAIN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: 16, marginBottom: 28, flexWrap: "wrap",
          }}>
            <div>
              <h2 style={{
                fontFamily: T.headingFont,
                fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400,
                color: T.text, marginBottom: 4,
              }}>
                {filters.tag
                  ? `${filters.tag}`
                  : filters.category === "Best Sellers" || filters.category === "best-sellers"
                  ? "Signature Works"
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
                  placeholder="Search works…"
                  style={{
                    width: 240, padding: "10px 38px 10px 14px",
                    borderRadius: 4, border: `1px solid ${T.border}`,
                    fontFamily: T.bodyFont, fontSize: 13,
                    background: T.card, color: T.text,
                    outline: "none",
                  }}
                />
                <MdSearch style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.textSec, fontSize: 18, pointerEvents: "none" }} />
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
                  outline: "none", cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Mobile Filter Toggle Button */}
              <button
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 4, border: `1px solid ${T.border}`,
                  fontFamily: T.bodyFont, fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: T.card, color: T.text, cursor: "pointer",
                }}
              >
                <MdTune style={{ color: "#A48855", fontSize: 16 }} />
                <span>Filter &amp; Refine</span>
              </button>
            </div>
          </div>

          {/* Horizontal Badge & Collection Filter Pills */}
          <div className="category-pills-bar" style={{
            display: "flex", gap: "8px", overflowX: "auto",
            WebkitOverflowScrolling: "touch", paddingBottom: "14px",
            marginBottom: "24px", scrollbarWidth: "none",
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
                    display: "inline-flex", alignItems: "center",
                    padding: "8px 16px", borderRadius: "4px", fontSize: "12px",
                    fontWeight: isActive ? 700 : 500, fontFamily: T.bodyFont,
                    border: `1px solid ${isActive ? T.accent : T.border}`,
                    background: isActive ? T.accent : "#FAF6EE",
                    color: isActive ? "#FFFFFF" : T.text,
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  {badge.name}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="products-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24,
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  background: T.card, borderRadius: 4,
                  overflow: "hidden", border: `1px solid ${T.border}`,
                }}>
                  <div style={{ aspectRatio: "4/3", background: "#EDE8E0", animation: "pulse 1.5s infinite" }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 12, background: "#EDE8E0", borderRadius: 2, marginBottom: 10, width: "60%" }} />
                    <div style={{ height: 14, background: "#EDE8E0", borderRadius: 2, width: "80%" }} />
                    <div style={{ height: 38, background: "#F0EBE3", borderRadius: 2, marginTop: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{
              background: "#FAF6EE", borderRadius: 4, padding: "60px 20px",
              textAlign: "center", border: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 60, height: 60, margin: "0 auto 16px",
                borderRadius: "50%", border: "1px solid #EAE4D6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.headingFont, fontSize: 24, color: "#A48855"
              }}>
                OS
              </div>
              <h3 style={{ fontFamily: T.headingFont, fontSize: 26, color: T.text, marginBottom: 8 }}>
                No Pieces Found
              </h3>
              <p style={{ fontSize: "14px", color: T.textSec, fontFamily: T.bodyFont, maxWidth: 440, margin: "0 auto" }}>
                {filters.tag
                  ? `No creations currently catalogued under "${filters.tag}". Browse our complete collection archive.`
                  : filters.category
                  ? `No creations filed in "${filters.category}" at this time.`
                  : "Try resetting your search filter or exploring all pieces."}
              </p>
              {(filters.tag || filters.category || filters.search) && (
                <button
                  onClick={() => setFilters({ search: "", category: "", tag: "", sort: "newest", minPrice: "", maxPrice: "", minRating: "" })}
                  style={{
                    marginTop: 20, padding: "10px 24px",
                    borderRadius: 4, background: T.accent, color: "#fff",
                    border: "none", cursor: "pointer", fontFamily: T.bodyFont,
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase"
                  }}
                >
                  Reset Catalog Filters
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24,
            }}>
              {products.map((p) => {
                const pUid = String(p.product_uid || p.id);
                return (
                  <ProductCard
                    key={p.id}
                    p={p}
                    onWishlist={() => toggleWishlist(pUid)}
                    isWishlisted={wishlist.some((x) => String(x) === pUid)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Mobile Filters Drawer Overlay ── */}
      {showMobileFilters && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "flex-end"
        }}>
          <div style={{
            width: "320px", background: "#FFFFFF", height: "100%", overflowY: "auto",
            padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20,
            position: "relative", boxShadow: "-8px 0 32px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, pb: 12 }}>
              <h3 style={{ fontFamily: T.headingFont, fontSize: 24, fontWeight: 500, margin: 0, color: T.text }}>
                Filter Catalog
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                style={{
                  border: "none", background: "none", fontSize: 22, cursor: "pointer", color: T.text,
                }}
              >
                <MdClose />
              </button>
            </div>

            {/* Categories */}
            <SidebarPanel title="Categories">
              {[
                { id: "", name: "All Works" },
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
                    padding: "9px 12px", borderRadius: 4, border: "none",
                    cursor: "pointer", width: "100%",
                    fontFamily: T.bodyFont, fontSize: 12,
                    background: filters.minRating === r ? "#FAF6EE" : "transparent",
                    color: filters.minRating === r ? T.accent : T.textSec,
                    fontWeight: filters.minRating === r ? 700 : 400,
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MdStar
                        key={i}
                        style={{
                          color: i <= r ? "#A48855" : "#EAE4D6",
                          fontSize: 14,
                        }}
                      />
                    ))}
                  </div>
                  <span>&amp; Above</span>
                </button>
              ))}
            </SidebarPanel>
          </div>
        </div>
      )}

      {/* ── B2B Institutional Ordering Banner ── */}
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
              Corporate &amp; Institutional Commissions
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
              to="/bulk-order"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 32px",
                background: T.accent,
                color: "#FFFFFF",
                borderRadius: 4,
                fontFamily: T.bodyFont,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-[#16352D]"
            >
              Request Institutional Quote
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Inline Responsive Styles ── */}
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
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          align-items: stretch;
        }
        .luxury-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .luxury-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .luxury-sidebar::-webkit-scrollbar-thumb {
          background: #EAE4D6;
          border-radius: 4px;
        }
        @media (min-width: 1024px) {
          .luxury-sidebar { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .mobile-filter-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
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
        fontFamily: T.bodyFont, fontSize: 10, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: T.accent, marginBottom: 12,
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
        fontWeight: active ? 700 : 400,
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
