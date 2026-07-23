import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState({ style: "", category: "", industry: "", material: "" });
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let url = "/gallery";
    const params = [];
    if (activeFilter.style) params.push(`style=${activeFilter.style}`);
    if (activeFilter.category) params.push(`category=${activeFilter.category}`);
    if (activeFilter.industry) params.push(`industry=${activeFilter.industry}`);
    if (activeFilter.material) params.push(`material=${activeFilter.material}`);
    if (params.length) url += "?" + params.join("&");

    setLoading(true);
    API.get(url)
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch gallery items", err);
        setLoading(false);
      });
  }, [activeFilter]);

  // Extract unique filter chips dynamically for selection dropdowns
  const styles = [...new Set(items.map(i => i.style).filter(Boolean))];
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const industries = [...new Set(items.map(i => i.industry).filter(Boolean))];
  const materials = [...new Set(items.map(i => i.material).filter(Boolean))];

  return (
    <div style={{ background: "#F6F3EE", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Premium Custom Engraving Inspiration Gallery | Olive Seeds"
        description="Browse our curated design gallery of custom teakwood nameplates, frosted acrylic logos, signage models, and interior design items."
        keywords="wood engraving gallery, custom signage reference, interior design engraving inspiration"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 py-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,125,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block mb-3">Premium Showcase & Portfolio</span>
          <h1 className="text-4xl md:text-5xl font-light italic font-serif text-white tracking-tight mb-4">
            Creative Inspiration Album
          </h1>
          <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed">
            Explore how our high-precision laser engravings transform offices, homes, restaurants, and hospitality environments. See material, style, and scale options.
          </p>
        </div>
      </section>

      {/* Filter panel */}
      <section className="max-w-5xl mx-auto px-6 mt-10">
        <div className="bg-white border border-stone-200/50 rounded-3xl p-5 md:p-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold">
            ⚡ Quick Filters:
          </div>
          
          <div className="flex flex-wrap gap-3 flex-1">
            <select 
              value={activeFilter.style} 
              onChange={e => setActiveFilter({ ...activeFilter, style: e.target.value })}
              className="border border-stone-250 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-700"
            >
              <option value="">All Styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={activeFilter.category} 
              onChange={e => setActiveFilter({ ...activeFilter, category: e.target.value })}
              className="border border-stone-250 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-700"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={activeFilter.industry} 
              onChange={e => setActiveFilter({ ...activeFilter, industry: e.target.value })}
              className="border border-stone-250 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-700"
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <select 
              value={activeFilter.material} 
              onChange={e => setActiveFilter({ ...activeFilter, material: e.target.value })}
              className="border border-stone-250 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-700"
            >
              <option value="">All Materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setActiveFilter({ style: "", category: "", industry: "", material: "" })}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Showcase Grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-4 border border-stone-200/50 animate-pulse flex flex-col gap-3">
                <div className="aspect-square bg-stone-100 rounded-2xl w-full" />
                <div className="h-4 bg-stone-150 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
            <span className="text-5xl block mb-4">🖼️</span>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No Showcase Images Matches Filter</h3>
            <p className="text-stone-400 text-xs">Reset filters or browse other sections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-3xl border border-stone-200/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                onClick={() => setLightboxImage(item)}
              >
                <div className="aspect-square w-full overflow-hidden bg-stone-100 relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title || "Showcase design image"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-4 py-2 rounded-full uppercase tracking-wider border border-white/20">
                      🔍 Inspect Close-Up
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox inspection Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="bg-stone-900 text-stone-100 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 z-10 transition"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>

            <img 
              src={lightboxImage.image_url} 
              alt={lightboxImage.title || "Showcase details"} 
              className="w-full max-h-[380px] object-cover"
            />

            <div className="p-6 flex flex-col gap-4">
              <div className="border-t border-stone-850 pt-2 flex items-center justify-between gap-4">
                <p className="text-xs text-stone-400">
                  Like this style? Tap to send your customization request to our workshop.
                </p>
                <button 
                  onClick={() => {
                    const event = new CustomEvent("open-whatsapp-chat", {
                      detail: { text: `Hi Olive Seeds, I am interested in customizing a craft similar to "${lightboxImage.title || 'your reference gallery items'}". Please share pricing details.` }
                    });
                    window.dispatchEvent(event);
                    setLightboxImage(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition whitespace-nowrap cursor-pointer"
                >
                  💬 Customize via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
