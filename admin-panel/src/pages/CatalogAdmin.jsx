import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdEdit, MdDelete, MdClose, MdDownload, MdCloudUpload, MdEditNote } from "react-icons/md";
import BulkUploadModal from "../components/BulkUploadModal";

const INIT = { name: "", type: "physical", description: "", image_url: "" };

export default function CatalogAdmin() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [bulkModal, setBulkModal] = useState({ isOpen: false, type: "catalog", mode: "upload" });
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await API.get("/admin/catalog/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "catalog_collections.csv");
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

  const load = () => API.get("/catalog/admin/all").then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(INIT); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ ...INIT, ...c }); setEditId(c.id); setShowForm(true); };

  const save = async () => {
    if (!form.name) return;
    if (editId) await API.put(`/catalog/${editId}`, form);
    else await API.post("/catalog", form);
    load();
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this catalog card? This will remove it from the public website catalog page.")) return;
    await API.delete(`/catalog/${id}`);
    load();
  };

  const TYPE_COLOR = {
    physical: "bg-amber-100 text-amber-700",
    digital: "bg-indigo-100 text-indigo-700",
    both: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Catalog Collections Manager" />
        <main className="p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Website Catalog Collections</h2>
              <p className="text-xs text-gray-400">Add, edit or delete collections displayed on the public Catalog page</p>
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
                onClick={() => setBulkModal({ isOpen: true, type: "catalog", mode: "upload" })}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-2 rounded-xl font-bold transition"
              >
                <MdCloudUpload className="text-base" /> Bulk Upload
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "catalog", mode: "update" })}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs px-3 py-2 rounded-xl font-bold transition"
              >
                <MdEditNote className="text-base" /> Bulk Update
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                           text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow">
                <MdAdd /> Add Collection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex
                           items-start justify-between gap-3 shadow-sm hover:shadow-md transition">
                <div className="flex-1 flex gap-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-stone-100 rounded-xl border border-gray-205 flex items-center justify-center text-2xl flex-shrink-0">🪵</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-800 text-sm truncate">{c.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                                       ${TYPE_COLOR[c.type]}`}>
                        {c.type}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{c.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)}
                    className="text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-lg transition">
                    <MdEdit />
                  </button>
                  <button onClick={() => remove(c.id)}
                    className="text-red-450 hover:bg-red-50 p-1.5 rounded-lg transition">
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-extrabold text-gray-800 text-sm">
                    {editId ? "Edit Catalog Collection" : "Add Catalog Collection"}
                  </h3>
                  <button onClick={() => setShowForm(false)}>
                    <MdClose className="text-gray-400 text-xl" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 text-xs font-semibold text-gray-650">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Collection Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Backlit Acrylic Signs"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Collection Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                      <option value="physical">Physical Crafts</option>
                      <option value="digital">Digital Assets</option>
                      <option value="both">Both Types</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Image URL</label>
                    <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Short Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g. Elegant light designs..."
                      rows="3"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-300 resize-none" />
                  </div>
                </div>

                <button onClick={save}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider mt-2 transition shadow">
                  Save Catalog Card
                </button>
              </div>
            </div>
          )}

          {/* Bulk Upload / Update Modal */}
          <BulkUploadModal
            isOpen={bulkModal.isOpen}
            onClose={() => setBulkModal({ ...bulkModal, isOpen: false })}
            type="catalog"
            initialMode={bulkModal.mode}
            onComplete={load}
          />
        </main>
      </div>
    </div>
  );
}
