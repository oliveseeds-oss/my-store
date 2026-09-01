import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BulkUploadModal from "../components/BulkUploadModal";
import API from "../api";
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload, MdDownload, MdEditNote } from "react-icons/md";

const INIT = {
  product_uid: "", name: "", description: "", price: "", discount_price: "",
  category_id: "", file_url: "", thumbnail_url: "",
  images: "", tags: "", file_size: "", file_format: "", is_active: true
};

const TAG_OPTIONS = ["Best Seller", "New Arrival", "Top Rated", "Trending", "Staff Pick", "Free Update"];

export default function DigitalProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [bulkModal, setBulkModal] = useState({ isOpen: false, type: "digital", mode: "upload" });
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await API.get("/admin/products/digital/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "digital_products.csv");
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

  const load = async () => {
    const [p, c] = await Promise.all([
      API.get("/digital-products/admin/all"),
      API.get("/categories?type=digital"),
    ]);
    setProducts(p.data);
    setCategories(c.data);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(INIT); setEditId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      ...p,
      images: Array.isArray(p.images) ? p.images.join(", ") : p.images || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
    });
    setEditId(p.id); setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      ...form,
      images: form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    if (editId) await API.put(`/digital-products/${editId}`, payload);
    else await API.post("/digital-products", payload);
    load(); setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete?")) return;
    await API.delete(`/digital-products/${id}`);
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Digital products" />
        <main className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search digital products..."
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-200 w-64" />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting}
                className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 text-gray-700 text-sm px-3.5 py-2 rounded-lg font-semibold shadow-xs transition"
              >
                <MdDownload className="text-base text-emerald-600" />
                {exporting ? "Exporting..." : "Export All as CSV"}
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "digital", mode: "upload" })}
                className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-sm px-3.5 py-2 rounded-lg font-bold transition"
              >
                <MdCloudUpload className="text-base" /> Bulk Upload
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "digital", mode: "update" })}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm px-3.5 py-2 rounded-lg font-bold transition"
              >
                <MdEditNote className="text-base" /> Bulk Update
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                           text-white text-sm px-4 py-2 rounded-lg font-semibold transition shadow-xs">
                <MdAdd /> Add digital product
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-left">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-700 block">{p.name}</span>
                      <span className="font-mono text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded inline-block mt-0.5 font-bold">
                        {p.product_uid}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || "—"}</td>
                    <td className="px-4 py-3">₹{p.price}</td>
                    <td className="px-4 py-3 text-green-600">
                      {p.discount_price ? `₹${p.discount_price}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.file_format || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(Array.isArray(p.tags) ? p.tags : []).slice(0,2).map(t => (
                          <span key={t} className="text-xs bg-sky-50 text-sky-600
                                                    px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500">★</span> {p.rating || "0"}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg">
                        <MdEdit />
                      </button>
                      <button onClick={() => remove(p.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg
                              max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">
                    {editId ? "Edit digital product" : "Add digital product"}
                  </h3>
                  <button onClick={() => setShowForm(false)}>
                    <MdClose className="text-gray-400 text-xl" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Product ID / SKU <span className="text-gray-300">— leave blank to auto-generate</span>
                    </label>
                    <input value={form.product_uid}
                      onChange={e => setForm({ ...form, product_uid: e.target.value })}
                      placeholder="e.g. DPD-1001"
                      disabled={!!editId}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50 disabled:text-gray-400" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Product name</label>
                    <input value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Complete Logo Design Kit"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select value={form.category_id}
                      onChange={e => setForm({ ...form, category_id: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                      <option value="">— Select category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">File format</label>
                    <input value={form.file_format}
                      onChange={e => setForm({ ...form, file_format: e.target.value })}
                      placeholder="e.g. AI, PNG, SVG, PDF, PSD"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Original price (₹)</label>
                    <input value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 499"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Discount price (₹)</label>
                    <input value={form.discount_price}
                      onChange={e => setForm({ ...form, discount_price: e.target.value })}
                      placeholder="e.g. 299 (optional)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">File size</label>
                    <input value={form.file_size}
                      onChange={e => setForm({ ...form, file_size: e.target.value })}
                      placeholder="e.g. 45 MB"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Download file URL</label>
                    <input value={form.file_url}
                      onChange={e => setForm({ ...form, file_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Thumbnail URL</label>
                    <input value={form.thumbnail_url}
                      onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Preview image URLs <span className="text-gray-400">— comma separated</span>
                    </label>
                    <input value={form.images}
                      onChange={e => setForm({ ...form, images: e.target.value })}
                      placeholder="https://preview1.jpg, https://preview2.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {TAG_OPTIONS.map(t => {
                        const selected = form.tags.includes(t);
                        return (
                          <button key={t} type="button"
                            onClick={() => {
                              const tags = form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [];
                              const next = selected ? tags.filter(x => x !== t) : [...tags, t];
                              setForm({ ...form, tags: next.join(", ") });
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition
                              ${selected ? "bg-indigo-600 text-white border-indigo-600"
                                         : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <textarea value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      placeholder="What's included, formats, how to use..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      className="rounded" />
                    <label className="text-sm text-gray-600">Show on website (active)</label>
                  </div>
                </div>
                <button onClick={save}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white
                             rounded-lg py-2.5 text-sm font-medium transition">
                  {editId ? "Save changes" : "Add digital product"}
                </button>
              </div>
            </div>
          )}
          {/* Bulk Upload / Update Modal */}
          <BulkUploadModal
            isOpen={bulkModal.isOpen}
            onClose={() => setBulkModal({ ...bulkModal, isOpen: false })}
            type="digital"
            initialMode={bulkModal.mode}
            onComplete={load}
          />
        </main>
      </div>
    </div>
  );
} 