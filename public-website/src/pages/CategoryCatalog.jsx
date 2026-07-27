import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

export default function CategoryCatalog() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/categories")
      .then((res) => {
        // Already sorted by name (ORDER BY name ascending) from server
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load category catalog", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ background: "#FAF9F6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Browse Categories | Olive Seeds"
        description="Browse all our premium laser-engraved products, digital design templates, and custom studio categories."
        keywords="custom laser gifts, notion workspace templates, figma branding kits, category list"
      />
      <Navbar />

      <section style={{
        background: "linear-gradient(135deg, #0F2744 0%, #081729 100%)",
        padding: "60px 24px",
        color: "#fff",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Catalog Directory</span>
          <h1 className="clash" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "12px" }}>Browse By Category</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
            Select a specialized category to explore handcrafted physical items, premium digital templates, and custom studio solutions.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {[...Array(6)].map((_, idx) => (
              <div key={idx} style={{ background: "#FFF", padding: "20px", borderRadius: "24px", border: "1px solid var(--border)", height: "300px" }} className="animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#FFF", borderRadius: "24px", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "48px" }}>🪵</span>
            <h3 style={{ fontSize: "18px", fontWeight: 750, color: "var(--accent)", marginTop: "16px" }}>No Categories Created Yet</h3>
            <p style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "6px" }}>Check back soon as we add premium laser crafts and digital tools.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "28px" }}>
            {categories.map((c) => {
              const linkTarget = c.type === "digital" 
                ? `/digital?category=${encodeURIComponent(c.name)}`
                : `/products?category=${encodeURIComponent(c.name)}`;
              return (
                <Link 
                  key={c.id} 
                  to={linkTarget}
                  className="category-card"
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ aspectRatio: "1.3/1", overflow: "hidden", background: "#F0EBE3", position: "relative" }}>
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        alt={c.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
                        🪵
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: 750, letterSpacing: "0.08em", textTransform: "uppercase",
                        background: c.type === "digital" ? "rgba(110,231,249,0.15)" : "rgba(201,168,106,0.15)",
                        border: c.type === "digital" ? "1px solid rgba(110,231,249,0.3)" : "1px solid rgba(201,168,106,0.3)",
                        color: c.type === "digital" ? "#14B8A6" : "#B45309",
                        padding: "4px 10px", borderRadius: "100px", backdropFilter: "blur(8px)"
                      }}>
                        {c.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 750, color: "var(--accent)", margin: "0 0 6px" }}>{c.name}</h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-2)", lineHeight: 1.5, margin: "0 0 16px" }}>{c.description || "Browse custom size templates and premium material selections."}</p>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "auto" }}>
                      Explore Category →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
