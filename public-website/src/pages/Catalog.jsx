import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

// Custom inline SVG icons for visual premium look
const Icons = {
  Search: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Settings: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Edit: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Close: ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
};

export default function Catalog() {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize search from URL ?category= or ?search= or ?q=
  const [searchQuery, setSearchQuery] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("category") || p.get("search") || p.get("q") || "";
  });

  // Sync searchQuery when URL query string changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const q = p.get("category") || p.get("search") || p.get("q") || "";
    setSearchQuery(q);
  }, [location.search]);

  const loadCatalog = () => {
    setLoading(true);
    API.get("/catalog?type=physical")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load catalog categories", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Filter Categories by Name or Description (Smart Keyword Search Engine)
  const q = searchQuery.toLowerCase().trim();
  const qWords = q.split(/[\s-]+/).filter(w => w.length > 2 && !["and", "for", "the", "collection", "products"].includes(w));
  const filteredCategories = categories.filter(c => {
    if (!q) return true;
    const name = (c.name || "").toLowerCase();
    const desc = (c.description || "").toLowerCase();
    if (name.includes(q) || desc.includes(q)) return true;
    if (q.includes(name)) return true;
    return qWords.some(w => name.includes(w) || desc.includes(w));
  });

  return (
    <div style={{ background: "#F6F3EE", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Full Engraving Workshop Catalog | Olive Seeds"
        description="Explore our full collection of premium custom-engraved categories including wooden name boards, backlit acrylic signs, custom plaques, and corporate keepsakes."
        keywords="wood engraving catalog, acrylic signs, custom corporate gifts, personal engraving collection"
      />
      <Navbar />

      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,125,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block mb-3">Precision Laser Craftsmanship</span>
          <h1 className="text-4xl md:text-5xl font-light italic font-serif text-white tracking-tight mb-4">
            Full Workshop Catalog
          </h1>
          <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            Browse our creative collection by category. Click any template to inspect custom materials, styles, and options, or place personalized orders.
          </p>

          {/* Search Engine row */}
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-center">
            {/* Search Field */}
            <div className="relative w-full flex-1">
              <span className="absolute inset-y-0 left-4 flex items-center text-stone-400">
                <Icons.Search size={18} />
              </span>
              <input 
                type="text"
                placeholder="Search collection name or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-800/80 border border-stone-700/60 focus:border-amber-500/80 rounded-full py-3.5 pl-12 pr-6 text-sm text-stone-100 placeholder-stone-500 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center text-stone-500 hover:text-stone-300"
                >
                  <Icons.Close size={16} />
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1 rounded-full flex items-center gap-2 font-medium">
                <span>Filtered by: <strong>{searchQuery}</strong></span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-white transition ml-1"
                  title="Clear filter"
                >
                  ✕
                </button>
              </span>
              <Link
                to={`/products?category=${encodeURIComponent(searchQuery)}`}
                className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
              >
                View matching products in shop →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid Container */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm animate-pulse flex flex-col gap-4">
                <div className="aspect-square bg-stone-100 rounded-2xl w-full" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-stone-200/60 shadow-sm max-w-lg mx-auto">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No Specific Categories for "{searchQuery}"</h3>
            <p className="text-stone-400 text-xs mb-6 leading-relaxed">
              We couldn't find a dedicated category page for this collection yet, but you can explore all available products or clear the filter.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                to={`/products?category=${encodeURIComponent(searchQuery)}`}
                className="bg-stone-900 hover:bg-stone-850 text-amber-400 text-xs font-bold px-6 py-2.5 rounded-full transition shadow-sm"
              >
                Browse Products in Shop →
              </Link>
              <button
                onClick={() => setSearchQuery("")}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-6 py-2.5 rounded-full transition"
              >
                View All Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredCategories.map((c) => (
              <Link 
                key={c.id} 
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group flex flex-col bg-white rounded-3xl border border-stone-200/50 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/5 overflow-hidden transition-all duration-300"
              >
                {/* Image Frame */}
                <div className="aspect-square w-full bg-stone-100 overflow-hidden relative border-b border-stone-100">
                  {c.image_url ? (
                    <img 
                      src={c.image_url} 
                      alt={c.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50">
                      <span className="text-5xl group-hover:scale-110 transition duration-300">🪵</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card Details */}
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <h2 className="text-lg font-bold text-stone-800 tracking-tight group-hover:text-amber-800 transition duration-200">
                    {c.name}
                  </h2>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
                    {c.description || "Browse custom size templates and premium material selections."}
                  </p>
                  
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider mt-auto flex items-center gap-1">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
