import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MdArrowBack, 
  MdOutlineTimer, 
  MdWhatshot, 
  MdContentCopy, 
  MdCheck 
} from "react-icons/md";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

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
            author: p.author || "Olive Seeds Studio",
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

  // Track scroll depth for the reading progress indicator
  useEffect(() => {
    if (!viewingPost) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewingPost]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const calculateReadTime = (content) => {
    if (!content) return "2 min read";
    const text = stripHtml(content);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 190));
    return `${minutes} min read`;
  };

  const copyLink = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      }).catch(() => {});
    }
  };

  const shareWhatsApp = (postTitle, url) => {
    const text = encodeURIComponent(`"${postTitle}" by Olive Seeds Design Studio:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const formatContent = (text) => {
    if (!text) return "";
    // If it already has rich HTML markup from the editor
    if (text.includes("<p>") || text.includes("<div>") || text.includes("<h") || text.includes("<br")) {
      return text;
    }
    // If plain text with markdown or simple line breaks
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<mark class="bg-[#FAF6EE] text-[#23483D] px-1.5 py-0.5 rounded font-mono text-sm border border-[#EAE4D6]">$1</mark>')
      .replace(/^> (.*?)$/gm, '<blockquote><p>$1</p></blockquote>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

    const paragraphs = formatted.split(/\n\s*\n/).filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join("");
    }
    return formatted.replace(/\n/g, '<br/>');
  };

  const domain = (process.env.PUBLIC_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");

  const getRelatedPosts = (currentPost, limit = 3) => {
    return posts
      .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
      .slice(0, limit);
  };

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  // ══════════════════════════════════════════
  // LUXURY EDITORIAL READER VIEW
  // ══════════════════════════════════════════
  if (viewingPost) {
    const related = getRelatedPosts(viewingPost, 3);
    const fallbackPosts = related.length < 3 
      ? [...related, ...posts.filter(p => p.id !== viewingPost.id && !related.some(r => r.id === p.id)).slice(0, 3 - related.length)]
      : related;
    const fullBlogUrl = `${domain}/blog/${viewingPost.slug || viewingPost.id}`;
    const metaTitle = viewingPost.meta_title || viewingPost.title;
    const metaDescription = viewingPost.meta_description || stripHtml(viewingPost.content).slice(0, 155);
    const ogTitle = viewingPost.og_title || metaTitle;
    const ogDescription = viewingPost.og_description || metaDescription;
    const ogImage = viewingPost.og_image || viewingPost.image_url || viewingPost.image;
    const readTime = calculateReadTime(viewingPost.content);

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
      <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen overflow-x-hidden flex flex-col">
        {/* Subtle Reading Progress Indicator Bar */}
        <div 
          className="fixed top-0 left-0 h-[2.5px] bg-[#A48855] z-[70] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />

        <SEO
          title={`${metaTitle} | Olive Seeds Journal`}
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

        {/* ── Sub-Navigation & Reading Actions Bar ── */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE4D6] transition-all">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
            <button
              onClick={closeReader}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#676A65] hover:text-[#23483D] font-medium transition-colors cursor-pointer group"
            >
              <MdArrowBack className="text-base group-hover:-translate-x-1 transition-transform" />
              <span>Back to Journal</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#8A8D88] font-medium">
                <MdOutlineTimer className="text-sm text-[#A48855]" />
                {readTime}
              </span>

              <button
                onClick={() => shareWhatsApp(viewingPost.title, fullBlogUrl)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#EAE4D6] bg-[#FAF6EE] text-[#23483D] text-xs font-medium hover:border-[#23483D] transition cursor-pointer"
                title="Share on WhatsApp"
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => copyLink(fullBlogUrl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] text-[#181A18] text-xs font-medium bg-white hover:bg-[#FAF6EE] transition cursor-pointer"
                title="Copy link to clipboard"
              >
                {copiedLink ? (
                  <>
                    <MdCheck className="text-sm text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <MdContentCopy className="text-sm text-[#A48855]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Editorial Article Canvas ── */}
        <main className="flex-1 w-full pb-12">
          {/* Article Header (Hero) */}
          <header className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6 sm:pb-8">
            {/* Category, Views & Read Time */}
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <span className="text-[10.5px] font-semibold px-3 py-1 rounded-[3px] uppercase tracking-[0.14em] bg-[#FAF6EE] text-[#23483D] border border-[#EAE4D6]">
                {viewingPost.category}
              </span>
              <span className="text-xs text-[#8A8D88] flex items-center gap-1">
                <MdOutlineTimer className="text-sm text-[#A48855]" /> {readTime}
              </span>
              <span className="text-xs text-[#8A8D88]">•</span>
              <span className="text-xs text-[#8A8D88] flex items-center gap-1">
                <MdWhatshot className="text-[#A48855] text-sm" /> {viewingPost.views || 0} reads
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-normal tracking-tight text-[#181A18] leading-[1.16] sm:leading-[1.14] mb-7"
            >
              {viewingPost.title}
            </h1>

            {/* Author & Meta Row */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-[#EAE4D6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF6EE] border border-[#EAE4D6] flex items-center justify-center text-[#23483D] font-serif font-bold text-base shadow-xs">
                  {viewingPost.author ? viewingPost.author.charAt(0).toUpperCase() : "O"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#181A18]">
                    {viewingPost.author || "Olive Seeds Studio"}
                  </p>
                  <p className="text-[11px] text-[#8A8D88] mt-0.5">
                    Published on {viewingPost.created_at || viewingPost.date}
                  </p>
                </div>
              </div>

              {/* Mobile Quick Share Actions */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => shareWhatsApp(viewingPost.title, fullBlogUrl)}
                  className="px-2.5 py-1 text-[11px] rounded-[3px] border border-[#EAE4D6] bg-[#FAF6EE] text-[#23483D] font-medium"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => copyLink(fullBlogUrl)}
                  className="px-2.5 py-1 text-[11px] rounded-[3px] border border-[#EAE4D6] bg-white text-[#181A18] font-medium"
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </header>

          {/* Featured Hero Image (if available) */}
          {(viewingPost.image_url || viewingPost.image) && (
            <div className="max-w-4xl mx-auto px-5 sm:px-8 mb-10 sm:mb-14">
              <figure className="rounded-[6px] overflow-hidden border border-[#EAE4D6] bg-[#FAF6EE] shadow-xs">
                <img
                  src={viewingPost.image_url || viewingPost.image}
                  alt={viewingPost.imageAlt || viewingPost.title}
                  className="w-full max-h-[520px] object-cover"
                />
                {viewingPost.imageAlt && (
                  <figcaption className="text-xs text-[#8A8D88] py-3 text-center italic bg-white border-t border-[#EAE4D6]">
                    {viewingPost.imageAlt}
                  </figcaption>
                )}
              </figure>
            </div>
          )}

          {/* ── Dedicated Editorial Reading Body ── */}
          <article className="max-w-3xl mx-auto px-5 sm:px-8 md:px-10">
            <div
              className="editorial-article-body"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatContent(viewingPost.content)) }}
            />
          </article>

          {/* ── Studio Colophon / End of Article ── */}
          <section className="max-w-3xl mx-auto px-5 sm:px-8 mt-14 sm:mt-20 mb-12">
            <div className="bg-[#FAF6EE] border border-[#EAE4D6] rounded-[6px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[#A48855] font-semibold mb-1">
                  <span>Olive Seeds Studio</span>
                  <span>•</span>
                  <span>Colophon</span>
                </div>
                <h3
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  className="text-xl sm:text-2xl font-normal text-[#181A18] mb-2"
                >
                  Craft, Architecture &amp; Quiet Luxury
                </h3>
                <p className="text-xs sm:text-sm text-[#676A65] leading-relaxed max-w-xl">
                  Thank you for reading the Studio Journal. We craft physical timber monuments, architectural signage, bespoke trophies, and corporate identity pieces.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => shareWhatsApp(viewingPost.title, fullBlogUrl)}
                  className="px-4 py-2.5 rounded-[4px] bg-[#23483D] text-white text-xs font-semibold hover:bg-[#16352D] transition text-center cursor-pointer"
                >
                  Share Story
                </button>
                <button
                  onClick={closeReader}
                  className="px-4 py-2.5 rounded-[4px] border border-[#EAE4D6] bg-white text-[#181A18] text-xs font-semibold hover:bg-[#FAF6EE] transition text-center cursor-pointer"
                >
                  All Articles
                </button>
              </div>
            </div>
          </section>

          {/* Clean Ad Placement */}
          <div className="max-w-4xl mx-auto px-5 sm:px-8 my-10">
            <AdBanner placement="Horizontal Banner" />
          </div>

          {/* ── Perspectives & Further Reading Grid ── */}
          {fallbackPosts.length > 0 && (
            <section className="border-t border-[#EAE4D6] bg-[#FAF6EE]/45 py-14 sm:py-20 mt-12">
              <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <div className="flex items-end justify-between mb-8 sm:mb-10">
                  <div>
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#A48855] block mb-2">
                      Studio Perspectives
                    </span>
                    <h2
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#181A18] tracking-tight"
                    >
                      More Stories from the Journal
                    </h2>
                  </div>
                  <button
                    onClick={closeReader}
                    className="hidden sm:inline-flex items-center gap-1 text-xs text-[#23483D] hover:text-[#A48855] font-semibold transition cursor-pointer"
                  >
                    View All Journal Pieces →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                  {fallbackPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => openReader(post)}
                      className="group flex flex-col bg-white border border-[#EAE4D6] rounded-[4px] overflow-hidden hover:border-[#D5CAA8] hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <div className="h-44 sm:h-48 overflow-hidden relative bg-[#FAF6EE]">
                        <img
                          src={post.image_url || post.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider bg-white/95 text-[#23483D] border border-[#EAE4D6] shadow-xs">
                          {post.category}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-[#8A8D88] mb-2">
                            <span>By {post.author}</span>
                            <span>•</span>
                            <span>{calculateReadTime(post.content)}</span>
                          </div>
                          <h3
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                            className="text-xl font-normal text-[#181A18] group-hover:text-[#23483D] transition-colors line-clamp-2 leading-snug mb-2"
                          >
                            {post.title}
                          </h3>
                          <p className="text-xs text-[#676A65] line-clamp-2 leading-relaxed font-normal">
                            {stripHtml(post.content).substring(0, 120)}...
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-[#EAE4D6] flex items-center justify-between text-xs text-[#23483D] font-medium">
                          <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                            Read Story →
                          </span>
                          <span className="text-[11px] text-[#8A8D88] font-normal">{post.views || 0} views</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

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
        style={{ background: "#FFFFFF", borderBottom: "1px solid #EAE4D6" }}
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
      <section className="border-b border-[#EAE4D6] bg-[#FAF9F6]/60 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-[4px] text-[11px] font-medium uppercase tracking-[0.1em] transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#23483D] text-white border border-[#23483D] shadow-xs"
                    : "bg-white text-[#676A65] border border-[#EAE4D6] hover:border-[#CACCC6] hover:text-[#181A18]"
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
          <div className="bg-white border border-[#EAE4D6] rounded-[4px] p-12 text-center my-8">
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
                  className="group flex flex-col bg-white border border-[#EAE4D6] rounded-[4px] overflow-hidden hover:border-[#CACCC6] hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
                >
                  {/* Proportional Image Frame */}
                  <div className="h-44 sm:h-48 overflow-hidden relative bg-[#FAF6EE]">
                    <img
                      src={post.image_url || post.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider bg-white/95 text-[#23483D] border border-[#EAE4D6] shadow-xs">
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

                    <div className="mt-5 pt-3 border-t border-[#EAE4D6] flex items-center justify-between text-xs text-[#23483D] font-medium">
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
