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

const SORT_OPTIONS = [
  { value: "newest", label: "Latest Drops" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const COLLECTIONS = [
  {
    icon: "📐",
    title: "Parametric CAD & 3D Blueprints",
    desc: "Production-ready millimetric 3D CAD models (STEP, OBJ, DWG) engineered to exacting tolerances for precision fabrication and bespoke joinery.",
    category: "CAD & 3D Models",
  },
  {
    icon: "🏛️",
    title: "Brand Identity Frameworks",
    desc: "Complete corporate identity systems for distinguished practices. Includes vector typography, grid architectures, and comprehensive brand guidelines.",
    category: "Brand Identity Kits",
  },
  {
    icon: "📊",
    title: "Executive Presentation Systems",
    desc: "Editorial slide architectures and pitch decks designed for executive boardrooms, sovereign capital briefs, and high-stakes venture summits.",
    category: "Presentation Templates",
  },
  {
    icon: "📜",
    title: "Architectural Stationery Suites",
    desc: "Typography hierarchies, letterheads, proposal dossiers, and certificates calibrated for luxury physical embossing or digital correspondence.",
    category: "Business Stationery",
  },
];

/* ─── Digital Product Card ────────────────────────────────────── */
function DigitalCard({ p, onWishlist, isWishlisted }) {
  const { addToCart } = useCart();
  const { convert } = useCurrency();
  const [added, setAdded] = useState(false);

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
    <div className="group relative flex flex-col justify-between bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[4px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
      
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
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-15 text-[#23483D]">
              📐
            </div>
          )}
        </Link>

        {/* Discreet Micro-Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-bold tracking-[0.12em] uppercase bg-white/90 backdrop-blur-md text-[#23483D] border border-[#EAE4D6] shadow-xs">
            {formatBadge}
          </span>
        </div>

        {/* Minimal Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlist();
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition shadow-xs cursor-pointer ${
            isWishlisted 
              ? "bg-[#23483D] text-[#FAF6EE]" 
              : "bg-white/90 backdrop-blur-md text-stone-500 hover:text-red-600 border border-[#EAE4D6]"
          }`}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {p.category_name && (
            <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.16em] text-[#A48855] truncate mb-1">
              {p.category_name}
            </p>
          )}

          <Link to={`/digital/${p.id}`} className="block">
            <h3 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className="text-base sm:text-lg font-medium text-[#1C2B26] group-hover:text-[#23483D] transition line-clamp-2 leading-snug"
            >
              {p.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Acquisition Bar */}
        <div className="pt-2 border-t border-[#EAE4D6]/60 flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
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
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/digital/${p.id}`}
              className="px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase border border-[#EAE4D6] hover:border-[#23483D] text-[#1C2B26] rounded-[3px] transition"
            >
              View
            </Link>
            <button
              onClick={handleAdd}
              aria-label="Add digital asset to order"
              className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase rounded-[3px] transition shadow-xs cursor-pointer flex items-center gap-1 ${
                added 
                  ? "bg-[#16a34a] text-white" 
                  : "bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D]"
              }`}
            >
              {added ? "✓ Added" : "+ Add"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Skeleton Card ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="border border-[#EAE4D6] rounded-[4px] overflow-hidden bg-white animate-pulse">
      <div className="aspect-[4/3] bg-stone-100" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-4/5" />
        <div className="h-4 bg-stone-200 rounded w-2/3" />
        <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
          <div className="h-5 bg-stone-200 rounded w-1/4" />
          <div className="h-7 bg-stone-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Digital Products Page ───────────────────────────────── */
export default function DigitalProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { member } = useMember();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

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
        API.get(`/digital-products?${params}`),
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
        title="The Digital Design Vault & CAD Atelier | Olive Seeds Studio"
        description="Download precision parametric CAD models, 3D architectural blueprints, vector presentation suites, and corporate brand identity kits."
        keywords="architectural cad files, 3d furniture blueprints, parametric obj dwg, brand identity kits, executive presentation systems"
      />
      <Navbar />

      {/* ── Architectural Masthead & Quiet Luxury Hero ── */}
      <section className="relative border-b border-[#EAE4D6] overflow-hidden" style={{ background: "#FAF6EE" }}>
        {/* Subtle decorative watermark */}
        <div className="absolute right-8 -bottom-14 select-none pointer-events-none opacity-[0.03] text-stone-900 font-serif text-[240px] leading-none">
          CAD
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#A48855]">
                Digital Design Vault & CAD Atelier
              </span>
            </div>

            <h1 
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
              className="text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1C2B26] tracking-tight leading-[1.08] mb-4"
            >
              Architectural Blueprints, Parametric CAD & Digital Systems
            </h1>

            <p className="text-sm sm:text-base text-[#6B7C75] leading-relaxed max-w-2xl mb-8">
              Precision-crafted 3D geometry, production-ready vector suites, and executive brand design systems engineered to exacting studio tolerances — instantly downloadable for commercial deployment.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById("vault-archive");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition shadow-sm cursor-pointer"
              >
                Explore Vault Archive ↓
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("commission-brief");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 bg-white hover:bg-stone-50 border border-[#EAE4D6] text-[#1C2B26] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition cursor-pointer"
              >
                Custom Design Brief
              </button>
            </div>
          </div>

          {/* 3 Value Pillars */}
          <div className="mt-12 pt-8 border-t border-[#EAE4D6] grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">01</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Millimetric CAD Tolerances</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Engineered in DWG, STEP, and OBJ with verified joinery vectors.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">02</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Perpetual Commercial Rights</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Unrestricted use across private, client, and commercial projects.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-[#A48855] font-mono">03</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Instant Cloud Release</h4>
                <p className="text-xs text-[#6B7C75] mt-0.5">Immediate vault access upon checkout with lifetime re-download rights.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Brand Banner Ad ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <AdBanner placement="Horizontal Banner" />
      </div>

      {/* ── Main Vault Archive Section ── */}
      <section id="vault-archive" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        
        {/* Controls Bar: Search, Category Pills & Sort */}
        <div className="space-y-4 mb-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block">
                Atelier Catalog
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-medium text-[#1C2B26]">
                Curated Digital Assets
              </h2>
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[220px] sm:min-w-[260px]">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  placeholder="Search assets, CAD, formats..."
                  className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2 text-xs focus:outline-none text-[#1C2B26]"
                />
                {filters.search && (
                  <button 
                    onClick={() => setFilter("search", "")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ✕
                  </button>
                )}
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
            </div>
          </div>

          {/* Horizontal Category Filter Pills (Touch friendly, no scrollbars) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
            {[{ id: "", name: "All Digital Assets" }, ...categories].map((c) => {
              const isActive = filters.category === c.name || (!filters.category && c.id === "");
              return (
                <button
                  key={c.id || "all"}
                  onClick={() => setFilter("category", c.id === "" ? "" : c.name)}
                  className={`whitespace-nowrap px-4 py-2 rounded-[4px] text-xs transition cursor-pointer shrink-0 font-medium ${
                    isActive
                      ? "bg-[#23483D] text-[#FAF6EE] shadow-sm font-semibold"
                      : "bg-[#FAF6EE] text-[#6B7C75] hover:text-[#1C2B26] border border-[#EAE4D6]"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-16 text-center bg-[#FAF6EE]/30">
            <span className="text-4xl block mb-3 opacity-30">📐</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26]">
              No Assets Found
            </h3>
            <p className="text-xs text-[#6B7C75] mt-1.5 max-w-sm mx-auto">
              {filters.category
                ? `No assets currently filed under "${filters.category}". Explore our complete vault archive.`
                : "No matching digital files or CAD assets found for your query. Try resetting your search filter."}
            </p>
            <button
              onClick={() => setFilters({ search: "", category: "", sort: "newest", minPrice: "", maxPrice: "", minRating: "" })}
              className="mt-5 px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider rounded-[4px] hover:bg-[#16352D] transition cursor-pointer"
            >
              Reset Vault Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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

      </section>

      {/* ── Featured Curated Vaults ── */}
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
              Each discipline contains calibrated geometry, standardized font hierarchies, and layered source archives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLLECTIONS.map((col) => (
              <div 
                key={col.title}
                onClick={() => setFilter("category", col.category)}
                className="group bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[4px] p-6 transition duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform">
                    {col.icon}
                  </span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    {col.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center justify-between text-xs font-semibold text-[#23483D]">
                  <span>Filter Collection</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* White Glove Digital Assurance */}
          <div className="mt-10 p-5 sm:p-6 bg-white border border-[#EAE4D6] rounded-[4px] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
            <span className="text-3xl shrink-0">🛡️</span>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Studio File Integrity & Verification</h4>
              <p className="text-xs text-[#6B7C75] mt-0.5 leading-relaxed">
                All digital deliverables are SHA-256 integrity-verified, uncompressed, and backed by lifetime re-downloads directly from your private Client Atelier.
              </p>
            </div>
            <Link 
              to="/profile?tab=digital" 
              className="shrink-0 px-4 py-2 border border-[#23483D] text-[#23483D] hover:bg-[#23483D] hover:text-white text-xs font-semibold rounded-[4px] transition uppercase tracking-wider"
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
                  Bespoke Architectural Services
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl font-normal text-[#1C2B26] leading-tight">
                  Commission Custom CAD or Brand Systems
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7C75] mt-3 leading-relaxed">
                  Require custom parametric 3D models, specialized joinery blueprints, or an exclusive corporate identity architecture? Our creative directors accept select commissions each quarter.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { icon: "⏱", title: "Direct Director Review", desc: "Every project brief is personally assessed within 24 hours." },
                  { icon: "🔒", title: "Mutual Confidentiality", desc: "Standard NDA protection furnished prior to schematic disclosure." },
                  { icon: "📐", title: "Parametric Precision", desc: "Files furnished in native Rhino, STEP, DWG, and vector master formats." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <span className="text-lg shrink-0 p-2 bg-[#FAF6EE] rounded-[4px] border border-[#EAE4D6]">{item.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C2B26] uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-[#6B7C75] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Brief Form */}
            <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#EAE4D6] p-6 sm:p-8 rounded-[4px] shadow-sm">
              {success ? (
                <div className="text-center py-12 space-y-3">
                  <span className="text-4xl block text-[#23483D]">✓</span>
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
                        <option>3D Parametric CAD / BIM</option>
                        <option>Joinery Blueprints & CNC</option>
                        <option>Corporate Brand Identity</option>
                        <option>Executive Keynote Presentation</option>
                        <option>Custom Architectural Model</option>
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
                      Project Specifications & Goals *
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
                    className="w-full py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
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
    </div>
  );
}