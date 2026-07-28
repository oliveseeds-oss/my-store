import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import API from "../api";

// Custom inline SVG icons for premium look
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
  )
};

const INIT_FORM = { title: "", image_url: "", category: "", style: "", industry: "", material: "" };

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  // Admin Side Panel States
  const [showAdmin, setShowAdmin] = useState(false);
  const [form, setForm] = useState(INIT_FORM);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadGallery = () => {
    setLoading(true);
    API.get("/gallery")
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load gallery items", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Compute Categories from fetched items dynamically
  const categories = ["All", ...new Set(items.map(item => item.category).filter(Boolean))];

  // Filtered Showcase Items
  const filteredItems = filter === "All" 
    ? items 
    : items.filter(item => item.category === filter);

  // Form Handlers
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim() || !form.title.trim()) {
      setErrorMsg("Title and Image URL are required.");
      return;
    }

    try {
      await API.post("/gallery", form);
      setSuccessMsg("Showcase project added to gallery!");
      setForm(INIT_FORM);
      setErrorMsg("");
      loadGallery();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to add project. Admin authentication token required.");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the showcase?`)) {
      return;
    }

    try {
      await API.delete(`/gallery/${id}`);
      setSuccessMsg("Showcase project deleted successfully!");
      loadGallery();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete showcase project. Admin token required.");
    }
  };

  return (
    <div style={{ background: "#060913", color: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Premium Studio Showcase | Olive Seeds"
        description="Explore our design studio projects: Figma design systems, Notion operating workspaces, and professional React application engineering."
        keywords="Figma UI kits, Notion systems, React engineering studio, UI UX design services"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ paddingTop: "140px", paddingBottom: "70px", position: "relative" }}>
        {/* Glow Spheres */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,124,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,249,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6EE7F9", display: "block", marginBottom: "16px" }}>
              Studio Portfolio
            </span>
            <h1 className="clash font-display" style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.1, color: "#FFFFFF", marginBottom: "20px", letterSpacing: "-0.02em" }}>
              Our Work, <br />
              <span style={{ background: "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Beautifully Exhibited
              </span>
            </h1>
            <p style={{ fontSize: "16px", color: "#94A3B8", maxWidth: "600px", margin: "0 auto 36px", lineHeight: 1.7 }}>
              Browse through our actual workshop creations and design mockups. High-fidelity layouts, premium material combinations, and client works.
            </p>

            <button 
              onClick={() => setShowAdmin(true)}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "10px 24px",
                borderRadius: "100px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >
              <Icons.Settings size={16} />
              Portfolio Admin Panel
            </button>
          </div>

          {/* Dynamic Categories filter bar */}
          {categories.length > 1 && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "40px" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    background: filter === cat ? "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${filter === cat ? "transparent" : "rgba(255,255,255,0.08)"}`,
                    color: filter === cat ? "#060913" : "#94A3B8",
                    padding: "8px 20px",
                    borderRadius: "100px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: filter === cat ? "0 6px 20px rgba(110,231,249,0.2)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Showcase Grid */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 100px", position: "relative", zIndex: 2 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {[...Array(6)].map((_, idx) => (
              <div key={idx} style={{ height: "300px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", className: "animate-pulse" }} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "rgba(255,255,255,0.01)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "40px" }}>📷</span>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginTop: "16px", color: "#FFFFFF" }}>No Projects Discovered</h3>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "6px" }}>Use Admin Panel to upload showcase images with style descriptions.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveItem(item)}
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    aspectRatio: "1.4/1",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  }}
                  whileHover={{ y: -6, borderColor: "#6EE7F9", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                >
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
                    className="hover-img-scale"
                  />
                  {/* Subtle caption bottom overlay */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(6, 9, 19, 0.9) 0%, rgba(6, 9, 19, 0.3) 50%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "end",
                    padding: "20px",
                  }}>
                    <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6EE7F9", marginBottom: "6px" }}>
                      {item.category || "Showcase"}
                    </span>
                    <h3 className="clash text-white truncate" style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                      {item.title}
                    </h3>
                    {item.style && (
                      <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }} className="line-clamp-1">
                        {item.style}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* PORTFOLIO LIGHTBOX / MODAL */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setActiveItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                background: "#0C1020",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "28px",
                maxWidth: "600px",
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 30px 100px rgba(0,0,0,0.8)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={activeItem.image_url} 
                alt={activeItem.title} 
                style={{ width: "100%", maxHeight: "380px", objectFit: "cover" }} 
              />
              <div style={{ padding: "32px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "#8B7CFF", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                  {activeItem.category || "Showcase Item"}
                </span>
                <h3 className="clash" style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
                  {activeItem.title}
                </h3>
                
                {activeItem.style && (
                  <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.6, marginBottom: "20px" }}>
                    {activeItem.style}
                  </p>
                )}

                {/* Additional Spec Meta items if any */}
                {(activeItem.material || activeItem.industry) && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                    {activeItem.material && (
                      <span style={{ fontSize: "11px", color: "#6EE7F9", background: "rgba(110,231,249,0.05)", border: "1px solid rgba(110,231,249,0.15)", padding: "4px 12px", borderRadius: "6px" }}>
                        Material: {activeItem.material}
                      </span>
                    )}
                    {activeItem.industry && (
                      <span style={{ fontSize: "11px", color: "#8B7CFF", background: "rgba(139,124,255,0.05)", border: "1px solid rgba(139,124,255,0.15)", padding: "4px 12px", borderRadius: "6px" }}>
                        Industry: {activeItem.industry}
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setActiveItem(null)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      padding: "10px 24px",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PORTFOLIO ADMIN CONTROL PANEL */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${showAdmin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(6, 9, 19, 0.5)", backdropFilter: "blur(4px)" }}
      >
        <div 
          className={`w-full max-w-md bg-[#0C1123] text-stone-100 h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${showAdmin ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.Settings size={20} className="text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Portfolio Admin</h2>
            </div>
            <button 
              onClick={() => setShowAdmin(false)}
              className="text-stone-400 hover:text-stone-100 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <Icons.Close size={20} />
            </button>
          </div>

          {/* Scrollable Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 bg-[#080B17] p-5 rounded-2xl border border-stone-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Add Showcase Design</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Project Title</label>
                <input 
                  type="text" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bespoke Teakwood Nameboard"
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Image URL</label>
                <input 
                  type="text" 
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Category</label>
                <input 
                  type="text" 
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Wooden Engravings"
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Description / Concept</label>
                <textarea 
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  placeholder="Tell the story of how this physical masterpiece or digital project was engineered..."
                  rows="3"
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Materials Used (Optional)</label>
                <input 
                  type="text" 
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="e.g. Teakwood, Gold Acrylic"
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Industry / Sector (Optional)</label>
                <input 
                  type="text" 
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Hospitality, Commercial"
                  className="w-full bg-[#0E142B] border border-stone-800/80 focus:border-cyan-500 rounded-xl px-4 py-2 text-sm text-stone-100 outline-none transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Add Showcase Project
              </button>
            </form>

            {/* List and Remove */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 font-serif">Remove Projects</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-[#080B17] border border-stone-800/80 rounded-xl gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-medium">{item.category || "Showcase"}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-stone-400 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Icons.Trash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
