import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Notion Enterprise Creator OS",
    category: "Notion Workspaces",
    desc: "Complete business operating system with CRM, project trackers, finance boards, and client portals built entirely inside Notion.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["Notion", "Productivity", "System Design"],
    stats: "15,000+ Downloads",
    color: "#6EE7F9",
  },
  {
    id: 2,
    title: "Figma Premium Design System",
    category: "Figma Systems",
    desc: "Auto-layout 5.0 tokens-driven visual framework with 250+ responsive UI components, light/dark styling, and wireframing grids.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    tags: ["Figma", "UI/UX", "Design Tokens"],
    stats: "2.4k Likes",
    color: "#8B7CFF",
  },
  {
    id: 3,
    title: "React SaaS Storefront Core",
    category: "React Codebases",
    desc: "Highly-performance boilerplate in Next.js & Tailwind CSS. Integrated state management, Stripe payment routing, and full SEO capabilities.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    tags: ["Next.js", "React", "Tailwind CSS"],
    stats: "98/100 Lighthouse Speed",
    color: "#00D4A6",
  },
  {
    id: 4,
    title: "Vivid UI Mobile Design Kit",
    category: "Figma Systems",
    desc: "Vibrant mobile screens and customizable iOS/Android modules optimized for modern e-commerce and SaaS utilities.",
    image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fa6a?auto=format&fit=crop&w=800&q=80",
    tags: ["Figma", "Mobile UI", "App Design"],
    stats: "120+ Screens",
    color: "#8B7CFF",
  },
  {
    id: 5,
    title: "Automated Agency Workspace",
    category: "Notion Workspaces",
    desc: "Project tracking hub designed for digital agencies, connecting content calendars, tasks, and asset managers.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    tags: ["Notion", "Project Management", "Automated"],
    stats: "Best-Seller",
    color: "#6EE7F9",
  },
  {
    id: 6,
    title: "TypeScript Web Dashboard",
    category: "React Codebases",
    desc: "Enterprise-grade dashboard built in React with dynamic chart panels, multi-role auth, and backend REST bindings.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    tags: ["TypeScript", "React", "Charts"],
    stats: "Full API Ready",
    color: "#00D4A6",
  },
];

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [activeItem, setActiveItem] = useState(null);

  const categories = ["All", "Figma Systems", "Notion Workspaces", "React Codebases"];

  const filteredItems = filter === "All" 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.category === filter);

  return (
    <div style={{ background: "#0B1020", color: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Premium Digital Portfolio | Olive Seeds Design Studio"
        description="Explore our design studio projects: Figma design systems, Notion operating workspaces, and professional React application engineering."
        keywords="Figma UI kits, Notion systems, React engineering studio, UI UX design services"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ paddingTop: "140px", paddingBottom: "80px", position: "relative" }}>
        {/* Glow Spheres */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,124,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,249,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2, textShadow: "none" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6EE7F9", display: "block", marginBottom: "16px" }}>
              Digital Portfolio
            </span>
            <h1 className="clash font-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, color: "#FFFFFF", marginBottom: "24px", letterSpacing: "-0.02em" }}>
              Crafting Digital Systems <br />
              <span style={{ background: "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                that Convert & Scale
              </span>
            </h1>
            <p style={{ fontSize: "16.5px", color: "#A5B4C7", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.75 }}>
              Curated Figma assets, production-ready React web codebases, and custom enterprise Notion workspace templates crafted from our design studio.
            </p>
          </div>

          {/* Categories bar */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  background: filter === cat ? "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${filter === cat ? "transparent" : "rgba(255,255,255,0.08)"}`,
                  color: filter === cat ? "#0B1020" : "#A5B4C7",
                  padding: "10px 24px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: filter === cat ? "0 8px 24px rgba(110,231,249,0.25)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Showcase */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 120px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "32px" }}>
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveItem(item)}
                style={{
                  background: "rgba(18, 25, 45, 0.65)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                }}
                whileHover={{ y: -8, borderColor: item.color, boxShadow: `0 20px 48px rgba(0,0,0,0.5), 0 0 30px rgba(${item.id === 1 || item.id === 5 ? '110,231,249' : item.id === 2 || item.id === 4 ? '139,124,255' : '0,212,166'},0.1)` }}
              >
                <div>
                  {/* Image Wrap */}
                  <div style={{ position: "relative", aspectRatio: "1.5/1", overflow: "hidden", background: "#060914" }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,16,32,0.85) 0%, transparent 60%)" }} />
                    <span style={{ position: "absolute", top: 16, left: 16, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", background: "rgba(11,16,32,0.6)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", color: item.color, padding: "5px 12px", borderRadius: "100px", textTransform: "uppercase" }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "28px 24px" }}>
                    <h3 className="clash" style={{ fontSize: "21px", fontWeight: 650, color: "#FFFFFF", marginBottom: "12px" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#A5B4C7", lineHeight: 1.6, marginBottom: "20px" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "0 24px 28px" }}>
                  {/* Tags */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: "11px", color: "#A5B4C7", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: "6px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

                  {/* Footer stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: item.color, fontWeight: 600 }}>
                      {item.stats}
                    </span>
                    <span style={{ fontSize: "12px", color: "#F8FAFC", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      View Project
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA section at bottom */}
        <FadeUp delay={0.4}>
          <div style={{
            background: "linear-gradient(135deg, rgba(18,25,45,0.8) 0%, rgba(26,35,58,0.8) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "32px",
            padding: "80px 48px",
            textAlign: "center",
            marginTop: "100px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(110,231,249,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
            <h2 className="clash" style={{ fontSize: "36px", fontWeight: 700, color: "#FFFFFF", marginBottom: "20px" }}>
              Need a Custom Design System or Web Build?
            </h2>
            <p style={{ fontSize: "16px", color: "#A5B4C7", maxWidth: "540px", margin: "0 auto 36px", lineHeight: 1.75 }}>
              Let's craft high-fidelity Figma components, automate your operations with custom Notion models, or engineer your next React web app.
            </p>
            <a 
              href="https://wa.me/919999999999?text=Hi%20Olive%20Seeds,%20I%20am%20interested%20in%20hiring%20your%20digital%20design%20studio%20for%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)",
                color: "#0B1020",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "16px 36px",
                borderRadius: "100px",
                textDecoration: "none",
                boxShadow: "0 8px 30px rgba(110,231,249,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              Hire Digital Studio
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </FadeUp>
      </main>

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setActiveItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                background: "#0E1428",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "32px",
                maxWidth: "600px",
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 30px 100px rgba(0,0,0,0.8)",
              }}
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={activeItem.image} 
                alt={activeItem.title} 
                style={{ width: "100%", maxHeight: "340px", objectFit: "cover" }} 
              />
              <div style={{ padding: "36px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: activeItem.color, textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                  {activeItem.category}
                </span>
                <h3 className="clash" style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>
                  {activeItem.title}
                </h3>
                <p style={{ fontSize: "15px", color: "#A5B4C7", lineHeight: 1.7, marginBottom: "28px" }}>
                  {activeItem.desc}
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setActiveItem(null)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      padding: "12px 24px",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Close
                  </button>
                  <a 
                    href={"https://wa.me/919999999999?text=Hi%20Olive%20Seeds,%20I%20am%20interested%20in%20customizing%20a%20digital%20system%20similar%20to%20your%20portfolio%20project%20\"" + encodeURIComponent(activeItem.title) + "\". Please share pricing details."}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "linear-gradient(135deg, #6EE7F9 0%, #8B7CFF 100%)",
                      color: "#0B1020",
                      padding: "12px 28px",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    💬 Order Design Customization
                  </a>
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

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);
