import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdDelete, MdClose, MdFilterList, MdDownload, MdCloudUpload, MdEditNote } from "react-icons/md";
import BulkUploadModal from "../components/BulkUploadModal";

const INIT = { image_url: "", title: "", style: "", category: "", industry: "", material: "" };

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [filter, setFilter] = useState({ style: "", category: "", industry: "", material: "" });
  const [bulkModal, setBulkModal] = useState({ isOpen: false, type: "gallery", mode: "upload" });
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await API.get("/admin/gallery/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "gallery_showcase.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
    }
  };

  const load = () => {
    let url = "/gallery";
    const params = [];
    if (filter.style) params.push(`style=${filter.style}`);
    if (filter.category) params.push(`category=${filter.category}`);
    if (filter.industry) params.push(`industry=${filter.industry}`);
    if (filter.material) params.push(`material=${filter.material}`);
    if (params.length) url += "?" + params.join("&");

    API.get(url).then(r => setItems(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const save = async () => {
    if (!form.image_url) return;
    await API.post("/gallery", form);
    load();
    setForm(INIT);
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this image from the showcase gallery?")) return;
    await API.delete(`/gallery/${id}`);
    load();
  };

  // Get unique values for filters
  const styles = [...new Set(items.map(i => i.style).filter(Boolean))];
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const industries = [...new Set(items.map(i => i.industry).filter(Boolean))];
  const materials = [...new Set(items.map(i => i.material).filter(Boolean))];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Design Showcase Gallery Manager" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Showcase Gallery Items</h2>
              <p className="text-xs text-gray-400">Add reference photos showing off custom engravings, materials, and styles</p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting}
                className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 text-gray-700 text-xs px-3 py-2 rounded-xl font-semibold shadow-xs transition"
              >
                <MdDownload className="text-base text-emerald-600" />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "gallery", mode: "upload" })}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-2 rounded-xl font-bold transition"
              >
                <MdCloudUpload className="text-base" /> Bulk Upload
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "gallery", mode: "update" })}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs px-3 py-2 rounded-xl font-bold transition"
              >
                <MdEditNote className="text-base" /> Bulk Update
              </button>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow">
                <MdAdd className="text-lg" /> Add Photo
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
              <MdFilterList /> Filter Gallery:
            </div>
            <select value={filter.style} onChange={e => setFilter({ ...filter, style: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-700">
              <option value="">All Styles</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-700">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filter.industry} onChange={e => setFilter({ ...filter, industry: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-700">
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={filter.material} onChange={e => setFilter({ ...filter, material: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-300 font-semibold text-gray-700">
              <option value="">All Materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={() => setFilter({ style: "", category: "", industry: "", material: "" })}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 ml-auto">
              Reset Filters
            </button>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(i => (
              <div key={i.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                <img src={i.image_url} alt={i.title} className="w-full h-44 object-cover group-hover:scale-105 transition duration-350" />
                <button onClick={() => remove(i.id)}
                  className="absolute top-2.5 right-2.5 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100">
                  <MdDelete />
                </button>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="font-bold text-xs text-gray-800 line-clamp-1">{i.title || "Untitled"}</p>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {i.style && <span className="bg-indigo-50 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-bold">{i.style}</span>}
                    {i.category && <span className="bg-amber-50 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">{i.category}</span>}
                    {i.industry && <span className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">{i.industry}</span>}
                    {i.material && <span className="bg-stone-100 text-stone-800 text-[9px] px-1.5 py-0.5 rounded font-bold">{i.material}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-extrabold text-gray-800 text-sm">Add Showcase Reference Photo</h3>
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
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Title / Caption</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Premium Teakwood Doorplate"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Style</label>
                      <input type="text" value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}
                        placeholder="e.g. Minimalist"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
                      <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        placeholder="e.g. Nameplate"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Industry</label>
                      <input type="text" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
                        placeholder="e.g. Residential"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Material</label>
                      <input type="text" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}
                        placeholder="e.g. Teak Wood"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                    </div>
                  </div>
                </div>

                <button onClick={save}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider mt-2 transition">
                  Save Photo to Showcase
                </button>
              </div>
            </div>
          )}

          {/* Bulk Upload / Update Modal */}
          <BulkUploadModal
            isOpen={bulkModal.isOpen}
            onClose={() => setBulkModal({ ...bulkModal, isOpen: false })}
            type="gallery"
            initialMode={bulkModal.mode}
            onComplete={load}
          />
        </main>
      </div>
    </div>
  );
}
