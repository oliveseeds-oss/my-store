import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

export default function Catalog() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/categories?type=physical")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load catalog categories", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ background: "#F6F3EE", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <SEO 
        title="Full Engraving Workshop Catalog | Olive Seeds"
        description="Explore our full collection of premium custom-engraved categories including wooden name boards, backlit acrylic signs, custom plaques, and corporate keepsakes."
        keywords="wood engraving catalog, acrylic signs, custom corporate gifts, personal engraving collection"
      />
      <Navbar />

      {/* Header section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-stone-100 py-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,125,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block mb-3">Precision Laser Craftsmanship</span>
          <h1 className="text-4xl md:text-5xl font-light italic font-serif text-white tracking-tight mb-4">
            Full Workshop Catalog
          </h1>
          <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed">
            Browse our creative collection by category. Click any template to inspect custom materials, styles, and options, or place personalized orders.
          </p>
        </div>
      </section>

      {/* Grid container */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm animate-pulse flex flex-col gap-4">
                <div className="aspect-square bg-stone-100 rounded-2xl w-full" />
                <div className="h-4 bg-stone-150 rounded w-2/3" />
                <div className="h-3 bg-stone-150 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
            <span className="text-5xl block mb-4">🪵</span>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No Catalog Categories Found</h3>
            <p className="text-stone-400 text-xs">Category records will sync automatically once set up in the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map((c) => (
              <Link 
                key={c.id} 
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group flex flex-col bg-white rounded-3xl border border-stone-200/50 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/5 overflow-hidden transition-all duration-350"
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
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card details */}
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <h3 className="text-lg font-bold text-stone-800 tracking-tight group-hover:text-amber-800 transition duration-200">
                    {c.name}
                  </h3>
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
