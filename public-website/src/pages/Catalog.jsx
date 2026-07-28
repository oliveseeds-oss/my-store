import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const INIT_FORM = { name: "", type: "physical", description: "", image_url: "" };

export default function Catalog() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Admin Panel States
  const [showAdmin, setShowAdmin] = useState(false);
  const [form, setForm] = useState(INIT_FORM);
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadCatalog = () => {
    setLoading(true);
    API.get("/categories?type=physical")
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

  // Filter Categories by Name or Description (Search Engine)
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Form Handlers
  const handleEditClick = (c) => {
    setForm({
      name: c.name,
      type: c.type || "physical",
      description: c.description || "",
      image_url: c.image_url || ""
    });
    setEditId(c.id);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setForm(INIT_FORM);
    setEditId(null);
    setErrorMsg("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    try {
      if (editId) {
        await API.put(`/categories/${editId}`, form);
        setSuccessMsg("Category updated successfully!");
      } else {
        await API.post("/categories", form);
        setSuccessMsg("Category created successfully!");
      }
      
      // Reset form and reload
      setForm(INIT_FORM);
      setEditId(null);
      setErrorMsg("");
      loadCatalog();
      
      // Auto-clear success message
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to save category. Admin authentication required.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Products under this category will become unassigned.`)) {
      return;
    }

    try {
      await API.delete(`/categories/${id}`);
      setSuccessMsg("Category deleted successfully!");
      loadCatalog();
      if (editId === id) {
        handleCancelEdit();
      }
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete category. Admin token required.");
    }
  };

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

          {/* Search Engine and Admin Controls row */}
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

            {/* Admin Side Panel Toggle Button */}
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-6 py-3.5 rounded-full text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer whitespace-nowrap"
            >
              <Icons.Settings size={18} />
              Admin Controls
            </button>
          </div>
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
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/60 shadow-sm">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No Matching Collections</h3>
            <p className="text-stone-400 text-xs">Try searching for other keywords, or adjust your spelling filters.</p>
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

      {/* ADMIN CONTROL SIDE PANEL */}
      <div 
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${showAdmin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
      >
        {/* Panel Container */}
        <div 
          className={`w-full max-w-md bg-stone-900 text-stone-100 h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${showAdmin ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.Settings size={20} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Catalog Admin Controls</h2>
            </div>
            <button 
              onClick={() => setShowAdmin(false)}
              className="text-stone-400 hover:text-stone-100 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <Icons.Close size={20} />
            </button>
          </div>

          {/* Panel Contents - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Status alerts */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold animate-fade-in">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* Category Form */}
            <form onSubmit={handleSave} className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-800/80">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                {editId ? "Edit Category Details" : "Create New Category"}
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Category Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Backlit Acrylic Panels"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Category Type</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 outline-none transition-all cursor-pointer"
                >
                  <option value="physical">Physical Crafts</option>
                  <option value="digital">Digital Assets</option>
                  <option value="both">Both Types</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Image URL</label>
                <input 
                  type="text" 
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">Short Description</label>
                <textarea 
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe materials, designs, and styles..."
                  rows="3"
                  className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {editId ? "Update Category" : "Add Category"}
                </button>
                {editId && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* List of existing categories inside the side panel */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Manage Collections</h3>
              <div className="space-y-2">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-stone-950 border border-stone-800/80 rounded-xl gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.name} className="w-10 height-10 rounded-lg object-cover flex-shrink-0" style={{ height: "40px", width: "40px" }} />
                      ) : (
                        <div className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🪵</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                        <span className="text-[9px] uppercase tracking-wider text-amber-500/85 font-medium">{c.type || "physical"}</span>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button 
                        onClick={() => handleEditClick(c)}
                        className="text-stone-400 hover:text-amber-500 p-1.5 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Icons.Edit size={15} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-stone-400 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Icons.Trash size={15} />
                      </button>
                    </div>
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
