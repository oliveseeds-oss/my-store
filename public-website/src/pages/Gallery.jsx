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
    <div style={{ background: "#FFFFFF", color: "#181A18", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO 
        title="Bespoke Design & Craft Gallery | Olive Seeds Design Studio"
        description="Browse our curated design gallery of custom timber pieces, architectural acrylic objects, signage models, and interior design commissions."
        keywords="bespoke gallery, architectural signage reference, interior design inspiration, custom commissions"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-6 border-b border-[#E7E7E2] bg-white text-[#181A18]">
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[11px] text-[#23483D] font-semibold uppercase tracking-widest block mb-3">
            Workshop Showcase
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-4xl md:text-5xl font-normal text-[#181A18] tracking-tight mb-4">
            Bespoke Objects & Craft Gallery
          </h1>
          <p className="text-[#676A65] text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Explore how our precision-crafted objects transform hand-finished timber, frosted acrylic signs, bespoke keepsakes, and premium interior decors.
          </p>
        </div>
      </section>

      {/* Filter panel */}
      <section className="max-w-5xl mx-auto px-6 mt-10">
        <div className="bg-[#FFFFFF] border border-[#E7E7E2] rounded-[4px] p-5 md:p-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#181A18] font-medium tracking-wide">
            <span className="text-[#23483D]">✦</span> Material & Style Filters:
          </div>
          
          <div className="flex flex-wrap gap-3 flex-1">
            <select 
              value={activeFilter.style} 
              onChange={e => setActiveFilter({ ...activeFilter, style: e.target.value })}
              className="border border-[#DADCD7] rounded-[4px] px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#23483D] font-normal text-[#181A18] cursor-pointer"
            >
              <option value="">All Styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={activeFilter.category} 
              onChange={e => setActiveFilter({ ...activeFilter, category: e.target.value })}
              className="border border-[#DADCD7] rounded-[4px] px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#23483D] font-normal text-[#181A18] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={activeFilter.industry} 
              onChange={e => setActiveFilter({ ...activeFilter, industry: e.target.value })}
              className="border border-[#DADCD7] rounded-[4px] px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#23483D] font-normal text-[#181A18] cursor-pointer"
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>

            <select 
              value={activeFilter.material} 
              onChange={e => setActiveFilter({ ...activeFilter, material: e.target.value })}
              className="border border-[#DADCD7] rounded-[4px] px-3.5 py-2 text-xs bg-white focus:outline-none focus:border-[#23483D] font-normal text-[#181A18] cursor-pointer"
            >
              <option value="">All Materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setActiveFilter({ style: "", category: "", industry: "", material: "" })}
            className="text-xs font-medium text-[#676A65] hover:text-[#181A18] transition-colors underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Showcase Grid */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[4px] p-4 border border-[#E7E7E2] animate-pulse flex flex-col gap-3">
                <div className="aspect-square bg-[#F8F8F6] rounded-[4px] w-full" />
                <div className="h-4 bg-[#F8F8F6] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-[#F8F8F6] rounded-[4px] border border-[#E7E7E2] shadow-sm">
            <span className="text-4xl block mb-3">🍂</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#181A18] mb-2">No custom creations match this search</h3>
            <p className="text-[#676A65] text-xs">Clear the filters to view the complete catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  onClick={() => setLightboxImage(item)}
                  className="group bg-white rounded-[4px] border border-[#E7E7E2] overflow-hidden shadow-sm hover:shadow-md hover:border-[#23483D] transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#F8F8F6] relative">
                    <img 
                      src={item.image_url} 
                      alt={item.title || "Custom crafted item"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[#181A18] text-xs font-medium bg-white/95 backdrop-blur px-4 py-2 rounded-[4px] uppercase tracking-wider border border-[#E7E7E2] shadow-sm">
                        🔍 Inspect Material Details
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg font-normal text-[#181A18] group-hover:text-[#23483D] transition-colors">
                      {item.title}
                    </h2>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#676A65] font-normal tracking-wide">
                      <span>{item.material || "Genuine Teak"}</span>
                      <span style={{ color: "#23483D" }}>{item.style || "Bespoke"}</span>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white text-[#181A18] max-w-xl w-full rounded-[4px] border border-[#E7E7E2] overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button 
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#181A18] border border-[#E7E7E2] rounded-[4px] w-8 h-8 flex items-center justify-center z-10 transition text-sm cursor-pointer"
                onClick={() => setLightboxImage(null)}
              >
                ✕
              </button>

              <img 
                src={lightboxImage.image_url} 
                alt={lightboxImage.title || "Custom crafted item details"} 
                className="w-full max-h-[380px] object-cover"
              />

              <div className="p-6 md:p-8">
                {lightboxImage.category && (
                  <span className="text-[10px] text-[#23483D] font-semibold uppercase tracking-widest block mb-2">
                    {lightboxImage.category}
                  </span>
                )}
                {lightboxImage.title && (
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl md:text-3xl font-normal text-[#181A18] mb-3">
                    {lightboxImage.title}
                  </h3>
                )}
                <p className="text-[#676A65] text-sm leading-relaxed mb-6 font-normal">
                  {lightboxImage.description || (lightboxImage.material
                    ? `Handcrafted using premium grade ${lightboxImage.material}. Custom sized and crafted to order.`
                    : "Handcrafted with precision laser craftsmanship. Contact us for custom sizing and bespoke specifications.")}
                </p>

                <div className="border-t border-[#E7E7E2] pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <p className="text-xs text-[#676A65] max-w-[280px]">
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
                    className="bg-[#23483D] hover:bg-[#16352D] text-white text-xs font-medium uppercase tracking-wider px-5 py-3 rounded-[4px] shadow-sm transition whitespace-nowrap cursor-pointer w-full md:w-auto text-center"
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
