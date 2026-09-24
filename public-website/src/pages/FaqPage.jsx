import { useEffect, useState, useMemo } from "react";
import { MdHelpOutline, MdSearch, MdExpandMore, MdExpandLess } from "react-icons/md";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import DOMPurify from "dompurify";

const STUDIO_FAQS = [
  {
    id: 1,
    question: "Do you work with international clients?",
    answer: "Yes. We work with clients across the UK, Europe, Australia, the United States, and beyond. All digital products are available for immediate worldwide download. Physical products can be shipped internationally — please contact us to discuss shipping options for your location.",
    category: "International & Delivery",
    display_order: 1
  },
  {
    id: 2,
    question: "Can I place a bulk or corporate order?",
    answer: "Absolutely. B2B and volume orders are a significant part of what we do. Whether you require 50 branded pieces or 5,000 for a corporate event — we welcome the conversation. Please contact us directly for a tailored proposal.",
    category: "Corporate & B2B",
    display_order: 2
  },
  {
    id: 3,
    question: "How does your bespoke commission process work?",
    answer: "Every bespoke project begins with a brief. We listen, propose, refine, and produce. Most commissions follow three stages — consultation and brief, design development, and production and delivery. Timelines and pricing are agreed before any work begins.",
    category: "Bespoke Commissions",
    display_order: 3
  },
  {
    id: 4,
    question: "What is your minimum order quantity?",
    answer: "Minimums vary by product type. Some pieces are available as single commissions; others have production minimums for custom work. Contact us with your requirements and we will advise clearly and honestly.",
    category: "Ordering & Production",
    display_order: 4
  },
  {
    id: 5,
    question: "How long does production take?",
    answer: "Standard custom orders typically require 10 to 15 business days. Large-scale corporate orders are scheduled individually. Rush production is available on select products — please enquire at the time of ordering.",
    category: "Ordering & Production",
    display_order: 5
  },
  {
    id: 6,
    question: "Are digital products ready immediately?",
    answer: "Yes. All digital products are delivered as downloadable files immediately upon purchase — professionally structured and ready to use.",
    category: "Digital Products",
    display_order: 6
  },
  {
    id: 7,
    question: "Can I see samples before a large order?",
    answer: "For significant B2B or corporate commissions, sample production is available. Please discuss this at the enquiry stage and we will advise on our sampling process.",
    category: "Corporate & B2B",
    display_order: 7
  },
  {
    id: 8,
    question: "Do you offer design services alongside product orders?",
    answer: "Yes. If you do not have artwork ready, our design team can develop this as part of your commission — creating a seamless process from concept to delivery.",
    category: "Bespoke Commissions",
    display_order: 8
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState(STUDIO_FAQS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    document.title = "Frequently Asked Questions | Olive Seeds Design Studio";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Answers about our bespoke design products, B2B ordering, digital downloads, custom commissions, and delivery timelines."
    );

    API.get("/faqs")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setFaqs(res.data);
          setOpenId(res.data[0].id);
        }
      })
      .catch(() => {
        API.get("/faq")
          .then((res) => {
            if (res.data && res.data.length > 0) {
              setFaqs(res.data);
              setOpenId(res.data[0].id);
            }
          })
          .catch((err) => console.error("Failed to load FAQs:", err))
          .finally(() => setLoading(false));
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
        title="Frequently Asked Questions | Olive Seeds Design Studio"
        description="Answers about our bespoke design products, B2B ordering, digital downloads, custom commissions, and delivery timelines."
        keywords="FAQ, bespoke design questions, corporate orders, international shipping, digital downloads"
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
            <MdHelpOutline className="text-base text-amber-700" /> Studio Knowledgebase
          </span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl md:text-4xl font-black tracking-tight text-[#0D1512]">
            Questions & Answers
          </h1>
          <p className="text-xs md:text-sm text-[#0D1512]/60 max-w-xl mx-auto leading-relaxed">
            We believe in transparency. Here you will find honest answers to the questions we hear most often.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-4 md:p-6 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g., international, corporate, digital)..."
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
          <div className="text-center py-16 text-xs text-[#0D1512]/50">Loading questions...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-12 text-center text-xs text-[#0D1512]/60">
            No matching questions found for "{search}".
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedFaqs).map((catName) => (
              <div key={catName} className="space-y-3">
                {selectedCategory === "All" ? (
                  <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-amber-800 uppercase tracking-widest pt-2">
                    {catName}
                  </h2>
                ) : (
                  <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-amber-800 uppercase tracking-widest pt-2">
                    {selectedCategory} Questions
                  </h2>
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
                          <h3 className="leading-snug font-bold text-xs md:text-sm">{f.question}</h3>
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
