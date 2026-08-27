import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { 
  MdAdd, MdEdit, MdDelete, MdClose, MdHelpOutline, 
  MdSearch, MdCheckCircle, MdFormatListNumbered, MdCategory
} from "react-icons/md";

const FAQ_CATEGORIES = ["General", "Ordering", "Shipping", "Products", "Digital Downloads", "Returns & Refunds"];

const INIT_FAQ = {
  question: "",
  answer: "",
  category: "General",
  display_order: 0,
  is_published: true
};

export default function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT_FAQ);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const fetchFaqs = async () => {
    try {
      const res = await API.get("/faqs/admin/all");
      setFaqs(res.data);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openAdd = () => {
    setForm(INIT_FAQ);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (faq) => {
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "General",
      display_order: faq.display_order || 0,
      is_published: faq.is_published !== false
    });
    setEditId(faq.id);
    setShowForm(true);
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      alert("Please fill in both Question and Answer fields.");
      return;
    }

    try {
      if (editId) {
        await API.put(`/faqs/${editId}`, form);
        setToast("FAQ updated successfully!");
      } else {
        await API.post("/faqs", form);
        setToast("FAQ created successfully!");
      }
      setShowForm(false);
      fetchFaqs();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      alert("Failed to save FAQ. Please try again.");
    }
  };

  const removeFaq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await API.delete(`/faqs/${id}`);
      fetchFaqs();
      setToast("FAQ deleted");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
      alert("Failed to delete FAQ");
    }
  };

  const togglePublished = async (faq) => {
    try {
      await API.put(`/faqs/${faq.id}`, {
        ...faq,
        is_published: !faq.is_published
      });
      fetchFaqs();
      setToast(`FAQ ${!faq.is_published ? "published" : "unpublished"}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to toggle FAQ:", err);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="FAQ Manager" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl">
          {/* Header section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdHelpOutline className="text-indigo-600 text-xl" /> FAQ Manager
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {faqs.length} Total FAQs
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage questions and answers displayed on /faq page with automatic Google & AI JSON-LD Schema markup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[240px]">
                <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-stone-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
              >
                <MdAdd className="text-base" /> Add New FAQ
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* FAQs List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading FAQ records...</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No FAQs found matching your criteria.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="p-5 hover:bg-stone-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <MdCategory className="text-xs" /> {faq.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Order: #{faq.display_order}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">{faq.question}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{faq.answer.replace(/<[^>]+>/g, '')}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => togglePublished(faq)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition ${
                          faq.is_published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {faq.is_published ? "Published" : "Draft"}
                      </button>

                      <button
                        onClick={() => openEdit(faq)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit FAQ"
                      >
                        <MdEdit className="text-base" />
                      </button>

                      <button
                        onClick={() => removeFaq(faq.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete FAQ"
                      >
                        <MdDelete className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base">
                    {editId ? "✏️ Edit FAQ" : "✨ Add New FAQ"}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                    <MdClose className="text-xl" />
                  </button>
                </div>

                <form onSubmit={saveFaq} className="p-6 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Question *</label>
                    <input
                      type="text"
                      required
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      placeholder="e.g., How long does custom engraving take?"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {FAQ_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Display Order</label>
                      <input
                        type="number"
                        value={form.display_order}
                        onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Answer *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.answer}
                      onChange={(e) => setForm({ ...form, answer: e.target.value })}
                      placeholder="Enter detailed answer..."
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="is_published" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Publish immediately on public /faq page
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-stone-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                    >
                      Save FAQ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
