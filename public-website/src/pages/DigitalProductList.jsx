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

/* ─── Digital Product Card (Refined, Compact & Architectural) ─── */
function DigitalCard({ p, onWishlist, isWishlisted }) {
  const { addToCart } = useCart();
  const { convert } = useCurrency();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const img = getProductMainImage(p);
  const finalPrice = (p.discount_price !== null && p.discount_price !== undefined && p.discount_price !== "")
    ? Number(p.discount_price)
    : Number(p.price || 0);
  const discount = (p.discount_price && p.price && Number(p.discount_price) < Number(p.price))
    ? Math.round((1 - Number(p.discount_price) / Number(p.price)) * 100)
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

  const formatBadge = p.file_format || (Array.isArray(p.tags) && p.tags[0]) || "DIGITAL";

  return (
    <div 
      className="group relative flex flex-col h-full bg-white border border-[#EAE4D6]/70 hover:border-[#A48855]/60 rounded-[2px] overflow-hidden transition-colors duration-250"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Image Preview (aspect-[4/3] keeps card size compact and balanced) */}
      <div className="relative aspect-[4/3] bg-[#FAF6EE] overflow-hidden border-b border-[#EAE4D6]/50">
        <Link to={`/digital/${p.id}`} className="block w-full h-full">
          {img ? (
            <img 
              src={img} 
              alt={p.name} 
              className="w-full h-full object-cover transition-transform duration-350 ease-out" 
              style={{
                transform: hovered ? "scale(1.02)" : "scale(1)",
              }}
              loading="lazy" 
              decoding="async" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#23483D] bg-[#FAF6EE] p-3 text-center">
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: "rgba(164, 136, 85, 0.4)", letterSpacing: "0.1em" }}>OS</span>
              <span style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.2em", color: "#A48855", fontWeight: 700, marginTop: 2 }}>Digital Archive</span>
            </div>
          )}
        </Link>

        {/* Discreet Micro-Badge */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none flex items-center gap-1">
          {discount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold tracking-[0.08em] uppercase bg-[#23483D] text-white">
              −{discount}%
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-semibold tracking-[0.08em] uppercase bg-white/95 text-[#23483D] border border-[#EAE4D6]">
              {formatBadge}
            </span>
          )}
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
          className="absolute top-2 right-2 z-20 w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-full flex items-center justify-center bg-white/90 border border-[#EAE4D6] cursor-pointer transition-opacity duration-200"
          style={{ opacity: isWishlisted || hovered ? 1 : 0.85 }}
        >
          {isWishlisted ? (
            <MdFavorite className="text-rose-600 text-xs sm:text-sm" />
          ) : (
            <MdFavoriteBorder className="text-stone-400 hover:text-stone-700 text-xs sm:text-sm" />
          )}
        </button>
      </div>

      {/* Content Area with Controlled Proportions */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          <p className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.16em] text-[#A48855] truncate mb-1 leading-tight min-h-[1.1em]">
            {p.category_name || "Digital Edition"}
          </p>

          {/* Asset Title */}
          <Link to={`/digital/${p.id}`} className="block mb-2">
            <h3 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className={`text-[15px] sm:text-[17px] font-medium transition-colors duration-200 line-clamp-2 leading-[1.24] min-h-[2.48em] break-words ${
                hovered ? "text-[#23483D]" : "text-[#181A18]"
              }`}
            >
              {p.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Editorial CTA Row */}
        <div className="mt-auto pt-2 border-t border-[#FAF6EE] flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span 
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                className="text-[17px] sm:text-[19px] font-semibold text-[#181A18]"
              >
                {convert(finalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-[10.5px] sm:text-[11px] text-[#8A8D88] line-through">
                  {convert(p.price)}
                </span>
              )}
            </div>
            {p.file_format && (
              <span className="text-[8px] sm:text-[8.5px] font-semibold tracking-[0.1em] uppercase text-[#A48855]">
                {p.file_format}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            <Link
              to={`/digital/${p.id}`}
              className="group/cta inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold tracking-[0.12em] uppercase text-[#181A18] hover:text-[#23483D] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span>Inspect</span>
              <span className="inline-block transition-transform duration-200 group-hover/cta:translate-x-0.5 text-xs">→</span>
            </Link>
            <button
              onClick={handleAdd}
              aria-label="Add digital asset to order"
              title={added ? "Added to Order" : "Add to Order"}
              className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-[2px] border border-[#EAE4D6] transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                added 
                  ? "bg-[#16a34a] text-white border-[#16a34a]" 
                  : "bg-[#FAF6EE] text-[#23483D] hover:bg-[#23483D] hover:text-white hover:border-[#23483D]"
              }`}
            >
              {added ? <MdCheck className="text-xs sm:text-sm" /> : <MdShoppingBag className="text-xs sm:text-sm" />}
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
    if (!form.name || !form.email || !form.project_type || !form.message) {
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

      {/* ── Masthead Hero (Simple, Calm & Premium Atelier Presentation) ── */}
      <section className="relative border-b border-[#EAE4D6]" style={{ background: "#FAF6EE" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#A48855] block mb-2">
              Atelier Digital Vault
            </span>
            <h1 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1C2B26] tracking-tight leading-[1.12] mb-3"
            >
              Curated Digital Works &amp; Systems
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7C75] leading-relaxed mb-6 max-w-xl">
              Production UI/UX kits, responsive website architectures, 3D render scenes, AI agent workflows, and digital design editions engineered for modern creative practices.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById("vault-archive");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-[11px] font-bold tracking-[0.12em] uppercase rounded-[2px] transition cursor-pointer"
              >
                Browse Collection ↓
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("commission-brief");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-[#EAE4D6] text-[#1C2B26] text-[11px] font-bold tracking-[0.12em] uppercase rounded-[2px] transition cursor-pointer"
              >
                Custom Commission
              </button>
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

          {/* ── Product Grid (Refined Proportions: 2 cols on mobile, 3-4 on desktop) ── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-[#EAE4D6]/70 rounded-[2px] overflow-hidden bg-white animate-pulse">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
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

      {/* ── Studio Digital License Assurance (Minimal & Restrained) ── */}
      <section className="border-t border-[#EAE4D6] py-8 bg-[#FAF6EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-[#6B7C75] tracking-wide">
            <span className="font-semibold text-[#1C2B26]">Olive Seeds Digital Guarantee:</span> All acquisitions include perpetual commercial licenses, clean tokenized production files, and immediate lifetime re-downloads directly from your account vault.
          </p>
        </div>
      </section>

      {/* ── Custom Commission Brief Section (Simple, Restrained, Elegant) ── */}
      <section id="commission-brief" className="border-t border-[#EAE4D6] py-14 sm:py-18 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1.5">
              Private Commissions
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
              Commission Custom Digital Architecture
            </h2>
            <p className="text-xs text-[#6B7C75] mt-1.5 max-w-md mx-auto leading-relaxed">
              Inquire regarding bespoke UI/UX design systems, production web architectures, tailored 3D scenes, or proprietary AI workflows.
            </p>
          </div>

          <div className="bg-[#FAF6EE]/60 border border-[#EAE4D6] p-6 sm:p-8 rounded-[3px]">
            {success ? (
              <div className="text-center py-8 space-y-2.5">
                <span className="w-10 h-10 mx-auto rounded-full bg-[#23483D] text-white flex items-center justify-center text-lg font-bold">✓</span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-normal text-[#1C2B26]">
                  Commission Brief Transmitted
                </h3>
                <p className="text-xs text-[#6B7C75] max-w-md mx-auto leading-relaxed">
                  Your brief has been delivered to our creative director. We will review your technical parameters and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] uppercase font-bold tracking-[0.14em] text-[#A48855] block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[2px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26]"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] uppercase font-bold tracking-[0.14em] text-[#A48855] block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane@studio.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[2px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] uppercase font-bold tracking-[0.14em] text-[#A48855] block mb-1">
                      Enterprise / Practice
                    </label>
                    <input
                      type="text"
                      placeholder="Studio / Brand (Optional)"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[2px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26]"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] uppercase font-bold tracking-[0.14em] text-[#A48855] block mb-1">
                      Discipline *
                    </label>
                    <select
                      required
                      value={form.project_type}
                      onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                      className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[2px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26] cursor-pointer"
                    >
                      <option value="">Select discipline...</option>
                      <option>UI/UX Design System &amp; Mobile App</option>
                      <option>Luxury Website &amp; Webflow/React Architecture</option>
                      <option>Brand Identity Kit &amp; Corporate Guidelines</option>
                      <option>Custom 3D Model &amp; Photorealistic Scene</option>
                      <option>AI Agent Template &amp; Workflow Automation</option>
                      <option>Bespoke Digital Printables &amp; Asset Suite</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-bold tracking-[0.14em] text-[#A48855] block mb-1">
                    Project Brief &amp; Specifications *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your objectives, deliverables, or architectural parameters..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white border border-[#EAE4D6] focus:border-[#23483D] rounded-[2px] px-3 py-2 text-xs focus:outline-none text-[#1C2B26] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-[11px] font-bold tracking-[0.14em] uppercase rounded-[2px] transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Transmitting..." : "Submit Project Brief →"}
                </button>
              </form>
            )}
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