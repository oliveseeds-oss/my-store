import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Extract unique filter chips dynamically
  const styles = [...new Set(items.map(i => i.style).filter(Boolean))];
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const industries = [...new Set(items.map(i => i.industry).filter(Boolean))];
  const materials = [...new Set(items.map(i => i.material).filter(Boolean))];

  return (
    <div style={{ background: "#FDFCF7", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Premium Custom Engraving Inspiration Gallery | Olive Seeds"
        description="Browse our curated design gallery of custom teakwood nameplates, frosted acrylic logos, signage models, and interior design items."
        keywords="wood engraving gallery, custom signage reference, interior design engraving inspiration"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 py-24 px-6 border-b border-stone-800">
        {/* Subtle decorative circles */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,106,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,106,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[11px] text-amber-500 font-extrabold uppercase tracking-widest block mb-4">
            Workshop Showcase
          </span>
          <h1 className="text-4xl md:text-5xl font-light italic font-serif text-white tracking-tight mb-6">
            Bespoke Engraving & Craft Gallery
          </h1>
          <p className="text-stone-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Explore how our high-precision laser engravings transform teakwood nameplates, frosted acrylic signs, custom keepsakes, and premium interior decors.
          </p>
        </div>
      </section>

      {/* Filter panel */}
      <section className="max-w-5xl mx-auto px-6 mt-12">
        <div className="bg-white border border-stone-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-600 font-bold uppercase tracking-wide">
            <span style={{ color: "#C9A86A" }}>★</span> Material & Style Filters:
          </div>
          
          <div className="flex flex-wrap gap-3 flex-1">
            <select 
              value={activeFilter.style} 
              onChange={e => setActiveFilter({ ...activeFilter, style: e.target.value })}
              className="border border-stone-200 rounded-xl px-4 py-3 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700 cursor-pointer"
            >
              <option value="">All Styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={activeFilter.category} 
              onChange={e => setActiveFilter({ ...activeFilter, category: e.target.value })}
              className="border border-stone-200 rounded-xl px-4 py-3 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={activeFilter.industry} 
              onChange={e => setActiveFilter({ ...activeFilter, industry: e.target.value })}
              className="border border-stone-200 rounded-xl px-4 py-3 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700 cursor-pointer"
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <select 
              value={activeFilter.material} 
              onChange={e => setActiveFilter({ ...activeFilter, material: e.target.value })}
              className="border border-stone-200 rounded-xl px-4 py-3 text-xs bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-700 cursor-pointer"
            >
              <option value="">All Materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setActiveFilter({ style: "", category: "", industry: "", material: "" })}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Showcase Grid */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-stone-200/50 animate-pulse flex flex-col gap-4">
                <div className="aspect-square bg-stone-100 rounded-2xl w-full" />
                <div className="h-4 bg-stone-150 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
            <span className="text-5xl block mb-4">🍂</span>
            <h3 className="text-xl font-medium text-stone-700 mb-2 font-serif">No custom creations match this search</h3>
            <p className="text-stone-400 text-xs">Clear the filters to view the complete catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onClick={() => setLightboxImage(item)}
                  className="group bg-white rounded-3xl border border-stone-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="aspect-square w-full overflow-hidden bg-stone-50 relative">
                    <img 
                      src={item.image_url} 
                      alt={item.title || "Custom crafted item"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-stone-900 text-xs font-bold bg-white/90 backdrop-blur px-5 py-2.5 rounded-full uppercase tracking-wider border border-white/20 shadow-md">
                        🔍 Inspect Material Details
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <h3 className="font-serif italic text-stone-900 text-lg group-hover:text-amber-800 transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                      <span>{item.material || "Genuine Teak"}</span>
                      <span style={{ color: "#C9A86A" }}>{item.style || "Bespoke"}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-stone-900 text-stone-100 max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button 
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 z-10 transition"
                onClick={() => setLightboxImage(null)}
              >
                ✕
              </button>

              <img 
                src={lightboxImage.image_url} 
                alt={lightboxImage.title || "Custom crafted item details"} 
                className="w-full max-h-[380px] object-cover"
              />

              <div className="p-8">
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block mb-2">
                  {lightboxImage.category || "Laser Crafted"}
                </span>
                <h3 className="text-2xl font-light font-serif italic text-white mb-4">
                  {lightboxImage.title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-6 font-light">
                  Handcrafted using organic premium grade {lightboxImage.material || "wood/acrylic"} options. Perfect for personalized home decor, luxury branding nameplates, and signage systems.
                </p>

                <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <p className="text-xs text-stone-400 max-w-[280px]">
                    Like this design? We can customize its material, scaling, and message details in our studio.
                  </p>
                  <button 
                    onClick={() => {
                      const text = `Hi Olive Seeds, I am interested in customizing a physical craft similar to "${lightboxImage.title || 'your reference gallery items'}". Please share pricing details.`;
                      const event = new CustomEvent("open-whatsapp-chat", {
                        detail: { text }
                      });
                      window.dispatchEvent(event);
                      setLightboxImage(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg transition whitespace-nowrap cursor-pointer w-full md:w-auto text-center"
                  >
                    💬 Customize via WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
