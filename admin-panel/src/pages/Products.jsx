import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BulkUploadModal from "../components/BulkUploadModal";
import API from "../api";
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload, MdDownload, MdEditNote } from "react-icons/md";

const INIT = {
  product_uid: "", name: "", description: "", price: "", discount_price: "",
  category_id: "", stock: "", image_url: "",
  images: "", sizes: "", tags: "", is_active: true
};

const TAG_OPTIONS = ["Best Seller", "New Arrival", "Limited Edition", "Top Rated", "Flash Sale", "Staff Pick"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [bulkModal, setBulkModal] = useState({ isOpen: false, type: "physical", mode: "upload" });
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await API.get("/admin/products/physical/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "physical_products.csv");
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
      API.get("/products/admin/all"),
      API.get("/categories?type=physical"),
    ]);
    setProducts(p.data);
    setCategories(c.data);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(INIT); setEditId(null); setShowForm(true);
  };
  const openEdit = (p) => {
    setForm({
      ...p,
      images: Array.isArray(p.images) ? p.images.join(", ") : p.images || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
    });
    setEditId(p.id); setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return;
    const payload = {
      ...form,
      images: form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [],
      sizes: form.sizes ? form.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    if (editId) await API.put(`/products/${editId}`, payload);
    else await API.post("/products", payload);
    load(); setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    load();
  };

  // PERSONALIZATION CONFIG STATE
  const [showPers, setShowPers] = useState(false);
  const [persForm, setPersForm] = useState({
    enable_personalization: false,
    allow_multiple_templates: false,
    templates: []
  });
  const [persProduct, setPersProduct] = useState(null);

  const openPersonalization = async (p) => {
    setPersProduct(p);
    try {
      const res = await API.get(`/products/admin/${p.id}/personalization`);
      setPersForm(res.data);
      setShowPers(true);
    } catch (err) {
      alert("Failed to load personalization settings");
    }
  };

  const savePersonalization = async () => {
    try {
      await API.post(`/products/admin/${persProduct.id}/personalization`, persForm);
      alert("✅ Personalization settings saved successfully!");
      setShowPers(false);
    } catch (err) {
      alert("Failed to save personalization: " + (err.response?.data?.error || err.message));
    }
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      callback(res.data.url);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  const addTemplate = () => {
    setPersForm(prev => ({
      ...prev,
      templates: [
        ...prev.templates,
        {
          name: `Template ${prev.templates.length + 1}`,
          preview_image: "",
          background_image: "",
          sort_order: prev.templates.length,
          is_active: true,
          fields: []
        }
      ]
    }));
  };

  const removeTemplate = (tIdx) => {
    setPersForm(prev => ({
      ...prev,
      templates: prev.templates.filter((_, idx) => idx !== tIdx)
    }));
  };

  const updateTemplate = (tIdx, key, val) => {
    setPersForm(prev => {
      const copy = [...prev.templates];
      copy[tIdx] = { ...copy[tIdx], [key]: val };
      return { ...prev, templates: copy };
    });
  };

  const addField = (tIdx) => {
    setPersForm(prev => {
      const copy = [...prev.templates];
      copy[tIdx].fields = [
        ...copy[tIdx].fields,
        {
          label: "New Field",
          field_key: `field_${copy[tIdx].fields.length + 1}`,
          type: "text",
          is_required: false,
          placeholder: "",
          help_text: "",
          min_chars: "",
          max_chars: "",
          default_value: "",
          sort_order: copy[tIdx].fields.length,
          status: "active",
          options: [],
          x_pos: "",
          y_pos: "",
          font_family: "sans-serif",
          font_size: "16",
          font_color: "#000000",
          text_align: "left",
          max_width: "",
          rotation: ""
        }
      ];
      return { ...prev, templates: copy };
    });
  };

  const removeField = (tIdx, fIdx) => {
    setPersForm(prev => {
      const copy = [...prev.templates];
      copy[tIdx].fields = copy[tIdx].fields.filter((_, idx) => idx !== fIdx);
      return { ...prev, templates: copy };
    });
  };

  const updateField = (tIdx, fIdx, key, val) => {
    setPersForm(prev => {
      const copy = [...prev.templates];
      const field = { ...copy[tIdx].fields[fIdx], [key]: val };
      copy[tIdx].fields[fIdx] = field;
      return { ...prev, templates: copy };
    });
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Physical products" />
        <main className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-200 w-64" />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleExportCsv("physical")}
                disabled={exporting}
                className="flex items-center gap-1.5 bg-white border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 text-gray-700 text-sm px-3.5 py-2 rounded-lg font-semibold shadow-xs transition"
              >
                <MdDownload className="text-base text-emerald-600" />
                {exporting ? "Exporting..." : "Export All as CSV"}
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "physical", mode: "upload" })}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm px-3.5 py-2 rounded-lg font-bold transition"
              >
                <MdCloudUpload className="text-base" /> Bulk Upload
              </button>
              <button
                type="button"
                onClick={() => setBulkModal({ isOpen: true, type: "physical", mode: "update" })}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm px-3.5 py-2 rounded-lg font-bold transition"
              >
                <MdEditNote className="text-base" /> Bulk Update
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                           text-white text-sm px-4 py-2 rounded-lg font-semibold transition shadow-xs">
                <MdAdd /> Add product
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
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                       <div className="flex items-center gap-3">
                        {(p.image_url || (p.images && p.images[0])) && (
                          <img src={p.image_url || p.images[0]} alt=""
                            className="w-10 h-10 object-cover rounded-lg" />
                        )}
                        <div>
                          <span className="font-medium text-gray-700 block">{p.name}</span>
                          <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5 font-bold">
                            {p.product_uid}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || "—"}</td>
                    <td className="px-4 py-3 font-medium">₹{p.price}</td>
                    <td className="px-4 py-3 text-green-600">
                      {p.discount_price ? `₹${p.discount_price}` : "—"}
                    </td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(Array.isArray(p.tags) ? p.tags : []).slice(0,2).map(t => (
                          <span key={t} className="text-xs bg-indigo-50 text-indigo-600
                                                    px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500">★</span> {p.rating || "0"} ({p.review_count || 0})
                    </td>
                    <td className="px-4 py-3 flex gap-1 items-center">
                      <button onClick={() => openEdit(p)}
                        title="Edit product info"
                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg">
                        <MdEdit />
                      </button>
                      <button onClick={() => openPersonalization(p)}
                        title="Personalization (Engraving)"
                        className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg flex items-center gap-1 font-bold text-xs">
                        ✏️ Custom
                      </button>
                      <button onClick={() => remove(p.id)}
                        title="Delete product"
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
                    {editId ? "Edit product" : "Add product"}
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
                      placeholder="e.g. PRD-1001"
                      disabled={!!editId}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50 disabled:text-gray-400" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Product name</label>
                    <input value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Wooden circle nameboard dark gold"
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
                    <p className="text-xs text-gray-400 mt-1">
                      Add new categories in the Categories page
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Stock qty</label>
                    <input value={form.stock}
                      onChange={e => setForm({ ...form, stock: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Original price (₹)</label>
                    <input value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 799"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Discount price (₹) <span className="text-gray-300">— optional</span>
                    </label>
                    <input value={form.discount_price}
                      onChange={e => setForm({ ...form, discount_price: e.target.value })}
                      placeholder="e.g. 599 (leave blank for no discount)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Main image URL</label>
                    <input value={form.image_url}
                      onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://... (first/main image)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Additional image URLs
                      <span className="text-gray-400"> — separate with commas</span>
                    </label>
                    <input value={form.images}
                      onChange={e => setForm({ ...form, images: e.target.value })}
                      placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Available sizes
                      <span className="text-gray-400"> — separate with commas</span>
                    </label>
                    <input value={form.sizes}
                      onChange={e => setForm({ ...form, sizes: e.target.value })}
                      placeholder="Small, Medium, Large, XL  or  6x4 inch, 8x6 inch, 12x8 inch"
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
                              const next = selected
                                ? tags.filter(x => x !== t)
                                : [...tags, t];
                              setForm({ ...form, tags: next.join(", ") });
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition
                              ${selected
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <input value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })}
                      placeholder="Best Seller, New Arrival (or type custom tags)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                    <textarea value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      placeholder="Full product description shown on product page..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox"
                       checked={form.is_active}
                       onChange={e => setForm({ ...form, is_active: e.target.checked })}
                       className="rounded" />
                    <label className="text-sm text-gray-600">Show on website (active)</label>
                  </div>
                </div>

                <button onClick={save}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white
                             rounded-lg py-2.5 text-sm font-medium transition">
                  {editId ? "Save changes" : "Add product"}
                </button>
              </div>
            </div>
          )}

          {/* DEDICATED PERSONALIZATION SETTINGS MODAL */}
          {showPers && persProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl w-full max-w-4xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col gap-5">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">Engraving Control</span>
                    <h3 className="font-extrabold text-gray-800 text-lg mt-1">
                      Customize Personalization — {persProduct.name}
                    </h3>
                  </div>
                  <button onClick={() => setShowPers(false)} className="hover:bg-gray-100 p-2 rounded-full transition">
                    <MdClose className="text-gray-400 text-xl" />
                  </button>
                </div>

                {/* Primary Settings */}
                <div className="bg-gradient-to-r from-stone-50 to-stone-100/50 border border-stone-200/60 rounded-2xl p-4 flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" id="enable_pers_toggle"
                      checked={persForm.enable_personalization}
                      onChange={e => setPersForm({ ...persForm, enable_personalization: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                    <label htmlFor="enable_pers_toggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                      Enable Personalization (Engraving)
                    </label>
                  </div>
                  
                  {persForm.enable_personalization && (
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" id="allow_multi_toggle"
                        checked={persForm.allow_multiple_templates}
                        onChange={e => setPersForm({ ...persForm, allow_multiple_templates: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                      <label htmlFor="allow_multi_toggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                        Allow Multiple Templates Selection
                      </label>
                    </div>
                  )}
                </div>

                {persForm.enable_personalization ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                        Templates ({persForm.templates.length})
                      </h4>
                      <button onClick={addTemplate}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-amber-100 flex items-center gap-1.5">
                        <MdAdd /> Add Template Option
                      </button>
                    </div>

                    {persForm.templates.map((temp, tIdx) => (
                      <div key={tIdx} className="border border-stone-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4 relative">
                        {/* Remove Template Button */}
                        <button onClick={() => removeTemplate(tIdx)}
                          className="absolute top-4 right-4 text-red-500 bg-red-50 hover:bg-red-100 text-xs px-2.5 py-1.5 rounded-lg font-bold transition">
                          Remove Template
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Template Name</label>
                            <input value={temp.name}
                              onChange={e => updateTemplate(tIdx, "name", e.target.value)}
                              placeholder="e.g. Classic Script / Modern Initials"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200" />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Sort Order</label>
                            <input type="number" value={temp.sort_order}
                              onChange={e => updateTemplate(tIdx, "sort_order", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200" />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Status</label>
                            <select value={temp.is_active}
                              onChange={e => updateTemplate(tIdx, "is_active", e.target.value === "true")}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white">
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </div>
                        </div>

                        {/* Image Upload Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Preview Image URL / File</label>
                            <div className="flex gap-2">
                              <input value={temp.preview_image}
                                onChange={e => updateTemplate(tIdx, "preview_image", e.target.value)}
                                placeholder="/uploads/preview.jpg or upload..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200" />
                              <label className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer border border-amber-200 transition flex items-center justify-center">
                                Upload File
                                <input type="file" accept="image/*" className="hidden"
                                  onChange={e => handleFileUpload(e, (url) => updateTemplate(tIdx, "preview_image", url))} />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Background Image URL (Optional)</label>
                            <div className="flex gap-2">
                              <input value={temp.background_image || ""}
                                onChange={e => updateTemplate(tIdx, "background_image", e.target.value)}
                                placeholder="Base product background..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200" />
                              <label className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer border border-amber-200 transition flex items-center justify-center">
                                Upload File
                                <input type="file" accept="image/*" className="hidden"
                                  onChange={e => handleFileUpload(e, (url) => updateTemplate(tIdx, "background_image", url))} />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Fields inside Template */}
                        <div className="mt-2 border-t border-dashed border-gray-200 pt-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
                              Custom Input Fields for {temp.name} ({temp.fields.length})
                            </h5>
                            <button onClick={() => addField(tIdx)}
                              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold px-3.5 py-1.5 rounded-lg transition border border-indigo-100">
                              + Add Input Field
                            </button>
                          </div>

                          {temp.fields.map((field, fIdx) => (
                            <div key={fIdx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col gap-3 relative">
                              <button onClick={() => removeField(tIdx, fIdx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                                title="Delete Field">
                                ×
                              </button>

                              {/* Main Config */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Field Label</label>
                                  <input value={field.label}
                                    onChange={e => updateField(tIdx, fIdx, "label", e.target.value)}
                                    placeholder="e.g. Engraving Name"
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white" />
                                </div>
                                
                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Field Key (Internal ID)</label>
                                  <input value={field.field_key}
                                    onChange={e => updateField(tIdx, fIdx, "field_key", e.target.value)}
                                    placeholder="e.g. customer_name"
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white" />
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Input Type</label>
                                  <select value={field.type}
                                    onChange={e => updateField(tIdx, fIdx, "type", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white">
                                    <option value="text">Single Line Text</option>
                                    <option value="textarea">Multi-line Text</option>
                                    <option value="number">Number</option>
                                    <option value="date">Date</option>
                                    <option value="dropdown">Dropdown</option>
                                    <option value="radio">Radio Button</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="image">Image Upload</option>
                                    <option value="file">File Upload</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Validation & Req</label>
                                  <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                      <input type="checkbox" checked={field.is_required}
                                        onChange={e => updateField(tIdx, fIdx, "is_required", e.target.checked)}
                                        className="rounded text-indigo-600 border-gray-300" />
                                      Required
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Help & Limits */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="md:col-span-2">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Placeholder & Help Text</label>
                                  <div className="flex gap-2">
                                    <input value={field.placeholder || ""}
                                      onChange={e => updateField(tIdx, fIdx, "placeholder", e.target.value)}
                                      placeholder="Placeholder text"
                                      className="w-1/2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                    <input value={field.help_text || ""}
                                      onChange={e => updateField(tIdx, fIdx, "help_text", e.target.value)}
                                      placeholder="Help/instructions text"
                                      className="w-1/2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Min / Max Characters</label>
                                  <div className="flex gap-1.5">
                                    <input type="number" value={field.min_chars || ""}
                                      onChange={e => updateField(tIdx, fIdx, "min_chars", e.target.value)}
                                      placeholder="Min"
                                      className="w-1/2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                    <input type="number" value={field.max_chars || ""}
                                      onChange={e => updateField(tIdx, fIdx, "max_chars", e.target.value)}
                                      placeholder="Max"
                                      className="w-1/2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Sort & Default</label>
                                  <div className="flex gap-1.5">
                                    <input type="number" value={field.sort_order}
                                      onChange={e => updateField(tIdx, fIdx, "sort_order", e.target.value)}
                                      placeholder="Order"
                                      className="w-1/3 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                    <input value={field.default_value || ""}
                                      onChange={e => updateField(tIdx, fIdx, "default_value", e.target.value)}
                                      placeholder="Default value"
                                      className="w-2/3 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                                  </div>
                                </div>
                              </div>

                              {/* Dropdown Options (Optional) */}
                              {["dropdown", "radio", "checkbox"].includes(field.type) && (
                                <div>
                                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Dropdown / Options list (comma-separated)</label>
                                  <input
                                    value={Array.isArray(field.options) ? field.options.join(", ") : field.options || ""}
                                    onChange={e => updateField(tIdx, fIdx, "options", e.target.value.split(",").map(x => x.trim()).filter(Boolean))}
                                    placeholder="Classic Font, Gothic Font, Script Font"
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                                  />
                                </div>
                              )}

                              {/* Positioning details (Optional for Preview Layout overlay) */}
                              {["text", "textarea", "number", "date"].includes(field.type) && (
                                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                                  <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest block">🎨 Optional text layout positioning (for customer live preview overlay)</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-8 gap-2">
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">X Position (px)</label>
                                      <input type="number" value={field.x_pos || ""}
                                        onChange={e => updateField(tIdx, fIdx, "x_pos", e.target.value)}
                                        placeholder="e.g. 150"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Y Position (px)</label>
                                      <input type="number" value={field.y_pos || ""}
                                        onChange={e => updateField(tIdx, fIdx, "y_pos", e.target.value)}
                                        placeholder="e.g. 200"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Font Size (px)</label>
                                      <input type="number" value={field.font_size || ""}
                                        onChange={e => updateField(tIdx, fIdx, "font_size", e.target.value)}
                                        placeholder="e.g. 24"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Color (Hex)</label>
                                      <input value={field.font_color || ""}
                                        onChange={e => updateField(tIdx, fIdx, "font_color", e.target.value)}
                                        placeholder="#000"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Font Family</label>
                                      <select value={field.font_family || "sans-serif"}
                                        onChange={e => updateField(tIdx, fIdx, "font_family", e.target.value)}
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white">
                                        <option value="sans-serif">Sans-Serif (Standard)</option>
                                        <option value="serif">Serif (Classic)</option>
                                        <option value="monospace">Monospace</option>
                                        <option value="cursive">Cursive (Script)</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Max Width</label>
                                      <input type="number" value={field.max_width || ""}
                                        onChange={e => updateField(tIdx, fIdx, "max_width", e.target.value)}
                                        placeholder="e.g. 300"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-gray-400 block mb-0.5">Rotation (°)</label>
                                      <input type="number" value={field.rotation || ""}
                                        onChange={e => updateField(tIdx, fIdx, "rotation", e.target.value)}
                                        placeholder="e.g. 15"
                                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs" />
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-xs">
                    🔒 Personalization is disabled for this product. Check the box above to enable templates and dynamic engraving fields configuration.
                  </div>
                )}

                {/* Save Footer */}
                <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
                  <button onClick={() => setShowPers(false)}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs px-5 py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                  <button onClick={savePersonalization}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-100 transition">
                    Save Customization Configuration
                  </button>
                </div>

              </div>
            </div>
          )}
          {/* Bulk Upload / Update Modal */}
          <BulkUploadModal
            isOpen={bulkModal.isOpen}
            onClose={() => setBulkModal({ ...bulkModal, isOpen: false })}
            type={bulkModal.type}
            initialMode={bulkModal.mode}
            onComplete={load}
          />
        </main>
      </div>
    </div>
  );
}