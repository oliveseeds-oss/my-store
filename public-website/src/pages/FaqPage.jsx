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
      "Answers about our bespoke design products, B2B ordering, digital downloads, and custom commissions."
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
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex flex-col">
      <SEO
        title="Frequently Asked Questions | Olive Seeds Design Studio"
        description="Answers about our bespoke design products, B2B ordering, digital downloads, and custom commissions."
        keywords="FAQ, bespoke design questions, corporate orders, international shipping, digital downloads"
      />
      <Navbar />

      {/* JSON-LD Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E7E7E2" }} className="py-14 sm:py-18 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-3">
          <span className="eyebrow">
            <MdHelpOutline className="text-base text-[#A48855]" /> Studio Knowledgebase
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#181A18]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#676A65] max-w-xl mx-auto leading-relaxed">
            Clear answers to the questions we hear most often. If your question is not covered here, our studio is always available to help.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-[4px] border border-[#E7E7E2] p-4 md:p-6 shadow-xs mb-8 space-y-4">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8D88] text-xl" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g., international, corporate, digital)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DADCD7] rounded-[4px] pl-11 pr-4 py-3 text-xs md:text-sm focus:outline-none focus:border-[#23483D] text-[#181A18] placeholder-[#8A8D88]"
            />
          </div>

          {/* Categories Horizontal Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-[4px] text-xs font-medium uppercase tracking-wider transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#23483D] text-[#FFFFFF] border border-[#23483D]"
                    : "bg-[#FFFFFF] text-[#676A65] hover:border-[#CACCC6] hover:text-[#181A18] border border-[#E7E7E2]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#8A8D88]">Loading questions...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-[4px] border border-[#E7E7E2] p-12 text-center text-xs sm:text-sm text-[#676A65]">
            No matching questions found for "{search}".
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedFaqs).map((catName) => (
              <div key={catName} className="space-y-3">
                {selectedCategory === "All" ? (
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-medium text-[#181A18] pt-2">
                    {catName}
                  </h2>
                ) : (
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-medium text-[#181A18] pt-2">
                    {selectedCategory}
                  </h2>
                )}

                <div className="space-y-3">
                  {groupedFaqs[catName].map((f) => {
                    const isOpen = openId === f.id;
                    return (
                      <div
                        key={f.id}
                        className={`bg-white border rounded-[4px] transition duration-200 overflow-hidden shadow-xs ${
                          isOpen ? "border-[#23483D]" : "border-[#E7E7E2] hover:border-[#CACCC6]"
                        }`}
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : f.id)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 font-normal text-sm md:text-base text-[#181A18] cursor-pointer"
                        >
                          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="leading-snug text-base sm:text-lg text-[#181A18] font-normal">{f.question}</h3>
                          <span className="p-1 rounded-[2px] bg-[#FAF6EE] border border-[#E7E7E2] text-[#676A65] shrink-0">
                            {isOpen ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div
                            className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#676A65] leading-relaxed border-t border-[#E7E7E2] prose max-w-none"
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
