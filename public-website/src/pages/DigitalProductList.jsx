import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";
import { getProductMainImage } from "../utils/imageHelper";
import { 
  MdSearch, MdTune, MdStar, MdFavorite, MdFavoriteBorder, 
  MdShoppingBag, MdCheck, MdClose
} from "react-icons/md";

const SORT_OPTIONS = [
  { value: "newest", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const COLLECTIONS = [
  {
    numeral: "I",
    title: "UI/UX & Mobile App Systems",
    desc: "Multi-platform Figma design kits, responsive design tokens, and iOS/Android app architectures crafted for visionary tech and consumer brands.",
    category: "UI/UX Kits",
  },
  {
    numeral: "II",
    title: "Brand Identity Frameworks",
    desc: "Complete visual identity guidelines, master logo systems, typographic proportion grids, and comprehensive corporate brand manuals.",
    category: "Brand Identity Kits",
  },
  {
    numeral: "III",
    title: "Website & Landing Page Templates",
    desc: "Production-ready Framer, Webflow, and React/Tailwind architectures optimized for blistering speed, luxury aesthetics, and high conversion.",
    category: "Website Templates",
  },
  {
    numeral: "IV",
    title: "3D Models & Render Scenes",
    desc: "Photorealistic 3D assets, OBJ/FBX geometry, studio lighting environments, and Blender master setups for hyper-realistic visual staging.",
    category: "3D Models",
  },
  {
    numeral: "V",
    title: "AI Agent Templates & Workflows",
    desc: "Orchestrated AI prompt architectures, autonomous agent blueprints, and modular workflow automations engineered for modern creative teams.",
    category: "AI Agent Templates",
  },
  {
    numeral: "VI",
    title: "Digital Printables & Creative Assets",
    desc: "High-resolution architectural art prints, minimalist planner suites, vector icon kits, and bespoke graphic toolkits ready for immediate deployment.",
    category: "Digital Printables",
  },
];

/* ─── Digital Product Card (No Overlap & Quiet Luxury) ─────────── */
function DigitalCard({ p, onWishlist, isWishlisted }) {
  const { addToCart } = useCart();
  const { convert } = useCurrency();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const img = getProductMainImage(p);
  const finalPrice = (p.discount_price !== null && p.discount_price !== undefined && p.discount_price !== "")
    ? Number(p.discount_price)
    : Number(p.price || 0);
  const discount = (p.discount_price && p.price)
    ? Math.round((1 - p.discount_price / p.price) * 100)
    : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...p,
      price: finalPrice,
      original_price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null,
      type: "digital"
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const formatBadge = p.file_format || (Array.isArray(p.tags) && p.tags[0]) || "DIGITAL ASSET";

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[4px] overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Image Preview */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-[#FAF6EE] overflow-hidden border-b border-[#EAE4D6]/70">
        <Link to={`/digital/${p.id}`} className="block w-full h-full">
          {img ? (
            <img 
              src={img} 
              alt={p.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              loading="lazy" 
              decoding="async" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#23483D] bg-[#FAF6EE] p-4 text-center">
              <div className="w-12 h-12 rounded-full border border-[#A48855]/40 flex flex-col items-center justify-center bg-white shadow-2xs mb-2">
                <span className="font-serif text-lg font-bold tracking-widest text-[#A48855]">OS</span>
              </div>
              <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "#A48855", fontWeight: 700 }}>Digital Vault</span>
            </div>
          )}
        </Link>

        {/* Discreet Micro-Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-bold tracking-[0.14em] uppercase bg-white/95 backdrop-blur-md text-[#23483D] border border-[#EAE4D6] shadow-2xs">
            {formatBadge}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlist();
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md border border-[#EAE4D6] shadow-2xs cursor-pointer transition hover:scale-105"
        >
          {isWishlisted ? (
            <MdFavorite className="text-rose-600 text-sm" />
          ) : (
            <MdFavoriteBorder className="text-stone-400 hover:text-stone-700 text-sm" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {p.category_name && (
            <p className="text-[9.5px] uppercase font-bold tracking-[0.18em] text-[#A48855] truncate mb-1">
              {p.category_name}
            </p>
          )}

          <Link to={`/digital/${p.id}`} className="block">
            <h3 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className={`text-base sm:text-lg font-medium transition line-clamp-2 leading-snug min-h-[2.8em] break-words ${
                hovered ? "text-[#23483D]" : "text-[#1C2B26]"
              }`}
            >
              {p.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Acquisition Bar (Stack vertically on mobile to prevent ANY text collision) */}
        <div className="pt-2 border-t border-[#EAE4D6]/60 flex flex-col gap-2 mt-auto">
          <div className="flex items-baseline justify-between">
            <span 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className="text-lg sm:text-xl font-bold text-[#1C2B26]"
            >
              {convert(finalPrice)}
            </span>
            {discount > 0 && (
              <span className="text-[11px] text-stone-400 line-through">
                {convert(p.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full">
            <Link
              to={`/digital/${p.id}`}
              className="flex-1 py-2 text-center text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase rounded-[3px] border border-[#EAE4D6] bg-[#FAF6EE] text-[#1C2B26] hover:bg-[#23483D] hover:text-white hover:border-[#23483D] transition duration-300"
            >
              Inspect
            </Link>
            <button
              onClick={handleAdd}
              aria-label="Add digital asset to order"
              className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase rounded-[3px] transition shadow-xs cursor-pointer flex items-center justify-center shrink-0 ${
                added 
                  ? "bg-[#16a34a] text-white" 
                  : "bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D]"
              }`}
              title="Add to Order"
            >
              {added ? <MdCheck className="text-xs" /> : <MdShoppingBag className="text-xs" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Main DigitalProductList ──────────────────────────────────── */
export default function DigitalProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { member } = useMember();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
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

  /* Sync category from URL search query or route parameter */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const cat = slug || urlParams.get("category") || urlParams.get("category_id") || "";
    setFilters((f) => ({ ...f, category: cat }));
  }, [location.search, slug]);

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
      // Guest mode
    }
  }, [member]);

  const toggleWishlist = async (targetUid) => {
    if (!member) {
      navigate("/login");
      return;
    }
    const uidStr = String(targetUid);
    const isWishlisted = wishlist.some(x => String(x) === uidStr);
    setWishlist((w) => isWishlisted ? w.filter((x) => String(x) !== uidStr) : [...w, targetUid]);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${targetUid}`);
      } else {
        await API.post("/wishlist/add", { product_uid: uidStr, product_type: "digital" });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try {
      const [r, c] = await Promise.all([
        API.get(`/digital-products?${params.toString()}`),
        API.get("/categories?type=digital"),
      ]);
      setProducts(Array.isArray(r.data) ? r.data : []);
      setCategories(Array.isArray(c.data) ? c.data : []);
    } catch (err) {
      console.error("Failed to load digital assets:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); loadWishlist(); }, [load, loadWishlist]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const ratingOptions = [4, 3, 2, 1];

  /* Custom project brief form */
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
    <div className="min-h-screen flex flex-col bg-white" style={{ color: "#1C2B26", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO
        title="Digital Design Vault — UI/UX, Web Templates, 3D & AI Systems | Olive Seeds"
        description="Acquire bespoke UI/UX design kits, website & mobile app templates, brand identity frameworks, 3D models, AI agent templates, and digital printables by Olive Seeds."
        keywords="ui ux kits, website templates, mobile app ui, brand identity kits, 3d models, ai agent templates, digital printables, figma design systems"
      />
      <Navbar />

      {/* ── Masthead Hero ── */}
      <section className="relative border-b border-[#EAE4D6] overflow-hidden" style={{ background: "#FAF6EE" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#A48855]">
                Digital Design Vault · Olive Seeds
              </span>
            </div>

            <h1 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className="text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1C2B26] tracking-tight leading-[1.08] mb-4"
            >
              UI/UX Systems, Brand Kits, Templates &amp; Digital Assets
            </h1>

            <p className="text-sm sm:text-base text-[#6B7C75] leading-relaxed max-w-2xl mb-8">
              Curated executive digital assets — from production-ready UI/UX design systems, website and mobile app templates, to studio 3D models, AI agent workflows, brand identity suites, and digital printables. Engineered for discerning studios, founders, and collectors.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("vault-archive");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-bold tracking-[0.12em] uppercase rounded-[4px] transition shadow-sm cursor-pointer"
              >
                Explore Digital Vault ↓
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("commission-brief");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-white hover:bg-stone-50 border border-[#EAE4D6] text-[#1C2B26] text-xs font-bold tracking-[0.12em] uppercase rounded-[4px] transition cursor-pointer"
              >
                Custom Digital Commission
              </button>
            </div>
          </div>

          {/* 3 Value Pillars */}
          <div className="mt-12 pt-8 border-t border-[#EAE4D6] grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">01</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Production-Grade Architecture</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Crafted in Figma, Framer, Webflow, React, and 3D master formats with clean token structures.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">02</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Perpetual Commercial Rights</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Unrestricted use across private, client, and commercial venture deployments.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">03</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Instant Cloud Release</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Immediate vault access upon checkout with lifetime re-download authorization.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Banner Ad ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <AdBanner placement="Horizontal Banner" />
      </div>

      {/* ── Main Vault Archive Section (Sidebar + Grid) ── */}
      <section id="vault-archive" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex gap-8 items-start">
        
        {/* ── DESKTOP LUXURY SIDEBAR (Restored Full Filtering) ── */}
        <aside 
          style={{
            width: 250, flexShrink: 0,
            position: "sticky", top: 88,
            maxHeight: "calc(100vh - 108px)",
            overflowY: "auto", overflowX: "hidden",
            overscrollBehavior: "contain",
            display: "none",
            flexDirection: "column", gap: 16,
            scrollbarWidth: "thin",
            scrollbarColor: "#C5A880 transparent",
          }}
          className="luxury-sidebar"
        >
          {/* Categories */}
          <div className="bg-white border border-[#EAE4D6] rounded-[4px] p-4">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-2 border-b border-[#EAE4D6]">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFilter("category", "")}
                className={`text-left px-2.5 py-1.5 rounded-[3px] text-xs transition cursor-pointer ${
                  !filters.category ? "bg-[#FAF6EE] text-[#23483D] font-bold" : "text-[#6B7C75] hover:text-[#1C2B26]"
                }`}
              >
                All Digital Assets
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilter("category", c.name)}
                  className={`text-left px-2.5 py-1.5 rounded-[3px] text-xs transition cursor-pointer ${
                    filters.category === c.name ? "bg-[#FAF6EE] text-[#23483D] font-bold" : "text-[#6B7C75] hover:text-[#1C2B26]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-white border border-[#EAE4D6] rounded-[4px] p-4">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-2 border-b border-[#EAE4D6]">
              Price Range
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[3px] px-2.5 py-1.5 text-xs text-[#1C2B26] outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[3px] px-2.5 py-1.5 text-xs text-[#1C2B26] outline-none"
              />
            </div>
          </div>

          {/* Customer Rating */}
          <div className="bg-white border border-[#EAE4D6] rounded-[4px] p-4">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-2 border-b border-[#EAE4D6]">
              Customer Rating
            </h3>
            <div className="flex flex-col gap-1.5">
              {ratingOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter("minRating", filters.minRating === r ? "" : r)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-xs transition cursor-pointer text-left ${
                    filters.minRating === r ? "bg-[#FAF6EE] text-[#23483D] font-bold" : "text-[#6B7C75]"
                  }`}
                >
                  <div className="flex gap-1 text-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <MdStar
                        key={i}
                        className={i <= r ? "text-[#A48855]" : "text-[#EAE4D6]"}
                      />
                    ))}
                  </div>
                  <span>&amp; Above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Product Catalog Main Content ── */}
        <div className="flex-1 min-w-0">
          
          {/* Top Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block">
                Atelier Catalog
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-medium text-[#1C2B26]">
                {filters.category || "All Digital Assets"}
              </h2>
              <p className="text-xs text-[#6B7C75] mt-0.5">
                {loading ? "Accessing vault..." : `${products.length} authenticated assets available`}
              </p>
            </div>

            {/* Search Input, Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  placeholder="Search UI kits, templates, 3D, branding..."
                  className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2 text-xs focus:outline-none text-[#1C2B26]"
                />
                <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none" />
              </div>

              <select
                value={filters.sort}
                onChange={(e) => setFilter("sort", e.target.value)}
                className="bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* Mobile Filter Button */}
              <button
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 4, border: "1px solid #EAE4D6",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "#FAF6EE", color: "#1C2B26", cursor: "pointer",
                }}
              >
                <MdTune className="text-sm text-[#A48855]" />
                <span>Filter &amp; Refine</span>
              </button>
            </div>
          </div>

          {/* Horizontal Category Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 pb-3 mb-6 scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {[{ id: "", name: "All Works" }, ...categories].map((c) => {
              const isActive = filters.category === c.name || (!filters.category && c.id === "");
              return (
                <button
                  key={c.id || "all"}
                  onClick={() => setFilter("category", c.id === "" ? "" : c.name)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-[4px] text-xs transition cursor-pointer shrink-0 font-medium ${
                    isActive
                      ? "bg-[#23483D] text-[#FAF6EE] shadow-xs font-semibold"
                      : "bg-[#FAF6EE] text-[#6B7C75] hover:text-[#1C2B26] border border-[#EAE4D6]"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* ── Product Grid (Guaranteed No Overlap on Mobile) ── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-[#EAE4D6] rounded-[4px] overflow-hidden bg-white animate-pulse">
                  <div className="aspect-[4/3] bg-stone-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-stone-200 rounded w-1/3" />
                    <div className="h-3.5 bg-stone-200 rounded w-4/5" />
                    <div className="h-6 bg-stone-200 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-16 text-center bg-[#FAF6EE]/40">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full border border-[#EAE4D6] bg-white flex items-center justify-center font-serif text-lg text-[#A48855]">
                OS
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26]">
                No Assets Found
              </h3>
              <p className="text-xs text-[#6B7C75] mt-1.5 max-w-sm mx-auto">
                {filters.category
                  ? `No assets currently filed under "${filters.category}". Explore our complete vault archive.`
                  : "No matching digital designs or templates found. Try resetting your search filter."}
              </p>
              <button
                onClick={() => setFilters({ search: "", category: "", sort: "newest", minPrice: "", maxPrice: "", minRating: "" })}
                className="mt-5 px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider rounded-[4px] hover:bg-[#16352D] transition cursor-pointer"
              >
                Reset Vault Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((p) => (
                <DigitalCard
                  key={p.id}
                  p={p}
                  onWishlist={() => toggleWishlist(p.product_uid || p.id)}
                  isWishlisted={wishlist.includes(String(p.product_uid || p.id))}
                />
              ))}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EAE4D6", paddingBottom: 12 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, margin: 0, color: "#1C2B26" }}>
                Filter Digital Vault
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "#1C2B26" }}
              >
                <MdClose />
              </button>
            </div>

            {/* Categories */}
            <div className="bg-[#FAF6EE]/50 border border-[#EAE4D6] rounded-[4px] p-4">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-1.5 border-b border-[#EAE4D6]">
                Categories
              </h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setFilter("category", ""); setShowMobileFilters(false); }}
                  className={`text-left px-2.5 py-1.5 rounded-[3px] text-xs transition ${
                    !filters.category ? "bg-[#23483D] text-white font-bold" : "text-[#6B7C75]"
                  }`}
                >
                  All Digital Assets
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setFilter("category", c.name); setShowMobileFilters(false); }}
                    className={`text-left px-2.5 py-1.5 rounded-[3px] text-xs transition ${
                      filters.category === c.name ? "bg-[#23483D] text-white font-bold" : "text-[#6B7C75]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-[#FAF6EE]/50 border border-[#EAE4D6] rounded-[4px] p-4">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-1.5 border-b border-[#EAE4D6]">
                Price Range
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter("minPrice", e.target.value)}
                  className="w-full bg-white border border-[#EAE4D6] rounded-[3px] px-2.5 py-1.5 text-xs text-[#1C2B26] outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter("maxPrice", e.target.value)}
                  className="w-full bg-white border border-[#EAE4D6] rounded-[3px] px-2.5 py-1.5 text-xs text-[#1C2B26] outline-none"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="bg-[#FAF6EE]/50 border border-[#EAE4D6] rounded-[4px] p-4">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#23483D] mb-3 pb-1.5 border-b border-[#EAE4D6]">
                Customer Rating
              </h4>
              <div className="flex flex-col gap-1.5">
                {ratingOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setFilter("minRating", filters.minRating === r ? "" : r); setShowMobileFilters(false); }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-xs transition text-left ${
                      filters.minRating === r ? "bg-[#23483D] text-white font-bold" : "text-[#6B7C75]"
                    }`}
                  >
                    <div className="flex gap-1 text-sm">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <MdStar
                          key={i}
                          className={i <= r ? "text-[#A48855]" : "text-[#EAE4D6]"}
                        />
                      ))}
                    </div>
                    <span>&amp; Above</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Curated Vaults (Roman Numerals, No Emojis) ── */}
      <section className="border-t border-[#EAE4D6] py-14 sm:py-18 bg-[#FAF6EE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
              Curated Disciplines
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl font-normal text-[#1C2B26]">
              Atelier Specialized Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7C75] mt-2">
              Each discipline contains tokenized hierarchies, responsive layouts, and layered production source archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COLLECTIONS.map((col) => (
              <div 
                key={col.title}
                onClick={() => setFilter("category", col.category)}
                className="group bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[4px] p-6 transition duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="font-serif text-2xl font-bold text-[#A48855] block mb-2 group-hover:scale-105 transition-transform">
                    {col.numeral}.
                  </span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    {col.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center justify-between text-xs font-semibold text-[#23483D]">
                  <span>Filter Discipline</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* White Glove Digital Assurance */}
          <div className="mt-10 p-5 sm:p-6 bg-white border border-[#EAE4D6] rounded-[4px] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-xs">
            <div className="w-12 h-12 rounded-full border border-[#EAE4D6] bg-[#FAF6EE] flex items-center justify-center font-serif text-lg text-[#23483D] shrink-0">
              OS
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Studio File Integrity &amp; Verification</h4>
              <p className="text-xs text-[#6B7C75] mt-0.5 leading-relaxed">
                All digital deliverables are SHA-256 integrity-verified, uncompressed, and backed by lifetime re-downloads directly from your private Client Atelier.
              </p>
            </div>
            <Link 
              to="/profile?tab=digital" 
              className="shrink-0 px-4 py-2 border border-[#23483D] text-[#23483D] hover:bg-[#23483D] hover:text-white text-xs font-bold tracking-[0.1em] rounded-[4px] transition uppercase"
            >
              Your Vault
            </Link>
          </div>

        </div>
      </section>

      {/* ── Custom Commission Brief Section ── */}
      <section id="commission-brief" className="border-t border-[#EAE4D6] py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Brief Context */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
                  Bespoke Digital Engineering
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl font-normal text-[#1C2B26] leading-tight">
                  Commission Custom UI/UX, Web, 3D, or AI Systems
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7C75] mt-3 leading-relaxed">
                  Require an enterprise design system, high-converting digital storefront, tailored 3D scene, or proprietary AI agent workflow? Our creative directors and technical architects accept select private commissions.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { id: "01", title: "Direct Director Review", desc: "Every project brief is personally assessed within 24 hours." },
                  { id: "02", title: "Mutual Confidentiality", desc: "Standard NDA protection furnished prior to schematic disclosure." },
                  { id: "03", title: "Framework Fidelity", desc: "Files delivered in Figma tokens, clean React/Webflow code, 3D FBX/OBJ, and vector master assets." }
                ].map((item) => (
                  <div key={item.id} className="flex gap-3.5 items-start">
                    <span className="font-mono text-xs font-bold text-[#A48855] p-2 bg-[#FAF6EE] rounded-[4px] border border-[#EAE4D6] shrink-0">{item.id}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2B26] uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-[#6B7C75] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Brief Form */}
            <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#EAE4D6] p-6 sm:p-8 rounded-[4px] shadow-xs">
              {success ? (
                <div className="text-center py-12 space-y-3">
                  <span className="w-12 h-12 mx-auto rounded-full bg-[#23483D] text-white flex items-center justify-center text-xl font-bold">✓</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26]">
                    Commission Brief Transmitted
                  </h3>
                  <p className="text-xs text-[#6B7C75] max-w-md mx-auto leading-relaxed">
                    Thank you. Your project brief has been logged with our studio director. We will review your technical requirements and contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Principal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Enterprise / Practice *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Architecture Ltd."
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Correspondence Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jane@practice.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Telephone Line
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Discipline *
                      </label>
                      <select
                        required
                        value={form.project_type}
                        onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3 py-2.5 text-xs focus:outline-none text-[#1C2B26] cursor-pointer"
                      >
                        <option value="">Select scope...</option>
                        <option>UI/UX Design System &amp; Mobile App</option>
                        <option>Luxury Website &amp; Webflow/React Architecture</option>
                        <option>Brand Identity Kit &amp; Corporate Guidelines</option>
                        <option>Custom 3D Model &amp; Photorealistic Scene</option>
                        <option>AI Agent Template &amp; Workflow Automation</option>
                        <option>Bespoke Digital Printables &amp; Vector Asset Suite</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Budget Allocation
                      </label>
                      <select
                        value={form.budget_range}
                        onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3 py-2.5 text-xs focus:outline-none text-[#1C2B26] cursor-pointer"
                      >
                        <option value="">Select scope...</option>
                        <option>$2,000 – $5,000</option>
                        <option>$5,000 – $15,000</option>
                        <option>$15,000 – $50,000</option>
                        <option>$50,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                        Target Schedule
                      </label>
                      <select
                        value={form.timeline}
                        onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                        className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3 py-2.5 text-xs focus:outline-none text-[#1C2B26] cursor-pointer"
                      >
                        <option value="">Select target...</option>
                        <option>Expedited (under 2 weeks)</option>
                        <option>1 – 2 months</option>
                        <option>2 – 4 months</option>
                        <option>Ongoing retainer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#A48855] block mb-1">
                      Project Specifications &amp; Goals *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Outline architectural parameters, required file formats, target dimensions, or creative goals..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-bold tracking-[0.12em] uppercase rounded-[4px] transition shadow-xs active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Transmitting Brief..." : "Submit Project Brief →"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />

      {/* ── Inline Responsive Styles ── */}
      <style>{`
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
      `}</style>
    </div>
  );
}