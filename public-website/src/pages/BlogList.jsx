import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArticle, MdArrowBack, MdOutlineTimer, MdWhatshot } from "react-icons/md";
import DOMPurify from "dompurify";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

export default function BlogList() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [viewingPost, setViewingPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    API.get("/blogs")
      .then((r) => {
        if (r.data) {
          const formattedPosts = r.data.map(p => ({
            ...p,
            id: p.id,
            slug: p.slug || String(p.id),
            title: p.title || "",
            content: p.content || "",
            image_url: p.image_url || p.image || "",
            category: p.category || "General",
            author: p.author || "Admin",
            created_at: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            views: p.views || 0
          }));
          setPosts(formattedPosts);

          const targetParam = slug || id;
          if (targetParam) {
            const matched = formattedPosts.find(p => String(p.slug) === String(targetParam) || String(p.id) === String(targetParam));
            if (matched) {
              setViewingPost(matched);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dynamic blogs:", err);
        setPosts([]);
      });
  }, [id, slug]);

  const openReader = (post) => {
    setViewingPost(post);
    navigate(`/blog/${post.slug || post.id}`, { replace: false });
    API.put(`/blogs/${post.id}/view`).catch(() => { });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeReader = () => {
    setViewingPost(null);
    navigate("/blog", { replace: false });
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const formatContent = (text) => {
    if (!text) return "";
    if (text.includes("<p>") || text.includes("<div>") || text.includes("<h") || text.includes("<br")) {
      return text;
    }
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<mark class="bg-[#F8F8F6] text-[#23483D] px-1.5 py-0.5 rounded font-mono text-sm border border-[#E7E7E2]">$1</mark>')
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-2 border-[#23483D] pl-4 italic text-[#676A65] my-4 font-serif text-lg">$1</blockquote>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-[#676A65] my-1">$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal text-[#676A65] my-1">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const domain = (process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

  const getRelatedPosts = (currentPost, limit = 2) => {
    return posts
      .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
      .slice(0, limit);
  };

  const getMostReadPosts = (currentPost, limit = 3) => {
    return posts
      .filter(p => p.id !== currentPost.id)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  };

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  // ══════════════════════════════════════════
  // READER VIEW
  // ══════════════════════════════════════════
  if (viewingPost) {
    const related = getRelatedPosts(viewingPost);
    const mostRead = getMostReadPosts(viewingPost);
    const fullBlogUrl = `${domain}/blog/${viewingPost.slug || viewingPost.id}`;
    const metaTitle = viewingPost.meta_title || viewingPost.title;
    const metaDescription = viewingPost.meta_description || viewingPost.content.replace(/<[^>]+>/g, '').slice(0, 155);
    const ogTitle = viewingPost.og_title || metaTitle;
    const ogDescription = viewingPost.og_description || metaDescription;
    const ogImage = viewingPost.og_image || viewingPost.image_url || viewingPost.image;

    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": viewingPost.title,
      "description": metaDescription,
      "image": ogImage || `${domain}/logo192.png`,
      "author": {
        "@type": "Organization",
        "name": "Olive Seeds Studio",
        "url": domain
      },
      "publisher": {
        "@type": "Organization",
        "name": "Olive Seeds Studio",
        "logo": {
          "@type": "ImageObject",
          "url": `${domain}/logo192.png`
        }
      },
      "datePublished": viewingPost.created_at || viewingPost.date,
      "dateModified": viewingPost.updated_at || viewingPost.created_at || viewingPost.date,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": fullBlogUrl
      },
      "keywords": viewingPost.tags || viewingPost.category || "blog"
    };

    return (
      <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen overflow-x-hidden">
        <SEO
          title={metaTitle}
          description={metaDescription}
          keywords={viewingPost.tags || viewingPost.category || "blog"}
        />
        {viewingPost.canonical_url && <link rel="canonical" href={viewingPost.canonical_url} />}
        {viewingPost.no_index && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={fullBlogUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        />
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <button
            onClick={closeReader}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#676A65] hover:text-[#23483D] font-medium transition-all duration-200 mb-8 cursor-pointer"
          >
            <MdArrowBack className="text-base" /> Back to Journal
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Main Article Content */}
            <article
              className="lg:col-span-8 bg-white border border-[#E7E7E2] rounded-[4px] p-6 sm:p-10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span
                  style={{ background: "#F8F8F6", color: "#23483D", border: "1px solid #E7E7E2" }}
                  className="text-[10px] font-bold px-3 py-1 rounded-[2px] uppercase tracking-widest"
                >
                  {viewingPost.category}
                </span>
                <span className="text-xs text-[#8A8D88] flex items-center gap-1">
                  <MdWhatshot className="text-[#A48855] text-sm" /> {viewingPost.views || 0} views
                </span>
              </div>

              <h1
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#181A18] leading-[1.2] mb-6"
              >
                {viewingPost.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#8A8D88] mb-8 pb-5 border-b border-[#E7E7E2]">
                <span>By <strong className="text-[#181A18] font-medium">{viewingPost.author}</strong></span>
                <span>•</span>
                <span>{viewingPost.created_at || viewingPost.date}</span>
              </div>

              {(viewingPost.image_url || viewingPost.image) && (
                <figure className="mb-8 rounded-[4px] overflow-hidden border border-[#E7E7E2]">
                  <img
                    src={viewingPost.image_url || viewingPost.image}
                    alt={viewingPost.imageAlt || viewingPost.title}
                    className="w-full max-h-[420px] object-cover"
                  />
                  {viewingPost.imageAlt && (
                    <figcaption className="text-xs text-[#8A8D88] mt-2.5 text-center italic">
                      {viewingPost.imageAlt}
                    </figcaption>
                  )}
                </figure>
              )}

              <div
                className="prose max-w-none text-[#181A18] leading-relaxed text-sm sm:text-base"
                style={{ wordBreak: 'break-word', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatContent(viewingPost.content)) }}
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <AdBanner placement="Vertical Tower" />

              {related.length > 0 && (
                <div className="bg-white border border-[#E7E7E2] rounded-[4px] p-5 shadow-sm">
                  <h3
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    className="text-lg font-medium border-b border-[#E7E7E2] pb-3 mb-4 flex items-center gap-2 text-[#181A18]"
                  >
                    <MdArticle className="text-base text-[#23483D]" /> More in {viewingPost.category}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {related.map(post => (
                      <button
                        key={post.id}
                        onClick={() => openReader(post)}
                        className="w-full text-left p-3.5 rounded-[4px] border border-[#E7E7E2] hover:border-[#23483D] hover:bg-[#F8F8F6] transition-all duration-200 group cursor-pointer"
                      >
                        <h4
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                          className="font-normal text-base text-[#181A18] group-hover:text-[#23483D] transition-colors line-clamp-2 leading-snug"
                        >
                          {post.title}
                        </h4>
                        <p className="text-[10.5px] text-[#8A8D88] mt-2 flex justify-between">
                          <span>{post.created_at || post.date}</span>
                          <span>{post.views || 0} views</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mostRead.length > 0 && (
                <div className="bg-white border border-[#E7E7E2] rounded-[4px] p-5 shadow-sm">
                  <h3
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    className="text-lg font-medium border-b border-[#E7E7E2] pb-3 mb-4 flex items-center gap-2 text-[#181A18]"
                  >
                    <MdWhatshot className="text-base text-[#A48855]" /> Popular Perspectives
                  </h3>
                  <div className="flex flex-col gap-3">
                    {mostRead.map((post, idx) => (
                      <button
                        key={post.id}
                        onClick={() => openReader(post)}
                        className="w-full text-left p-3 hover:bg-[#F8F8F6] rounded-[4px] border border-transparent hover:border-[#E7E7E2] transition flex items-start gap-3 group cursor-pointer"
                      >
                        <span className="text-[11px] font-medium text-[#23483D] bg-[#F8F8F6] border border-[#E7E7E2] w-6 h-6 rounded-[2px] flex items-center justify-center flex-shrink-0">
                          0{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            className="font-normal text-sm sm:text-base text-[#181A18] group-hover:text-[#23483D] transition-colors line-clamp-2 leading-snug"
                          >
                            {post.title}
                          </h4>
                          <p className="text-[10px] text-[#8A8D88] mt-1">{post.category} • {post.views || 0} views</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // ══════════════════════════════════════════
  // PROFESSIONAL EDITORIAL LIST VIEW
  // ══════════════════════════════════════════
  return (
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex flex-col overflow-x-hidden">
      <SEO
        title="Studio Journal | Olive Seeds Design Studio"
        description="Read about precision craft techniques, sustainable timber design, creative branding, and luxury design philosophies on the Olive Seeds Journal."
        keywords="design journal, bespoke objects, corporate design, creative branding, sustainable timber, Olive Seeds"
      />
      <Navbar />

      {/* Hero Header */}
      <section
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E7E7E2" }}
        className="relative py-12 sm:py-16 md:py-20 text-center"
      >
        <div className="max-w-4xl mx-auto px-6">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#A48855",
              marginBottom: 14,
            }}
          >
            Studio Journal &amp; Perspectives
          </span>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-3xl sm:text-4xl md:text-6xl font-normal tracking-tight text-[#181A18] leading-[1.15]"
          >
            Ideas, Craft &amp; Materiality
          </h1>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-[#676A65] max-w-xl mx-auto leading-relaxed">
            Thoughtful perspectives on bespoke physical objects, sustainable timber craftsmanship, corporate identity systems, and luxury design philosophies.
          </p>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <section className="border-b border-[#E7E7E2] bg-[#FAF9F6]/60 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-[4px] text-[11px] font-medium uppercase tracking-[0.1em] transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#23483D] text-white border border-[#23483D] shadow-xs"
                    : "bg-white text-[#676A65] border border-[#E7E7E2] hover:border-[#CACCC6] hover:text-[#181A18]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#8A8D88] shrink-0 hidden md:inline">
            {filteredPosts.length} {filteredPosts.length === 1 ? "Article" : "Articles"}
          </span>
        </div>
      </section>

      {/* Articles Main Grid */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-[#E7E7E2] rounded-[4px] p-12 text-center my-8">
            <h3
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-normal text-[#181A18] mb-2"
            >
              No articles found in {selectedCategory}
            </h3>
            <p className="text-xs text-[#676A65] mb-6">Explore another category or view all studio articles.</p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="btn-primary text-xs"
            >
              Show All Articles
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Ad Banner if present */}
            <div>
              <AdBanner placement="Horizontal Banner" />
            </div>

            {/* Articles Grid - Moderate Panel Sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => openReader(post)}
                  className="group flex flex-col bg-white border border-[#E7E7E2] rounded-[4px] overflow-hidden hover:border-[#CACCC6] hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
                >
                  {/* Proportional Image Frame */}
                  <div className="h-44 sm:h-48 overflow-hidden relative bg-[#F8F8F6]">
                    <img
                      src={post.image_url || post.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider bg-white/95 text-[#23483D] border border-[#E7E7E2] shadow-xs">
                      {post.category}
                    </div>
                  </div>

                  {/* Editorial Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-[#8A8D88] mb-2">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MdOutlineTimer /> {post.created_at || post.date}
                        </span>
                      </div>
                      <h2
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        className="text-xl sm:text-2xl font-normal text-[#181A18] group-hover:text-[#23483D] transition-colors line-clamp-2 leading-snug mb-2.5"
                      >
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#676A65] line-clamp-2 leading-relaxed font-normal">
                        {stripHtml(post.content).substring(0, 130)}...
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-[#23483D] font-medium">
                      <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read Story →
                      </span>
                      <span className="text-[11px] text-[#8A8D88] font-normal">{post.views || 0} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
