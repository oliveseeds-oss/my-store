import { useEffect, useState } from "react";
import { MdArticle, MdArrowBack, MdOutlineTimer, MdWhatshot } from "react-icons/md";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

const MOCK_POSTS = [
  {
    id: 1,
    title: "How We Engrave Your Design with Precision",
    content: "At our studio, every engraving is done with laser precision. In this article, we dive deep into the science of fiber and CO2 lasers, how focal lengths affect engraving depth, and the meticulous process of calibrating speed and power for different materials like premium teakwood, slate, and crystal-clear acrylics. We believe that true luxury lies in the millimetres.",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    category: "Behind the Scenes",
    author: "Arjun Krishnamurthy",
    created_at: "2026-05-20",
    views: 1245
  },
  {
    id: 2,
    title: "Top 5 Gift Ideas for Corporate Clients & Executives",
    content: "Looking for memorable, premium gifts for your high-value clients? Standard corporate merchandising often ends up in a drawer. Discover our top picks for highly personalized, hand-finished keepsakes—ranging from custom engraved desk organizers to modern executive walnut boxes—that leave a lasting impression of thoughtfulness and luxury.",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop",
    category: "Gift Ideas",
    author: "Ravi Subramaniam",
    created_at: "2026-05-15",
    views: 894
  },
  {
    id: 3,
    title: "Sustainable Materials We Love and Design With",
    content: "Sustainability is at the core of Olive Seeds. We source our natural wood, organic bamboo, and recycled acrylic from certified, responsible local suppliers. We believe that creating beautiful, permanent physical products shouldn't cost the earth. Read about our eco-friendly packaging and circular design philosophy.",
    image_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop",
    category: "Sustainability",
    author: "Priya Natarajan",
    created_at: "2026-05-10",
    views: 732
  },
  {
    id: 4,
    title: "Personalization and Craftsmanship Trends for 2026",
    content: "The world of custom gifts is evolving rapidly. From tactile, deep-relief 3D wood engraving to sleek, minimal frosted glass styles, personalization is shifting away from simple name prints towards high-end bespoke art. Explore the design aesthetics and production techniques shaping the custom-crafted landscape this year.",
    image_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    category: "Design Trends",
    author: "Priya Natarajan",
    created_at: "2026-05-05",
    views: 561
  }
];


export default function BlogList() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [viewingPost, setViewingPost] = useState(null);

  useEffect(() => {
    API.get("/blogs")
      .then((r) => {
        if (r.data && r.data.length > 0) {
          const formattedPosts = r.data.map(p => ({
            ...p,
            id: p.id,
            title: p.title,
            content: p.content,
            image_url: p.image_url || p.image,
            category: p.category || "General",
            author: p.author || "Admin",
            created_at: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            views: p.views || 0
          }));
          setPosts(formattedPosts);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch dynamic blogs, falling back to mock posts:", err);
      });
  }, []);

  const openReader = (post) => {
    setViewingPost(post);
    API.put(`/blogs/${post.id}/view`).catch(() => { });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatContent = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<mark class="bg-[#0D1512]/10 text-[#0D1512] px-1.5 py-0.5 rounded font-mono text-sm">$1</mark>')
      .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-[#0D1512] pl-4 italic text-stone-500 my-4">$1</blockquote>')
      .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-stone-700 my-1">$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal text-stone-700 my-1">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const getRelatedPosts = (currentPost, limit = 2) => {
    return posts
      .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
      .slice(0, limit);
  };

  const getMostRead = (currentId, limit = 2) => {
    return [...posts]
      .filter(p => p.id !== currentId)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  };

  // ✅ READER VIEW COMPONENT
  if (viewingPost) {
    const related = getRelatedPosts(viewingPost);
    const mostRead = getMostRead(viewingPost.id);

    return (
      <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen overflow-x-hidden">
        <SEO
          title={viewingPost.title}
          description={viewingPost.content.substring(0, 160)}
          keywords={`${viewingPost.category}, precision laser engraving, brand design, circular craftsmanship`}
        />
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 py-16">
          <button
            onClick={() => setViewingPost(null)}
            className="inline-flex items-center gap-2 text-sm text-[#0D1512]/70 hover:text-[#0D1512] font-bold transition-all duration-300 mb-8 hover:translate-x-[-4px]"
          >
            <MdArrowBack className="text-base" /> Back to Journal
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Main Article Content */}
            <article
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="lg:col-span-8 rounded-[2.5rem] border p-6 sm:p-10 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <span
                  style={{ background: "#0D1512", color: "#FAF9F6" }}
                  className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                >
                  {viewingPost.category}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <MdWhatshot className="text-orange-500 text-sm" /> {viewingPost.views || 0} views
                </span>
              </div>

              <h1
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6"
              >
                {viewingPost.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-stone-400 mb-8 pb-6 border-b border-stone-100">
                <span>By <strong className="text-[#0D1512] font-bold">{viewingPost.author}</strong></span>
                <span>•</span>
                <span>{viewingPost.created_at || viewingPost.date}</span>
              </div>

              {(viewingPost.image_url || viewingPost.image) && (
                <figure className="mb-10 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                  <img
                    src={viewingPost.image_url || viewingPost.image}
                    alt={viewingPost.imageAlt || viewingPost.title}
                    className="w-full max-h-[400px] object-cover"
                  />
                  {viewingPost.imageAlt && (
                    <figcaption className="text-xs text-stone-400 mt-3 text-center italic">
                      {viewingPost.imageAlt}
                    </figcaption>
                  )}
                </figure>
              )}

              <div
                className="prose prose-stone prose-lg max-w-none text-stone-700 leading-relaxed font-normal"
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: formatContent(viewingPost.content) }}
              />
            </article>

            {/* Sidebar Suggestions */}
            <aside className="lg:col-span-4 space-y-8">
              <AdBanner placement="Vertical Tower" />

              {related.length > 0 && (
                <div
                  style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
                  className="rounded-3xl border p-6 shadow-sm"
                >
                  <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-black border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                    <MdArticle className="text-xl text-[#0D1512]" /> More in {viewingPost.category}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {related.map(post => (
                      <button
                        key={post.id}
                        onClick={() => openReader(post)}
                        style={{ border: "1px solid rgba(27, 57, 49, 0.1)", background: "stone-50/20" }}
                        className="w-full text-left p-4 rounded-xl hover:border-[#0D1512] hover:bg-stone-50/40 transition-all duration-300 group"
                      >
                        <h4 className="font-bold text-stone-800 text-sm group-hover:text-[#0D1512] transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-2 flex justify-between">
                          <span>{post.created_at || post.date}</span>
                          <span>{post.views || 0} views</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mostRead.length > 0 && (
                <div
                  style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
                  className="rounded-3xl border p-6 shadow-sm"
                >
                  <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-black border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                    <MdWhatshot className="text-xl text-orange-500" /> Popular Articles
                  </h3>
                  <div className="flex flex-col gap-3.5">
                    {mostRead.map((post, idx) => (
                      <button
                        key={post.id}
                        onClick={() => openReader(post)}
                        className="w-full text-left p-3 hover:bg-stone-50/50 rounded-xl transition flex items-start gap-3 group"
                      >
                        <span className="text-xs font-black text-[#FAF9F6] bg-[#0D1512] w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 text-sm group-hover:text-[#0D1512] transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-[10px] text-stone-400 mt-1.5">{post.category} • {post.views || 0} views</p>
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

  // ✅ LIST VIEW COMPONENT
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen overflow-x-hidden">
      <SEO
        title="Studio Journal & Musings"
        description="Read about precision laser engraving sciences, sustainable teakwood designs, creative branding, and luxury design philosophies on Olive Seeds Journal."
        keywords="precision laser calibration, design journal, corporate gift ideas, circular branding, sustainable bamboo, Olive Seeds"
      />
      <Navbar />

      {/* Hero Header */}
      <section
        style={{
          background: "linear-gradient(135deg, #0D1512 0%, #0d1a16 100%)",
          color: "#FAF9F6"
        }}
        className="relative py-24 blog-hero overflow-hidden text-center shadow-xl"
      >
        {/* Luxury glowing mesh blurs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#FAF9F6]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-[75px] pointer-events-none" />

        <div className="absolute inset-0 bg-white/5 opacity-5 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 z-10 flex flex-col items-center">
          <span
            style={{ background: "rgba(255, 248, 222, 0.1)", borderColor: "rgba(255, 248, 222, 0.2)", color: "#FAF9F6" }}
            className="inline-flex px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest mb-6"
          >
            Studio Journal
          </span>
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white"
          >
            Ideas &amp; <span style={{ color: "#FAF9F6" }}>Insights</span>
          </h1>
          <p className="mt-6 text-sm md:text-lg leading-relaxed max-w-xl text-white/80">
            Discover thoughtful perspectives, products, creative ideas, design strategies and innovative approaches that shape meaningful experiences.
          </p>
        </div>
      </section>

      {/* Featured Post Card */}
      {featuredPost && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div
            style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
            className="rounded-[2.5rem] border overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group cursor-pointer"
            onClick={() => openReader(featuredPost)}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              <div className="md:col-span-7 h-64 md:h-[420px] overflow-hidden">
                <img
                  src={featuredPost.image_url || featuredPost.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="md:col-span-5 p-8 flex flex-col justify-center bg-stone-50/40">
                <span className="text-[10px] font-black text-[#0D1512] uppercase tracking-widest">{featuredPost.category}</span>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl md:text-3xl font-black mt-3 group-hover:text-[#0D1512] transition-colors leading-snug">{featuredPost.title}</h2>
                <p className="text-stone-500 mt-4 text-xs md:text-sm line-clamp-4 leading-relaxed font-normal">{featuredPost.content}</p>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200 text-xs text-stone-400">
                  <span>By {featuredPost.author}</span>
                  <span className="flex items-center gap-1"><MdOutlineTimer /> {featuredPost.created_at || featuredPost.date}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Remaining Posts */}
      {remainingPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="mb-14">
            <AdBanner placement="Horizontal Banner" />
          </div>

          <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black mb-8 border-b border-[#0D1512]/10 pb-4">All Articles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {remainingPosts.map((post) => (
              <div
                key={post.id}
                style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
                className="group flex flex-col border rounded-[2rem] overflow-hidden hover:-translate-y-1.5 shadow-sm hover:shadow-md transition-all duration-500 cursor-pointer"
                onClick={() => openReader(post)}
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={post.image_url || post.image || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div
                    style={{ background: "#0D1512", color: "#FAF9F6" }}
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                  >
                    {post.category}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold group-hover:text-[#0D1512] transition-colors leading-snug">{post.title}</h4>
                    <p className="text-stone-500 mt-3 text-xs md:text-sm line-clamp-3 leading-relaxed font-normal">{post.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-stone-100 text-xs text-stone-400">
                    <span>By {post.author}</span>
                    <span className="flex items-center gap-1"><MdOutlineTimer /> {post.created_at || post.date}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
