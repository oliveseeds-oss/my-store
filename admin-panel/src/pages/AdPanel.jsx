import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdDelete, MdClose, MdImage, MdToggleOn, MdToggleOff } from "react-icons/md";

const INIT = { title: "", imageUrl: "", linkUrl: "", placement: "Horizontal Banner", active: true };

// PLACEMENTS with clear suggested upload dimensions
const PLACEMENTS_SUGGESTIONS = {
  "Horizontal Banner": "Wide horizontal display, suggested 1200 x 200px (Footer/Page Divider)",
  "Vertical Tower": "Vertical sidebar block, suggested 300 x 600px (Sidebar/Tower Columns)",
  "Square Tile": "Compact square panel, suggested 300 x 300px (Grid/Promos)",
  "Large Panel": "Broad rectangle display, suggested 800 x 400px (Hero/Featured Promo)"
};

export default function AdPanel() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const r = await API.get("/ads/admin/all");
      setAds(r.data);
    } catch (e) {
      console.error("Failed to fetch ads", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const save = async () => {
    if (!form.title || !form.imageUrl) {
      alert("Please fill in the Campaign Name and Image URL.");
      return;
    }
    try {
      await API.post("/ads", {
        title: form.title,
        image_url: form.imageUrl,
        link_url: form.linkUrl || "/products",
        placement: form.placement,
        is_active: form.active ? 1 : 0
      });
      setShowForm(false);
      setForm(INIT);
      fetchAds();
    } catch (e) {
      alert("Failed to save ad: " + (e.response?.data?.error || e.message));
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await API.put(`/ads/${id}`, { is_active: currentActive ? 0 : 1 });
      fetchAds();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand promotion ad panel?")) return;
    try {
      await API.delete(`/ads/${id}`);
      fetchAds();
    } catch (e) {
      alert("Failed to delete ad");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Ad Banner Management" />
        <main className="p-6 flex flex-col gap-4">

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed shadow-sm">
            <strong>💡 Brand Promotion Panel Settings:</strong> Ads on the public site render directly as full-size clickable image panels matching the selected orientation (Horizontal, Vertical, Square, or Large Panel) with no text overlays or button wrappers. Ensure your uploaded images look stunning and have these dimensions for the absolute best aesthetics!
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              {ads.filter((a) => a.is_active).length} active ads ·{" "}
              {ads.filter((a) => !a.is_active).length} inactive
            </p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                         text-white text-sm px-4 py-2 rounded-lg transition shadow-md font-bold">
              <MdAdd className="text-lg" /> Create Brand Panel Ad
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ads.map((ad) => (
                <div key={ad.id}
                  className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition
                    ${ad.is_active ? "border-gray-100 shadow-sm" : "border-gray-100 opacity-60"}`}>
                  <div className="w-24 h-16 bg-gray-50 rounded-lg flex items-center
                                  justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                    {ad.image_url
                      ? <img src={ad.image_url} alt="" className="w-full h-full object-contain rounded-lg" />
                      : <MdImage className="text-2xl text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{ad.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100/50">
                        {ad.placement}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 font-mono">
                        Target: {ad.link_url || "/products"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(ad.id, ad.is_active)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg
                                  border font-bold transition
                        ${ad.is_active
                          ? "text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50"
                          : "text-gray-400 border-gray-200 hover:bg-gray-50"}`}>
                      {ad.is_active
                        ? <><MdToggleOn className="text-lg text-green-500" /> Active</>
                        : <><MdToggleOff className="text-lg" /> Inactive</>}
                    </button>
                    <button onClick={() => remove(ad.id)}
                      className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition">
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
              {ads.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm bg-white
                                rounded-xl border border-gray-100">
                  No ad panels created yet. Click "Create Brand Panel Ad" to upload your first promotion image!
                </div>
              )}
            </div>
          )}

          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-800 text-base">New Brand Panel Ad</h3>
                  <button onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg">
                    <MdClose />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Campaign Name / Title</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Summer Promo, Black Friday Banner"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Ad Panel Placement</label>
                    <select
                      value={form.placement}
                      onChange={(e) => setForm({ ...form, placement: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-semibold text-gray-700">
                      {Object.keys(PLACEMENTS_SUGGESTIONS).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-indigo-500 font-bold mt-1.5">
                      📐 {PLACEMENTS_SUGGESTIONS[form.placement]}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Image / Asset URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Redirect Target Link (Optional)</label>
                    <input
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      placeholder="/products or custom landing page url..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2
                                 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-600">Make active immediately</span>
                  </label>
                  <button onClick={save}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
                               rounded-lg py-2.5 text-sm transition mt-3 shadow-md shadow-indigo-100">
                    Create Brand Panel Ad
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