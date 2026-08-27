import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import {
  MdSearch, MdSettings, MdHealthAndSafety, MdSave, MdCheckCircle,
  MdWarning, MdError, MdUploadFile, MdFormatQuote, MdCode, MdLayers
} from "react-icons/md";

const STATIC_PAGES = [
  { key: "home", name: "Home (/)", url: "/" },
  { key: "products", name: "Products (/products)", url: "/products" },
  { key: "blog", name: "Blog (/blog)", url: "/blog" },
  { key: "faq", name: "FAQ (/faq)", url: "/faq" },
  { key: "bulk-order", name: "Bulk Order (/bulk-order)", url: "/bulk-order" },
  { key: "about", name: "About Us (/about)", url: "/about" },
  { key: "contact", name: "Contact (/contact)", url: "/contact" },
];

const DYNAMIC_PAGE_TYPES = [
  { key: "type_product", name: "Product Pages (Global Default)", url: "/product/:slug" },
  { key: "type_blog", name: "Blog Post Pages (Global Default)", url: "/blog/:slug" },
  { key: "type_category", name: "Category Pages (Global Default)", url: "/category/:slug" },
];

const INIT_SEO_FORM = {
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  keywords: "",
  canonical_url: "",
  no_index: false,
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  custom_schema: "",
};

const INIT_GLOBAL_SETTINGS = {
  site_name: "Olive Seeds Studio",
  title_separator: "|",
  default_meta_description: "Custom printed products — t-shirts, mugs, canvas prints, digital downloads. Ships to 17 countries worldwide.",
  default_og_image: "https://oliveseedsdesignstudio.com/logo192.png",
  site_logo_url: "https://oliveseedsdesignstudio.com/logo192.png",
  google_verify_code: "",
  bing_verify_code: "",
  yandex_verify_code: "",
  baidu_verify_code: "",
  naver_verify_code: "",
  pinterest_verify_code: "",
  ga4_id: "",
  facebook_pixel_id: "",
  robots_txt: `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /cart

Sitemap: https://oliveseedsdesignstudio.com/sitemap.xml`,
};

export default function SeoSettings() {
  const [activeTab, setActiveTab] = useState("page"); // 'page', 'global', 'health'
  const [selectedKey, setSelectedKey] = useState("home");
  const [seoForm, setSeoForm] = useState(INIT_SEO_FORM);
  const [globalSettings, setGlobalSettings] = useState(INIT_GLOBAL_SETTINGS);
  const [healthData, setHealthData] = useState(null);

  // Dynamic products and blogs lists
  const [productsList, setProductsList] = useState([]);
  const [blogsList, setBlogsList] = useState([]);
  const [pageImages, setPageImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Keyword tag input temporary state
  const [tagInput, setTagInput] = useState("");

  // Load initial product and blog lists for individual SEO assignment
  useEffect(() => {
    API.get("/products").then(res => setProductsList(res.data || [])).catch(() => {});
    API.get("/blogs").then(res => setBlogsList(res.data || [])).catch(() => {});
    fetchGlobalSettings();
  }, []);

  // Fetch page specific SEO settings when selectedKey changes
  useEffect(() => {
    if (activeTab === "page") {
      fetchPageSeo(selectedKey);
    }
  }, [selectedKey, activeTab]);

  // Fetch global settings
  const fetchGlobalSettings = async () => {
    try {
      const res = await API.get("/seo/global");
      if (res.data && Object.keys(res.data).length > 0) {
        setGlobalSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error("Failed to load global SEO settings:", err);
    }
  };

  // Fetch page SEO
  const fetchPageSeo = async (key) => {
    setLoading(true);
    try {
      let endpoint = `/seo/page/${key}`;
      if (key.startsWith("product_")) {
        const pid = key.replace("product_", "");
        endpoint = `/seo/product/${pid}`;
      } else if (key.startsWith("blog_")) {
        const bid = key.replace("blog_", "");
        endpoint = `/seo/blog/${bid}`;
      }

      const res = await API.get(endpoint);
      if (res.data && res.data.page_key) {
        setSeoForm({
          meta_title: res.data.meta_title || "",
          meta_description: res.data.meta_description || "",
          focus_keyword: res.data.focus_keyword || "",
          keywords: res.data.keywords || "",
          canonical_url: res.data.canonical_url || `https://oliveseedsdesignstudio.com/${key === "home" ? "" : key}`,
          no_index: !!res.data.no_index,
          og_title: res.data.og_title || "",
          og_description: res.data.og_description || "",
          og_image: res.data.og_image || "",
          twitter_card: res.data.twitter_card || "summary_large_image",
          twitter_title: res.data.twitter_title || "",
          twitter_description: res.data.twitter_description || "",
          twitter_image: res.data.twitter_image || "",
          custom_schema: res.data.custom_schema || "",
        });
      } else {
        setSeoForm({
          ...INIT_SEO_FORM,
          canonical_url: `https://oliveseedsdesignstudio.com/${key === "home" ? "" : key}`
        });
      }

      // Fetch images used on this page for Alt Text editing
      if (key.startsWith("product_")) {
        const pid = key.replace("product_", "");
        const prod = productsList.find(p => String(p.id) === String(pid));
        if (prod) {
          setPageImages([{ id: prod.id, url: prod.image_url, alt: prod.image_alt || "" }]);
        }
      } else {
        setPageImages([]);
      }
    } catch (err) {
      console.error("Failed to load page SEO:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save Page SEO
  const handleSavePageSeo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let endpoint = `/seo/page/${selectedKey}`;
      if (selectedKey.startsWith("product_")) {
        const pid = selectedKey.replace("product_", "");
        endpoint = `/seo/product/${pid}`;
      } else if (selectedKey.startsWith("blog_")) {
        const bid = selectedKey.replace("blog_", "");
        endpoint = `/seo/blog/${bid}`;
      }

      await API.post(endpoint, seoForm);
      setToast("SEO Settings Saved Successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to save SEO:", err);
      alert("Failed to save SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  // Save Global SEO
  const handleSaveGlobalSeo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/seo/global", globalSettings);
      setToast("Global SEO Settings Saved!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to save global SEO:", err);
      alert("Failed to save global SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  // Run Health Check
  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const res = await API.get("/seo/health");
      setHealthData(res.data);
    } catch (err) {
      console.error("Failed to run SEO health check:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "health") {
      runHealthCheck();
    }
  }, [activeTab]);

  // Keyword tag helpers
  const keywordArray = (seoForm.keywords || "").split(",").map(k => k.trim()).filter(Boolean);

  const addKeywordTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const updated = [...new Set([...keywordArray, tagInput.trim()])].join(", ");
      setSeoForm({ ...seoForm, keywords: updated });
      setTagInput("");
    }
  };

  const removeKeywordTag = (tagToRemove) => {
    const updated = keywordArray.filter(k => k !== tagToRemove).join(", ");
    setSeoForm({ ...seoForm, keywords: updated });
  };

  // Live Auto-fill from Meta Title & Description
  const handleMetaTitleChange = (val) => {
    setSeoForm(prev => ({
      ...prev,
      meta_title: val,
      og_title: prev.og_title || val,
      twitter_title: prev.twitter_title || val
    }));
  };

  const handleMetaDescChange = (val) => {
    setSeoForm(prev => ({
      ...prev,
      meta_description: val,
      og_description: prev.og_description || val,
      twitter_description: prev.twitter_description || val
    }));
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="SEO Manager & Head Inserter" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 max-w-7xl">

          {/* Header & Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdSearch className="text-emerald-600 text-2xl" /> Comprehensive SEO Control Panel
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  Global Meta & Schema Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure custom title tags, OpenGraph social cards, Twitter cards, custom JSON-LD schemas, and alt tags for every page.
              </p>
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab("page")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "page" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <MdLayers /> Page SEO Config
              </button>
              <button
                onClick={() => setActiveTab("global")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "global" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <MdSettings /> Global Site Settings
              </button>
              <button
                onClick={() => setActiveTab("health")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "health" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <MdHealthAndSafety /> SEO Health Check
              </button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
              <MdCheckCircle className="text-emerald-400 text-lg" />
              {toast}
            </div>
          )}

          {/* TAB 1: PAGE SEO CONFIG */}
          {activeTab === "page" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* SECTION A: PAGE SELECTOR SIDEBAR (Mobile responsive dropdown + Desktop list) */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-4">
                
                {/* Mobile Dropdown Selector */}
                <div className="lg:hidden">
                  <label className="text-xs font-bold text-gray-700 mb-1.5 block">Select Page to Edit SEO:</label>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full bg-stone-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
                  >
                    <optgroup label="Static Pages">
                      {STATIC_PAGES.map(p => (
                        <option key={p.key} value={p.key}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Dynamic Page Defaults">
                      {DYNAMIC_PAGE_TYPES.map(p => (
                        <option key={p.key} value={p.key}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Individual Products">
                      {productsList.map(p => (
                        <option key={`product_${p.id}`} value={`product_${p.id}`}>Product: {p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Individual Blogs">
                      {blogsList.map(b => (
                        <option key={`blog_${b.id}`} value={`blog_${b.id}`}>Blog: {b.title}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Desktop Page Selector List */}
                <div className="hidden lg:flex flex-col gap-4 overflow-y-auto max-h-[700px] pr-1">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Static Pages</h4>
                    <div className="flex flex-col gap-1">
                      {STATIC_PAGES.map(p => (
                        <button
                          key={p.key}
                          onClick={() => setSelectedKey(p.key)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            selectedKey === p.key ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200" : "text-gray-600 hover:bg-stone-50"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Dynamic Page Defaults</h4>
                    <div className="flex flex-col gap-1">
                      {DYNAMIC_PAGE_TYPES.map(p => (
                        <button
                          key={p.key}
                          onClick={() => setSelectedKey(p.key)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            selectedKey === p.key ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200" : "text-gray-600 hover:bg-stone-50"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Individual Products ({productsList.length})</h4>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                      {productsList.map(p => (
                        <button
                          key={`product_${p.id}`}
                          onClick={() => setSelectedKey(`product_${p.id}`)}
                          className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium truncate transition ${
                            selectedKey === `product_${p.id}` ? "bg-amber-50 text-amber-800 font-bold border border-amber-200" : "text-gray-600 hover:bg-stone-50"
                          }`}
                        >
                          📦 {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Individual Blog Posts ({blogsList.length})</h4>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                      {blogsList.map(b => (
                        <button
                          key={`blog_${b.id}`}
                          onClick={() => setSelectedKey(`blog_${b.id}`)}
                          className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium truncate transition ${
                            selectedKey === `blog_${b.id}` ? "bg-indigo-50 text-indigo-800 font-bold border border-indigo-200" : "text-gray-600 hover:bg-stone-50"
                          }`}
                        >
                          📝 {b.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION B: SEO EDITING FORM FOR SELECTED PAGE */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                {loading ? (
                  <div className="p-16 text-center text-xs text-gray-400">Loading page SEO data...</div>
                ) : (
                  <form onSubmit={handleSavePageSeo} className="space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">
                          Editing SEO for: <span className="text-indigo-600 font-mono">{selectedKey}</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Customize canonical tags, search snippet text, and social share cards.</p>
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <MdSave className="text-base" /> {saving ? "Saving..." : "Save SEO Config"}
                      </button>
                    </div>

                    {/* BASIC SEO */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <MdSearch className="text-indigo-600 text-base" /> Basic Search Engine Meta
                      </h4>

                      {/* Meta Title */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Meta Title *</label>
                          <span className={`text-[11px] font-mono font-bold ${seoForm.meta_title.length > 60 ? "text-rose-600" : "text-emerald-600"}`}>
                            {seoForm.meta_title.length}/60 chars
                          </span>
                        </div>
                        <input
                          type="text"
                          value={seoForm.meta_title}
                          onChange={(e) => handleMetaTitleChange(e.target.value)}
                          placeholder="Page title shown in Google search results"
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      {/* Meta Description */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Meta Description *</label>
                          <span className={`text-[11px] font-mono font-bold ${seoForm.meta_description.length > 160 ? "text-rose-600" : "text-emerald-600"}`}>
                            {seoForm.meta_description.length}/160 chars
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={seoForm.meta_description}
                          onChange={(e) => handleMetaDescChange(e.target.value)}
                          placeholder="Description shown under title in Google results"
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 resize-none font-medium"
                        />
                      </div>

                      {/* Focus Keyword & Keyword Density Tip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Focus Keyword</label>
                          <input
                            type="text"
                            value={seoForm.focus_keyword}
                            onChange={(e) => setSeoForm({ ...seoForm, focus_keyword: e.target.value })}
                            placeholder="Main keyword this page targets"
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          {seoForm.focus_keyword && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              💡 Tip: Ensure "{seoForm.focus_keyword}" appears in your meta title and description.
                            </p>
                          )}
                        </div>

                        {/* Canonical URL */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Canonical URL</label>
                          <input
                            type="text"
                            value={seoForm.canonical_url}
                            onChange={(e) => setSeoForm({ ...seoForm, canonical_url: e.target.value })}
                            placeholder="https://oliveseedsdesignstudio.com/..."
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Additional Keyword Tags Input */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1 block">Additional Keywords / Tags (Press Enter to Add)</label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 border border-gray-200 rounded-xl min-h-[44px] items-center">
                          {keywordArray.map(tag => (
                            <span key={tag} className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              {tag}
                              <button type="button" onClick={() => removeKeywordTag(tag)} className="hover:text-rose-600 font-black">×</button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addKeywordTag}
                            placeholder={keywordArray.length === 0 ? "Type keyword and press Enter..." : "Add more..."}
                            className="bg-transparent text-xs focus:outline-none flex-1 min-w-[140px] px-1"
                          />
                        </div>
                      </div>

                      {/* No-Index Toggle */}
                      <div className="p-4 bg-stone-50 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-gray-800 block">No-Index Search Engines</span>
                          <span className="text-[11px] text-gray-500">Instruct search crawlers to hide this page from index results.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={seoForm.no_index}
                            onChange={(e) => setSeoForm({ ...seoForm, no_index: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                      {seoForm.no_index && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                          <MdWarning className="text-base text-rose-600 shrink-0" />
                          <span>⚠️ Warning: This page will be completely hidden from Google search results!</span>
                        </div>
                      )}
                    </div>

                    {/* OPEN GRAPH (SOCIAL SHARING) */}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <MdFormatQuote className="text-indigo-600 text-base" /> Open Graph (Facebook / WhatsApp / LinkedIn)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">OG Title</label>
                          <input
                            type="text"
                            value={seoForm.og_title}
                            onChange={(e) => setSeoForm({ ...seoForm, og_title: e.target.value })}
                            placeholder="Defaults to Meta Title"
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">OG Image URL (Recommended 1200x630px)</label>
                          <input
                            type="text"
                            value={seoForm.og_image}
                            onChange={(e) => setSeoForm({ ...seoForm, og_image: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1 block">OG Description</label>
                        <textarea
                          rows={2}
                          value={seoForm.og_description}
                          onChange={(e) => setSeoForm({ ...seoForm, og_description: e.target.value })}
                          placeholder="Defaults to Meta Description"
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {seoForm.og_image && (
                        <div className="p-3 bg-stone-50 border border-gray-200 rounded-xl flex items-center gap-3">
                          <img src={seoForm.og_image} alt="OG Preview" className="w-20 h-12 object-cover rounded-lg border border-gray-200" />
                          <span className="text-[11px] text-gray-500 font-mono">Image Preview Banner Loaded</span>
                        </div>
                      )}
                    </div>

                    {/* TWITTER CARD */}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <MdFormatQuote className="text-indigo-600 text-base" /> Twitter / X Sharing Cards
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Twitter Card Type</label>
                          <select
                            value={seoForm.twitter_card}
                            onChange={(e) => setSeoForm({ ...seoForm, twitter_card: e.target.value })}
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="summary_large_image">Summary Card with Large Image</option>
                            <option value="summary">Standard Summary Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Twitter Title</label>
                          <input
                            type="text"
                            value={seoForm.twitter_title}
                            onChange={(e) => setSeoForm({ ...seoForm, twitter_title: e.target.value })}
                            placeholder="Defaults to OG Title"
                            className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CUSTOM SCHEMA MARKUP OVERRIDE */}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <MdCode className="text-indigo-600 text-base" /> Custom JSON-LD Schema Override
                      </h4>

                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1 block">Custom JSON-LD Code (Appended alongside auto-generated schema)</label>
                        <textarea
                          rows={4}
                          value={seoForm.custom_schema}
                          onChange={(e) => setSeoForm({ ...seoForm, custom_schema: e.target.value })}
                          placeholder='{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'
                          className="w-full bg-stone-900 text-emerald-400 font-mono text-xs p-4 rounded-xl focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Submit Button Footer */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        <MdSave className="text-lg" /> {saving ? "Saving Changes..." : "Save Page SEO Settings"}
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: GLOBAL SITE SEO SETTINGS */}
          {activeTab === "global" && (
            <form onSubmit={handleSaveGlobalSeo} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Global Site Brand & Search Engine Verifications</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Master defaults for all unconfigured pages and search console verification tags.</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <MdSave className="text-base" /> {saving ? "Saving..." : "Save Global Settings"}
                </button>
              </div>

              {/* Brand Defaults */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Brand / Site Name Suffix</label>
                  <input
                    type="text"
                    value={globalSettings.site_name}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, site_name: e.target.value })}
                    className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Title Separator</label>
                  <select
                    value={globalSettings.title_separator}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, title_separator: e.target.value })}
                    className="w-full bg-stone-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="|">| (Pipe)</option>
                    <option value="-">- (Dash)</option>
                    <option value="•">• (Bullet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Default Fallback Meta Description</label>
                <textarea
                  rows={2}
                  value={globalSettings.default_meta_description}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, default_meta_description: e.target.value })}
                  className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Search Engine Verification Tags */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Search Engine Verification Codes</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Google Search Console</label>
                    <input
                      type="text"
                      value={globalSettings.google_verify_code}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, google_verify_code: e.target.value })}
                      placeholder="google-site-verification code"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Bing Webmaster</label>
                    <input
                      type="text"
                      value={globalSettings.bing_verify_code}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, bing_verify_code: e.target.value })}
                      placeholder="msvalidate.01 code"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Pinterest Claim Code</label>
                    <input
                      type="text"
                      value={globalSettings.pinterest_verify_code}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, pinterest_verify_code: e.target.value })}
                      placeholder="p:domain_verify code"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Google Analytics GA4 ID</label>
                    <input
                      type="text"
                      value={globalSettings.ga4_id}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, ga4_id: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Yandex Verification</label>
                    <input
                      type="text"
                      value={globalSettings.yandex_verify_code}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, yandex_verify_code: e.target.value })}
                      placeholder="yandex-verification code"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Baidu Verification</label>
                    <input
                      type="text"
                      value={globalSettings.baidu_verify_code}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, baidu_verify_code: e.target.value })}
                      placeholder="baidu-site-verification code"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Robots.txt Editor */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Live Robots.txt Editor</h4>
                <textarea
                  rows={5}
                  value={globalSettings.robots_txt}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, robots_txt: e.target.value })}
                  className="w-full bg-stone-900 text-emerald-400 font-mono text-xs p-4 rounded-xl focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  Save Global SEO Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SEO HEALTH CHECKER */}
          {activeTab === "health" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <MdHealthAndSafety className="text-emerald-600 text-2xl" /> Live Automated SEO Audit
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Scans all catalog items, pages, and meta parameters for optimization gaps.</p>
                </div>
                <button
                  onClick={runHealthCheck}
                  className="bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Re-run Audit
                </button>
              </div>

              {loading || !healthData ? (
                <div className="p-16 text-center text-xs text-gray-400">Running SEO audit...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Item 1: Missing Title */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800">Pages Missing Meta Title</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${healthData.missingTitle.length === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {healthData.missingTitle.length === 0 ? "Good ✓" : `${healthData.missingTitle.length} Warning`}
                      </span>
                    </div>
                    {healthData.missingTitle.length > 0 && (
                      <div className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-gray-100 max-h-24 overflow-y-auto">
                        {healthData.missingTitle.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Item 2: Missing Description */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800">Pages Missing Meta Description</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${healthData.missingDesc.length === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {healthData.missingDesc.length === 0 ? "Good ✓" : `${healthData.missingDesc.length} Warning`}
                      </span>
                    </div>
                    {healthData.missingDesc.length > 0 && (
                      <div className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-gray-100 max-h-24 overflow-y-auto">
                        {healthData.missingDesc.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Item 3: Title Over 60 Chars */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800">Titles Exceeding 60 Characters</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${healthData.titleOver60.length === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {healthData.titleOver60.length === 0 ? "Good ✓" : `${healthData.titleOver60.length} Problem`}
                      </span>
                    </div>
                  </div>

                  {/* Item 4: Products Missing Image Alt */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800">Products Missing Image Alt Tags</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${healthData.productsMissingAlt.length === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {healthData.productsMissingAlt.length === 0 ? "Good ✓" : `${healthData.productsMissingAlt.length} Warning`}
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
