import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdDelete, MdClose, MdFilterList } from "react-icons/md";

const INIT = { image_url: "", title: "", description: "", category: "" };

export default function PortfolioAdmin() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [filter, setFilter] = useState({ category: "" });

  const load = () => {
    let url = "/portfolio/admin/all";
    if (filter.category) {
      url = `/portfolio?category=${encodeURIComponent(filter.category)}`;
    }
    API.get(url).then(r => setItems(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const save = async () => {
    if (!form.image_url || !form.title) return;
    await API.post("/portfolio", form);
    load();
    setForm(INIT);
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this project from the website portfolio?")) return;
    await API.delete(`/portfolio/${id}`);
    load();
  };

  // Get unique categories for filters
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Portfolio Designer Showcase Manager" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Portfolio Showcase Items</h2>
              <p className="text-xs text-gray-400">Add reference photos showing off custom case studies and premium client project designs</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow">
              <MdAdd className="text-lg" /> Add Portfolio Project
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
              <MdFilterList /> Filter Portfolio:
            </div>
            <select value={filter.category} onChange={e => setFilter({ category: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-700">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setFilter({ category: "" })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 ml-auto">
              Reset Filter
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(i => (
              <div key={i.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                <img src={i.image_url} alt={i.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-350" />
                <button onClick={() => remove(i.id)}
                  className="absolute top-2.5 right-2.5 bg-red-500 hover:bg-red-650 text-white p-1.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100">
                  <MdDelete />
                </button>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="font-bold text-xs text-gray-800 line-clamp-1">{i.title || "Untitled"}</p>
                  <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">{i.description}</p>
                  <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {i.category && <span className="bg-indigo-50 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-bold">{i.category}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-extrabold text-gray-800 text-sm">Add Portfolio Design Case</h3>
                  <button onClick={() => setShowForm(false)}>
                    <MdClose className="text-gray-400 text-xl" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-xs font-semibold text-gray-600">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Image URL *</label>
                    <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Project Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Premium React Dashboard Kit"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
                    <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. React Apps"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Description / Concept</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g. A gorgeous luxury dark workspace design system..."
                      rows="3"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300 resize-none" />
                  </div>
                </div>

                <button onClick={save}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider mt-2 transition">
                  Save Project to Portfolio
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
