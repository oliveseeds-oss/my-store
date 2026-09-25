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

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  const loadGallery = () => {
    setLoading(true);
    API.get("/portfolio")
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

  return (
    <div style={{ background: "#FFFFFF", color: "#181A18", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO 
        title="Portfolio Showcase | Olive Seeds Studio"
        description="Explore our curated studio portfolio: brand identity systems, architectural spatial design, and bespoke physical commissions for global clients."
        keywords="bespoke design portfolio, brand identity systems, spatial design, olive seeds design studio"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ paddingTop: "120px", paddingBottom: "60px", position: "relative", background: "#FFFFFF", borderBottom: "1px solid #E7E7E2" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#23483D", display: "block", marginBottom: "12px" }}>
              Studio Portfolio
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 400, lineHeight: 1.15, color: "#181A18", marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Our Work, Beautifully Exhibited
            </h1>
            <p style={{ fontSize: "15px", color: "#676A65", maxWidth: "600px", margin: "0 auto 28px", lineHeight: 1.7 }}>
              Browse through our actual workshop creations and design mockups. High-fidelity layouts, premium material combinations, and client works.
            </p>
          </div>

          {/* Dynamic Categories filter bar */}
          {categories.length > 1 && (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "24px" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    background: filter === cat ? "#F8F8F6" : "#FFFFFF",
                    border: `1px solid ${filter === cat ? "#23483D" : "#E7E7E2"}`,
                    color: filter === cat ? "#23483D" : "#676A65",
                    padding: "7px 18px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: filter === cat ? 600 : 500,
                    cursor: "pointer",
                    boxShadow: "none",
                    transition: "all 0.2s ease",
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
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 100px", position: "relative", zIndex: 2 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            {[...Array(6)].map((_, idx) => (
              <div key={idx} style={{ height: "300px", background: "#F8F8F6", border: "1px solid #E7E7E2", borderRadius: "4px" }} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#F8F8F6", borderRadius: "4px", border: "1px solid #E7E7E2" }}>
            <span style={{ fontSize: "36px" }}>📷</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 500, marginTop: "16px", color: "#181A18" }}>No Projects Discovered</h3>
            <p style={{ color: "#676A65", fontSize: "13px", marginTop: "6px" }}>Use Admin Panel to upload showcase images with style descriptions.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveItem(item)}
                  style={{
                    position: "relative",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    aspectRatio: "1.4/1",
                    background: "#F8F8F6",
                    border: "1px solid #E7E7E2",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                  whileHover={{ y: -4, borderColor: "#23483D", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
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
                    background: "linear-gradient(to top, rgba(24, 26, 24, 0.85) 0%, rgba(24, 26, 24, 0.35) 55%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "end",
                    padding: "20px",
                  }}>
                    <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A48855", marginBottom: "4px" }}>
                      {item.category || "Showcase"}
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#FFFFFF", marginBottom: "2px" }} className="truncate">
                      {item.title}
                    </h3>
                    {item.style && (
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 }} className="line-clamp-1">
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setActiveItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E7E7E2",
                borderRadius: "4px",
                maxWidth: "600px",
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={activeItem.image_url} 
                alt={activeItem.title} 
                style={{ width: "100%", maxHeight: "380px", objectFit: "cover" }} 
              />
              <div style={{ padding: "28px" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", color: "#23483D", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  {activeItem.category || "Showcase Item"}
                </span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "#181A18", marginBottom: "10px" }}>
                  {activeItem.title}
                </h3>
                
                {activeItem.style && (
                  <p style={{ fontSize: "13px", color: "#676A65", lineHeight: 1.6, marginBottom: "18px" }}>
                    {activeItem.style}
                  </p>
                )}

                {/* Additional Spec Meta items if any */}
                {(activeItem.material || activeItem.industry) && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                    {activeItem.material && (
                      <span style={{ fontSize: "11px", color: "#23483D", background: "#F8F8F6", border: "1px solid #E7E7E2", padding: "4px 10px", borderRadius: "4px" }}>
                        Material: {activeItem.material}
                      </span>
                    )}
                    {activeItem.industry && (
                      <span style={{ fontSize: "11px", color: "#23483D", background: "#F8F8F6", border: "1px solid #E7E7E2", padding: "4px 10px", borderRadius: "4px" }}>
                        Industry: {activeItem.industry}
                      </span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setActiveItem(null)}
                    style={{
                      background: "#23483D",
                      border: "none",
                      color: "#FFFFFF",
                      padding: "8px 22px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 500,
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

      <Footer />
    </div>
  );
}
