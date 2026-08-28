import { useEffect, useState, useMemo } from "react";
import { MdHelpOutline, MdSearch, MdExpandMore, MdExpandLess, MdCheckCircle } from "react-icons/md";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import DOMPurify from "dompurify";

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    API.get("/faqs")
      .then((res) => {
        setFaqs(res.data || []);
        if (res.data && res.data.length > 0) {
          setOpenId(res.data[0].id);
        }
      })
      .catch(() => {
        API.get("/faq")
          .then((res) => {
            setFaqs(res.data || []);
            if (res.data && res.data.length > 0) {
              setOpenId(res.data[0].id);
            }
          })
          .catch((err) => console.error("Failed to load FAQs:", err));
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesSearch =
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqs, search, selectedCategory]);

  // Group FAQs by Category when 'All' is selected
  const groupedFaqs = useMemo(() => {
    const map = {};
    filteredFaqs.forEach((f) => {
      const cat = f.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(f);
    });
    return map;
  }, [filteredFaqs]);

  // Inject FAQPage JSON-LD Schema (Update 4)
  const faqSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer.replace(/<[^>]+>/g, "").trim(),
        },
      })),
    };
  }, [faqs]);

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen flex flex-col">
      <SEO
        title="Frequently Asked Questions (FAQ) | Olive Seeds Studio"
        description="Find answers to common questions regarding custom printed t-shirts, mugs, canvas prints, international shipping, and digital downloads."
        keywords="FAQ, questions, shipping help, custom product ordering, digital asset downloads"
      />
      <Navbar />

      {/* JSON-LD Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header Title */}
        <div className="text-center mb-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-[#0D1512]/5 text-[#0D1512] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#0D1512]/10 uppercase tracking-widest">
            <MdHelpOutline className="text-base text-amber-700" /> Help Center & Knowledgebase
          </span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl md:text-4xl font-black tracking-tight text-[#0D1512]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs md:text-sm text-[#0D1512]/60 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our custom products, production process, international delivery, and instant digital downloads.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-4 md:p-6 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Type your question or keyword (e.g., shipping, returns, SVG format)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#0D1512]/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/30 text-[#0D1512]"
            />
          </div>

          {/* Categories Horizontal Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#0D1512] text-[#FAF9F6] shadow-md"
                    : "bg-[#FAF9F6] text-[#0D1512]/70 hover:bg-stone-200 border border-[#0D1512]/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#0D1512]/50">Loading frequently asked questions...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-12 text-center text-xs text-[#0D1512]/60">
            No matching questions found for "{search}".
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedFaqs).map((catName) => (
              <div key={catName} className="space-y-3">
                {selectedCategory === "All" && (
                  <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-amber-800 uppercase tracking-widest pt-2">
                    {catName}
                  </h3>
                )}

                <div className="space-y-3">
                  {groupedFaqs[catName].map((f) => {
                    const isOpen = openId === f.id;
                    return (
                      <div
                        key={f.id}
                        className={`bg-white border rounded-2xl transition duration-200 overflow-hidden shadow-sm ${
                          isOpen ? "border-[#0D1512]/30 ring-1 ring-[#0D1512]/10" : "border-[#0D1512]/10 hover:border-[#0D1512]/20"
                        }`}
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : f.id)}
                          className="w-full px-6 py-4.5 flex items-center justify-between text-left gap-4 font-bold text-xs md:text-sm text-[#0D1512]"
                        >
                          <span className="leading-snug">{f.question}</span>
                          <span className="p-1 rounded-lg bg-[#FAF9F6] border border-[#0D1512]/10 text-stone-600 shrink-0">
                            {isOpen ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div
                            className="px-6 pb-5 pt-1 text-xs md:text-sm text-[#0D1512]/80 leading-relaxed border-t border-stone-100 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(f.answer) }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
