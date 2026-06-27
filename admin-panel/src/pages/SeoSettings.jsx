import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";

const PAGES = [
  { id: "home", name: "Homepage" },
  { id: "products", name: "Physical Products catalog" },
  { id: "digital", name: "Digital products market" },
  { id: "blogs", name: "Blogs list journal" },
  { id: "about", name: "About Us info" },
  { id: "contact", name: "Contact desk inquiry" },
];

export default function SeoSettings() {
  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    meta_description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    image_alt: "",
  });

  useEffect(() => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    API.get(`/seo/${activePage}`)
      .then((res) => {
        setForm({
          title: res.data.title || "",
          meta_description: res.data.meta_description || "",
          keywords: res.data.keywords || "",
          og_title: res.data.og_title || "",
          og_description: res.data.og_description || "",
          og_image: res.data.og_image || "",
          image_alt: res.data.image_alt || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load SEO configs:", err);
        setErrorMsg("Failed to load SEO configuration.");
      })
      .finally(() => setLoading(false));
  }, [activePage]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.put(`/seo/${activePage}`, form);
      setSuccessMsg("SEO configurations saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("SEO update failed:", err);
      setErrorMsg("Failed to save SEO configuration. Verify admin session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-800">
      <Sidebar />
      <main className="flex-1 p-10 max-w-6xl">
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Search Engine Optimization (SEO) Manager</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Configure dynamic search listings, metadata keywords, OpenGraph titles and alternative image descriptions for every storefront section.</p>
          </div>
        </header>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold flex items-center gap-2 animate-bounce">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            ❌ {errorMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: PAGE SELECTOR */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 mb-3 px-2">Storefront Sections</h3>
            {PAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                  activePage === p.id
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* MAIN FORM: EDIT SEO FIELDS */}
          <div className="lg:col-span-9 space-y-8">
            <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-950 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Configure metadata: {PAGES.find(p => p.id === activePage)?.name}</span>
                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">page: {activePage}</span>
              </h2>

              {loading ? (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <span className="text-sm font-semibold">Loading SEO settings...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* TITLE */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Meta Page Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Title displayed on search engine tabs"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Recommended length: 50–60 characters. Max 255. Shows on browser tabs and search headings.</p>
                  </div>

                  {/* META DESCRIPTION */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      rows={3}
                      required
                      value={form.meta_description}
                      onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                      placeholder="Snippet explaining the page layout to search spiders"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Recommended length: 150–160 characters. Renders under search title headers.</p>
                  </div>

                  {/* KEYWORDS */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Search Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={form.keywords}
                      onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                      placeholder="e.g. engraving, teakwood carvings, notion templates, react"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Separating terms with commas helps organic spiders index page concepts.</p>
                  </div>

                  {/* ALT IMAGE DESCRIPTIONS */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Featured Image ALT Description (Alt text)</label>
                    <input
                      type="text"
                      value={form.image_alt}
                      onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                      placeholder="Alt text describing main imagery for organic image search"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Essential for visually impaired accessibility and organic ranking in Google Image searches.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    {/* SOCIAL OG:TITLE */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">OpenGraph Title (Social share)</label>
                      <input
                        type="text"
                        value={form.og_title}
                        onChange={(e) => setForm({ ...form, og_title: e.target.value })}
                        placeholder="Title for Facebook, Twitter, and LinkedIn shares"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                      />
                    </div>

                    {/* SOCIAL OG:DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">OpenGraph Description (Social share)</label>
                      <input
                        type="text"
                        value={form.og_description}
                        onChange={(e) => setForm({ ...form, og_description: e.target.value })}
                        placeholder="Description for Facebook, Twitter, and LinkedIn shares"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 tracking-wider uppercase transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save SEO Configurations"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* PREVIEW CARDS ROW */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* GOOGLE INDEX SIMULATOR CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 mb-4">Google Search Simulator</h3>
                  <div className="border border-gray-100 rounded-xl p-5 bg-gray-50 flex flex-col gap-1.5 font-sans leading-snug">
                    <span className="text-[12px] text-[#202124] hover:underline cursor-pointer block truncate font-normal">
                      https://olive-seeds.com/{activePage === "home" ? "" : activePage}
                    </span>
                    <h4 className="text-[19px] text-[#1a0dab] hover:underline cursor-pointer font-medium font-sans tracking-normal leading-tight line-clamp-1">
                      {form.title || "Premium Custom Engraving & templates | Olive Seeds"}
                    </h4>
                    <p className="text-[14px] text-[#4d5156] font-sans font-normal line-clamp-2 leading-relaxed">
                      {form.meta_description || "Dynamic page metadata representation on Google search feeds."}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-normal">Simulated render of organic layout. Updates instantly as you type inside fields above.</p>
              </div>

              {/* SOCIAL MEDIA SHARE SIMULATOR CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 mb-4">Social Media Feed Simulator</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex flex-col font-sans">
                    {/* Mock Image Box */}
                    <div className="aspect-video bg-indigo-950 flex flex-col items-center justify-center text-center p-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-pink-900/20" />
                      <span className="text-4xl relative z-10">✨</span>
                      <h5 className="text-white text-base font-black tracking-tight mt-3 relative z-10">Olive Seeds Creative</h5>
                      <span className="text-[10px] text-indigo-300 font-mono uppercase tracking-widest mt-1 relative z-10">
                        {form.image_alt ? `Alt Text: "${form.image_alt}"` : "Google Image Index Alt Tags"}
                      </span>
                    </div>
                    {/* Text Details */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                      <span className="text-[10.5px] uppercase tracking-wider text-gray-400 block mb-1">olive-seeds.com</span>
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1 leading-snug">
                        {form.og_title || form.title || "Olive Seeds Social Campaign"}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1 leading-relaxed">
                        {form.og_description || form.meta_description || "Social media metadata feed placeholder text."}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 leading-normal">Facebook / LinkedIn card rendering with active OpenGraph definitions.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
