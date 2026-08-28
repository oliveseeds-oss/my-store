import React, { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { 
  MdAdd, MdEdit, MdDelete, MdClose, MdArticle, 
  MdSearch, MdSettings, MdCode, MdRemoveRedEye, MdUploadFile, MdImage
} from "react-icons/md";

const INIT = { 
  title: "", 
  content: "", 
  image: "", 
  category: "General", 
  author: "Admin",
  slug: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  noIndex: false,
  status: "published"
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [htmlView, setHtmlView] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const quillRef = useRef(null);

  const fetchBlogs = () => {
    API.get("/blogs")
      .then((res) => {
        const formatted = res.data.map(p => ({
          ...p,
          id: p.id,
          title: p.title || "",
          content: p.content || "",
          image: p.image_url || "",
          category: p.category || "General",
          author: p.author || "Admin",
          slug: p.slug || "",
          tags: p.tags || "",
          metaTitle: p.meta_title || "",
          metaDescription: p.meta_description || "",
          focusKeyword: p.focus_keyword || "",
          canonicalUrl: p.canonical_url || "",
          ogTitle: p.og_title || "",
          ogDescription: p.og_description || "",
          ogImage: p.og_image || "",
          noIndex: Boolean(p.no_index),
          status: p.status || "published",
          date: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
        }));
        setPosts(formatted);
      })
      .catch((err) => console.error("Failed to fetch blogs:", err));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAdd = () => { 
    setForm(INIT); 
    setEditId(null); 
    setActiveTab("content");
    setHtmlView(false);
    setLivePreview(false);
    setShowForm(true); 
  };
  
  const openEdit = (p) => { 
    setForm({
      ...p,
      image: p.image || p.image_url || "",
      metaTitle: p.metaTitle || p.meta_title || p.title || "",
      metaDescription: p.metaDescription || p.meta_description || "",
      slug: p.slug || "",
      tags: p.tags || "",
      focusKeyword: p.focusKeyword || p.focus_keyword || "",
      canonicalUrl: p.canonicalUrl || p.canonical_url || "",
      ogTitle: p.ogTitle || p.og_title || p.metaTitle || p.title || "",
      ogDescription: p.ogDescription || p.og_description || p.metaDescription || "",
      ogImage: p.ogImage || p.og_image || p.image || "",
      noIndex: Boolean(p.noIndex || p.no_index),
      status: p.status || "published"
    }); 
    setEditId(p.id); 
    setActiveTab("content");
    setHtmlView(false);
    setLivePreview(false);
    setShowForm(true); 
  };

  // Sync title & description to OG fields if empty
  const handleTitleChange = (val) => {
    setForm(prev => ({
      ...prev,
      title: val,
      metaTitle: prev.metaTitle === prev.title ? val : prev.metaTitle,
      ogTitle: prev.ogTitle === prev.title ? val : prev.ogTitle
    }));
  };

  const handleMetaTitleChange = (val) => {
    setForm(prev => ({
      ...prev,
      metaTitle: val,
      ogTitle: prev.ogTitle === prev.metaTitle || !prev.ogTitle ? val : prev.ogTitle
    }));
  };

  const handleMetaDescChange = (val) => {
    setForm(prev => ({
      ...prev,
      metaDescription: val,
      ogDescription: prev.ogDescription === prev.metaDescription || !prev.ogDescription ? val : prev.ogDescription
    }));
  };

  const save = async () => {
    if (!form.title || !form.content) {
      alert("Title and Content are required.");
      return;
    }
    
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category || "General",
      author: form.author || "Admin",
      image_url: form.image || "",
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      tags: form.tags || "",
      meta_title: form.metaTitle || form.title,
      meta_description: form.metaDescription || "",
      focus_keyword: form.focusKeyword || "",
      canonical_url: form.canonicalUrl || "",
      og_title: form.ogTitle || form.metaTitle || form.title,
      og_description: form.ogDescription || form.metaDescription || "",
      og_image: form.ogImage || form.image || "",
      no_index: form.noIndex ? 1 : 0,
      status: form.status || "published"
    };
    
    try {
      if (editId) {
        await API.put(`/blogs/${editId}`, payload);
      } else {
        await API.post("/blogs", payload);
      }
      setShowForm(false);
      fetchBlogs();
    } catch (err) {
      console.error("Failed to save blog:", err);
      alert("Failed to save blog. Please check connection and try again.");
    }
  };
  
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      fetchBlogs();
      if (preview && preview.id === id) {
        setPreview(null);
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Failed to delete blog. Please try again.");
    }
  };

  // Image Upload handler for Quill
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    API.post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((res) => {
        const imageUrl = res.data.url;
        setForm(prev => ({
          ...prev,
          content: prev.content + `<p><img src="${imageUrl}" alt="Uploaded image" class="my-4 rounded-xl max-w-full" /></p>`
        }));
      })
      .catch((err) => {
        console.error("Image upload failed:", err);
        // Fallback file reader if server upload endpoint differs
        const reader = new FileReader();
        reader.onload = (event) => {
          setForm(prev => ({
            ...prev,
            content: prev.content + `<p><img src="${event.target.result}" alt="Uploaded image" class="my-4 rounded-xl max-w-full" /></p>`
          }));
        };
        reader.readAsDataURL(file);
      })
      .finally(() => setUploadingImage(false));
  };

  // Insert Image URL handler
  const promptImageByUrl = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      setForm(prev => ({
        ...prev,
        content: prev.content + `<p><img src="${url}" alt="Image" class="my-4 rounded-xl max-w-full" /></p>`
      }));
    }
  };

  // ReactQuill Modules Configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"]
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  const tabs = [
    { id: "content", label: "Content & Editor", icon: <MdArticle /> },
    { id: "seo", label: "SEO & Social", icon: <MdSearch /> },
    { id: "settings", label: "Settings", icon: <MdSettings /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Blog Manager" />
        <main className="p-6 flex flex-col gap-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Blog Posts</h1>
              <p className="text-xs text-gray-500">HTML Rich Text Editor, Live SEO Meta Tags & AI Discovery Schema</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                         text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow">
              <MdAdd className="text-base" /> New Post
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.map((p) => (
              <div key={p.id}
                className="group bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 
                           hover:shadow-md hover:border-indigo-100 transition cursor-pointer"
                onClick={() => setPreview(p)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 
                                       px-2.5 py-1 rounded-full">{p.category || "Uncategorized"}</span>
                      {p.image && <MdImage className="text-gray-300" />}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        p.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-2 text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition">
                      {p.title}
                    </h3>
                  </div>
                  <MdArticle className="text-3xl text-gray-100 flex-shrink-0 group-hover:text-indigo-100 transition" />
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {p.content.replace(/<[^>]+>/g, '')}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1 text-xs">
                  <p className="text-gray-400">{p.date} · {p.author}</p>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                      <MdEdit className="text-sm" />
                    </button>
                    <button onClick={() => remove(p.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <MdDelete className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">
                      {editId ? "✏️ Edit Blog Post" : "✨ Create New Blog Post"}
                    </h3>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                    <MdClose className="text-xl" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 px-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition
                        ${activeTab === tab.id 
                          ? "border-indigo-600 text-indigo-600" 
                          : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  
                  {/* CONTENT TAB */}
                  {activeTab === "content" && (
                    <div className="space-y-4">
                      {/* Title & Slug */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                            Post Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="e.g., 10 Tips for Laser Engraving Wood"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                            URL Slug
                          </label>
                          <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            placeholder="auto-generated-slug"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Category, Author, Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1.5 block">Category</label>
                          <input
                            type="text"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="Tutorial, News, Design"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1.5 block">Author</label>
                          <input
                            type="text"
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1.5 block">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                            placeholder="wood, engraving, design"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Rich Text Editor Toolbar Header */}
                      <div className="flex items-center justify-between pt-2">
                        <label className="text-xs font-bold text-gray-700">Content (HTML Rich Text Editor) *</label>

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 border border-stone-200">
                            <MdUploadFile className="text-base" /> Upload Image
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>

                          <button
                            type="button"
                            onClick={promptImageByUrl}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold px-3 py-1 rounded-lg transition border border-stone-200"
                          >
                            Image by URL
                          </button>

                          <button
                            type="button"
                            onClick={() => setHtmlView(!htmlView)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition flex items-center gap-1 ${
                              htmlView ? "bg-amber-500 text-white border-amber-600" : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            <MdCode className="text-base" /> {htmlView ? "Visual View" : "HTML Source"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setLivePreview(!livePreview)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition flex items-center gap-1 ${
                              livePreview ? "bg-indigo-600 text-white border-indigo-700" : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            <MdRemoveRedEye className="text-base" /> {livePreview ? "Hide Preview" : "Preview Mode"}
                          </button>
                        </div>
                      </div>

                      {/* Main Editor Component */}
                      {livePreview ? (
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 min-h-[300px]">
                          <div className="prose max-w-none text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content) }} />
                        </div>
                      ) : htmlView ? (
                        <textarea
                          rows={12}
                          value={form.content}
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl p-4 text-xs font-mono bg-stone-900 text-emerald-400 leading-relaxed focus:outline-none"
                        />
                      ) : (
                        <div className="bg-white">
                          <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={form.content}
                            onChange={(content) => setForm({ ...form, content })}
                            modules={quillModules}
                            className="rounded-xl overflow-hidden min-h-[260px]"
                          />
                        </div>
                      )}

                      {/* Cover Image URL */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">Featured / Cover Image URL</label>
                        <input
                          type="text"
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value, ogImage: form.ogImage || e.target.value })}
                          placeholder="https://example.com/cover.jpg"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* SEO TAB (UPDATE 2) */}
                  {activeTab === "seo" && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-800">
                        <strong>SEO & AI Discovery Optimization:</strong> Controls search engine snippet formatting, Open Graph social sharing cards, and search crawler index permissions.
                      </div>

                      {/* Meta Title */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Meta Title (max 60 chars) *</label>
                          <span className={`text-xs font-mono font-bold ${form.metaTitle.length > 60 ? "text-rose-500" : "text-gray-400"}`}>
                            {form.metaTitle.length}/60
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={60}
                          value={form.metaTitle}
                          onChange={(e) => handleMetaTitleChange(e.target.value)}
                          placeholder="Compelling title for search engine results..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Meta Description */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">Meta Description (max 160 chars) *</label>
                          <span className={`text-xs font-mono font-bold ${form.metaDescription.length > 160 ? "text-rose-500" : "text-gray-400"}`}>
                            {form.metaDescription.length}/160
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={160}
                          value={form.metaDescription}
                          onChange={(e) => handleMetaDescChange(e.target.value)}
                          placeholder="A concise summary of the blog post to encourage search engine click-throughs..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Focus Keyword & Canonical URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Focus Keyword</label>
                          <input
                            type="text"
                            value={form.focusKeyword}
                            onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                            placeholder="e.g. custom wood engraving"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">Canonical URL (Optional)</label>
                          <input
                            type="text"
                            value={form.canonicalUrl}
                            onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                            placeholder="https://oliveseedsdesignstudio.com/blog/original-post"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Open Graph (Social Sharing) */}
                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Open Graph Social Card (Facebook / Twitter)</h4>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">OG Title</label>
                          <input
                            type="text"
                            value={form.ogTitle}
                            onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">OG Description</label>
                          <textarea
                            rows={2}
                            value={form.ogDescription}
                            onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">OG Image URL</label>
                          <input
                            type="text"
                            value={form.ogImage}
                            onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* No-index toggle */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <input
                          type="checkbox"
                          id="noIndex"
                          checked={form.noIndex}
                          onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="noIndex" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          No-index post (Prevents search engines like Google from indexing this post)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SETTINGS TAB */}
                  {activeTab === "settings" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">Publish Status</label>
                        <select 
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={save}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                  >
                    {editId ? "💾 Save Changes" : "🚀 Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {preview && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{preview.category}</span>
                    <span className="text-xs text-gray-400">{preview.date}</span>
                  </div>
                  <button onClick={() => setPreview(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                    <MdClose className="text-xl" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {preview.image && (
                    <img 
                      src={preview.image} 
                      alt={preview.title}
                      className="w-full h-64 object-cover rounded-xl border border-gray-100" 
                    />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{preview.title}</h1>
                  <div className="text-xs text-gray-500 pb-4 border-b border-gray-100">
                    By {preview.author} · {preview.date}
                  </div>
                  <div 
                    className="prose max-w-none text-xs text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview.content) }}
                  />
                </div>
                
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button 
                    onClick={() => { openEdit(preview); setPreview(null); }}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  >
                    <MdEdit className="text-base" /> Edit This Post
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
