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
    <div style={{ background: "#FFFFFF", minHeight: "100vh", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO 
        title="Browse Categories | Olive Seeds Design Studio"
        description="Browse our bespoke design objects, digital design systems, and custom studio collections."
        keywords="bespoke commissions, digital templates, brand systems, category collection"
      />
      <Navbar />

      <section style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E7E7E2",
        padding: "50px 24px",
        color: "#181A18",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#23483D", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Catalog Directory</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#181A18", marginBottom: "12px" }}>Browse By Category</h1>
          <p style={{ color: "#676A65", fontSize: "14px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
            Select a category to explore hand-finished physical objects, premium digital design systems, and bespoke studio solutions.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {[...Array(6)].map((_, idx) => (
              <div key={idx} style={{ background: "#FFFFFF", padding: "20px", borderRadius: "4px", border: "1px solid #E7E7E2", height: "300px" }} className="animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "#F8F8F6", borderRadius: "4px", border: "1px solid #E7E7E2" }}>
            <span style={{ fontSize: "40px" }}>🪵</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 500, color: "#181A18", marginTop: "16px" }}>No Categories Created Yet</h3>
            <p style={{ fontSize: "13px", color: "#676A65", marginTop: "6px" }}>Check back soon as we add bespoke objects and digital design systems.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {categories.map((c) => {
              const linkTarget = c.type === "digital" 
                ? `/digital?category=${encodeURIComponent(c.name)}`
                : `/products?category=${encodeURIComponent(c.name)}`;
              return (
                <Link 
                  key={c.id} 
                  to={linkTarget}
                  className="group"
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", background: "#FFFFFF", border: "1px solid #E7E7E2", borderRadius: "4px", overflow: "hidden", transition: "all 0.2s ease" }}
                >
                  <div style={{ aspectRatio: "1.3/1", overflow: "hidden", background: "#F8F8F6", position: "relative", borderBottom: "1px solid #E7E7E2" }}>
                    {c.image_url ? (
                      <img 
                        src={c.image_url} 
                        alt={c.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
                        🪵
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                        background: "#F8F8F6",
                        border: c.type === "digital" ? "1px solid #23483D" : "1px solid #A48855",
                        color: c.type === "digital" ? "#23483D" : "#A48855",
                        padding: "3px 8px", borderRadius: "4px"
                      }}>
                        {c.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "19px", fontWeight: 500, color: "#181A18", margin: "0 0 6px" }}>{c.name}</h2>
                    <p style={{ fontSize: "12px", color: "#676A65", lineHeight: 1.5, margin: "0 0 14px" }}>{c.description || "Browse custom size templates and premium material selections."}</p>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#23483D", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "auto" }}>
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
