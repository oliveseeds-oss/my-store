import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const INIT = { name: "", type: "physical", description: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);

  const load = () => API.get("/categories/admin/all").then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(INIT); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm(c); setEditId(c.id); setShowForm(true); };

  const save = async () => {
    if (!form.name) return;
    if (editId) await API.put(`/categories/${editId}`, form);
    else await API.post("/categories", form);
    load();
    setShowForm(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category? Products using it will lose their category.")) return;
    await API.delete(`/categories/${id}`);
    load();
  };

  const TYPE_COLOR = {
    physical: "bg-amber-100 text-amber-700",
    digital: "bg-indigo-100 text-indigo-700",
    both: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Categories" />
        <main className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {categories.length} categories total —
              categories you add here appear automatically in product dropdowns and website filters
            </p>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                         text-white text-sm px-4 py-2 rounded-lg transition">
              <MdAdd /> Add category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(c => (
              <div key={c.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex
                           items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-700 text-sm">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                     ${TYPE_COLOR[c.type]}`}>
                      {c.type}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-xs text-gray-400">{c.description}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)}
                    className="text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-lg">
                    <MdEdit />
                  </button>
                  <button onClick={() => remove(c.id)}
                    className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg">
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">
                    {editId ? "Edit category" : "Add category"}
                  </h3>
                  <button onClick={() => setShowForm(false)}>
                    <MdClose className="text-gray-400 text-xl" />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category name</label>
                    <input value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Nameboard"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                    <select value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                      <option value="physical">Physical products only</option>
                      <option value="digital">Digital products only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Description (optional)</label>
                    <input value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Short description"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  </div>
                  <button onClick={save}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                               py-2 text-sm font-medium transition">
                    {editId ? "Save changes" : "Add category"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}