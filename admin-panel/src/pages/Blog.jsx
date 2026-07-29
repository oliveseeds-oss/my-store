import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { 
  MdAdd, MdEdit, MdDelete, MdClose, MdArticle, 
  MdFormatBold, MdFormatItalic, MdFormatQuote, 
  MdHighlight, MdFormatListBulleted, MdFormatListNumbered,
  MdImage, MdSearch, MdSettings, MdPreview 
} from "react-icons/md";

const INIT = { 
  title: "", 
  content: "", 
  image: "", 
  imageAlt: "", // ✅ New: alt text
  category: "", 
  author: "Admin",
  // ✅ New: SEO fields
  metaTitle: "",
  metaDescription: "",
  slug: ""
};

export default function Blog() {
  const [posts, setPosts] = useState([
     ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // ✅ Tab state
  const contentRef = useRef(null);

  const openAdd = () => { 
    setForm(INIT); 
    setEditId(null); 
    setActiveTab("content");
    setShowForm(true); 
  };
  
  const openEdit = (p) => { 
    setForm({
      ...p,
      imageAlt: p.imageAlt || "",
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      slug: p.slug || ""
    }); 
    setEditId(p.id); 
    setActiveTab("content");
    setShowForm(true); 
  };
  
  const save = () => {
    if (!form.title || !form.content) return;
    const today = new Date().toISOString().split("T")[0];
    
    // Auto-generate slug if empty
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (editId) {
      setPosts(posts.map((p) => (p.id === editId ? { ...form, id: editId, date: p.date, slug } : p)));
    } else {
      setPosts([...posts, { ...form, id: Date.now(), date: today, slug }]);
    }
    setShowForm(false);
  };
  
  const remove = (id) => setPosts(posts.filter((p) => p.id !== id));

  // ✅ Rich text formatting helpers
  const insertFormatting = (prefix, suffix = prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end) || "your text";
    const newText = form.content.substring(0, start) + prefix + selectedText + suffix + form.content.substring(end);
    
    setForm({ ...form, content: newText });
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // ✅ Format helpers for preview
  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
      .replace(/`(.*?)`/g, '<mark class="bg-yellow-100 px-1 rounded">$1</mark>') // `highlight`
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-indigo-200 pl-4 italic text-gray-600 my-3">$1</blockquote>') // > quote
      .replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>') // - bullet
      .replace(/\n/g, '<br/>');
  };

  // ✅ Tab configuration
  const tabs = [
    { id: "content", label: "Content", icon: <MdArticle /> },
    { id: "seo", label: "SEO", icon: <MdSearch /> },
    { id: "settings", label: "Settings", icon: <MdSettings /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Blog Manager" />
        <main className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Blog Posts</h1>
              <p className="text-sm text-gray-500">Create, edit, and manage your content</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                         text-white text-sm px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow">
              <MdAdd className="text-lg" /> New Post
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
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-2 text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition">
                      {p.title}
                    </h3>
                  </div>
                  <MdArticle className="text-3xl text-gray-100 flex-shrink-0 group-hover:text-indigo-100 transition" />
                </div>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{p.content}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                  <p className="text-xs text-gray-400">{p.date} · {p.author}</p>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 
                                 rounded-lg transition" title="Edit">
                      <MdEdit className="text-sm" />
                    </button>
                    <button onClick={() => remove(p.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                                 rounded-lg transition" title="Delete">
                      <MdDelete className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Enhanced Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl
                              max-h-[95vh] flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {editId ? "✏️ Edit Post" : "✨ Create New Post"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {editId ? "Update your content" : "Fill in the details below"}
                    </p>
                  </div>
                  <button onClick={() => setShowForm(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                    <MdClose className="text-xl" />
                  </button>
                </div>

                {/* ✅ Tab Navigation */}
                <div className="flex border-b border-gray-100 px-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition
                        ${activeTab === tab.id 
                          ? "border-indigo-600 text-indigo-600" 
                          : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ✅ Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  
                  {/* CONTENT TAB */}
                  {activeTab === "content" && (
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          Post Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="Enter a compelling title..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                        />
                      </div>

                      {/* Category & Author Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
                          <input
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="e.g. Tutorial, News"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Author</label>
                          <input
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            placeholder="Author name"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>

                      {/* ✅ Rich Text Toolbar */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                          Content <span className="text-red-400">*</span>
                        </label>
                        
                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                          {[
                            { icon: <MdFormatBold />, action: () => insertFormatting('**'), title: "Bold (Ctrl+B)" },
                            { icon: <MdFormatItalic />, action: () => insertFormatting('*'), title: "Italic (Ctrl+I)" },
                            { icon: <MdHighlight />, action: () => insertFormatting('`'), title: "Highlight" },
                            { icon: <MdFormatQuote />, action: () => insertFormatting('> '), title: "Quote" },
                            { icon: <MdFormatListBulleted />, action: () => insertFormatting('- '), title: "Bullet List" },
                            { icon: <MdFormatListNumbered />, action: () => insertFormatting('1. '), title: "Numbered List" },
                          ].map((btn, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={btn.action}
                              title={btn.title}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white 
                                         rounded-lg transition border border-transparent hover:border-gray-200"
                            >
                              {btn.icon}
                            </button>
                          ))}
                          <span className="text-xs text-gray-400 ml-2 self-center">
                            Tip: Use **bold**, *italic*, `highlight`, > quote
                          </span>
                        </div>
                        
                        {/* Editor */}
                        <textarea
                          ref={contentRef}
                          value={form.content}
                          onChange={(e) => setForm({ ...form, content: e.target.value })}
                          rows={10}
                          placeholder="Write your story here... Use **bold**, *italic*, or > for quotes"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono leading-relaxed"
                        />
                        <p className="text-xs text-gray-400 mt-1.5 text-right">
                          {form.content.length} characters
                        </p>
                      </div>

                      {/* Image Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                            <MdImage className="text-gray-400" /> Cover Image URL
                          </label>
                          <input
                            value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                            Alt Text (for accessibility & SEO)
                          </label>
                          <input
                            value={form.imageAlt}
                            onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                            placeholder="Describe the image..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      {form.image && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-2">Preview:</p>
                          <img 
                            src={form.image} 
                            alt={form.imageAlt || "Preview"} 
                            className="w-full h-32 object-cover rounded-xl border border-gray-100"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* SEO TAB */}
                  {activeTab === "seo" && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs text-indigo-700 flex items-start gap-2">
                          <MdSearch className="text-lg flex-shrink-0 mt-0.5" />
                          <span>Optimize your post for search engines. These fields control how your post appears in Google results.</span>
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                          Meta Title <span className="text-gray-400 font-normal">(recommended: 50-60 chars)</span>
                        </label>
                        <input
                          value={form.metaTitle}
                          onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                          placeholder={form.title || "Default: Post title"}
                          maxLength={70}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">Appears as clickable link in search</span>
                          <span className={`text-xs ${form.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                            {form.metaTitle.length}/70
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                          Meta Description <span className="text-gray-400 font-normal">(recommended: 150-160 chars)</span>
                        </label>
                        <textarea
                          value={form.metaDescription}
                          onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                          placeholder="A compelling summary that encourages clicks..."
                          rows={3}
                          maxLength={160}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                     focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">Shown below title in search results</span>
                          <span className={`text-xs ${form.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                            {form.metaDescription.length}/160
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                          URL Slug <span className="text-gray-400 font-normal">(auto-generated if empty)</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500">
                            yoursite.com/blog/
                          </span>
                          <input
                            value={form.slug}
                            onChange={(e) => setForm({ 
                              ...form, 
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') 
                            })}
                            placeholder="auto-generated-from-title"
                            className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          Use lowercase letters, numbers, and hyphens only
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SETTINGS TAB */}
                  {activeTab === "settings" && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs text-amber-700">
                          <strong>Pro Tip:</strong> Set a consistent author name and category to help readers discover more of your content.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Status</label>
                          <select 
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                            defaultValue="published"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Visibility</label>
                          <select 
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                            defaultValue="public"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="password">Password Protected</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                          Featured Post
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                          <span className="text-sm text-gray-600">Show this post prominently on the homepage</span>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" 
                            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 
                                       hover:bg-gray-200 rounded-lg transition">
                            Duplicate Post
                          </button>
                          <button type="button" 
                            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 
                                       hover:bg-gray-200 rounded-lg transition">
                            Export as Markdown
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 
                               hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={save}
                    disabled={!form.title || !form.content}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 
                               hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                               rounded-xl transition shadow-sm hover:shadow flex items-center gap-2"
                  >
                    {editId ? "💾 Save Changes" : "🚀 Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Enhanced Preview Modal */}
          {preview && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 
                                     px-3 py-1 rounded-full">{preview.category}</span>
                    <span className="text-xs text-gray-400">{preview.date}</span>
                  </div>
                  <button onClick={() => setPreview(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                    <MdClose className="text-xl" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  {preview.image && (
                    <img 
                      src={preview.image} 
                      alt={preview.imageAlt || preview.title}
                      className="w-full h-56 object-cover rounded-xl mb-6 border border-gray-100" 
                    />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{preview.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                    <span>By {preview.author}</span>
                    <span>•</span>
                    <span>{preview.date}</span>
                  </div>
                  <div 
                    className="prose prose-indigo max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatContent(preview.content) }}
                  />
                  
                  {/* SEO Preview Snippet */}
                  <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-3">🔍 Search Preview</p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-indigo-700 hover:underline cursor-pointer">
                        {preview.metaTitle || preview.title}
                      </p>
                      <p className="text-xs text-green-700 my-1">
                        yoursite.com/blog/{preview.slug || preview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {preview.metaDescription || preview.content.substring(0, 155)}...
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button 
                    onClick={() => { openEdit(preview); setPreview(null); }}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 
                               hover:bg-indigo-50 rounded-xl transition"
                  >
                    <MdEdit className="text-lg" /> Edit This Post
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
