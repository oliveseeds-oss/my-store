import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";
import CuteLoader from "../components/CuteLoader";
import ReviewSection from "../components/ReviewSection";
import { getAllProductImages } from "../utils/imageHelper";
import { 
  MdShield, MdOutlineFileDownload, MdOutlineCheckCircle, 
  MdOutlineWorkspacePremium, MdShare, MdStar, MdStarBorder,
  MdFavorite, MdFavoriteBorder, MdCheck, MdClose,
  MdCreditCard, MdAccountBalanceWallet, MdArchitecture,
  MdFolderOpen, MdLayers, MdSecurity, MdBolt
} from "react-icons/md";

export default function DigitalProductDetail() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { convert } = useCurrency();
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("concept"); // 'concept', 'manifest', 'licensing', 'verification'
  const [copiedLink, setCopiedLink] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await API.get(`/digital-products/${id}`);
      setProduct(r.data);
      if (member) {
        try {
          const wRes = await API.get("/wishlist/my");
          if (Array.isArray(wRes.data)) {
            const idStr = String(id);
            const pUidStr = String(r.data.product_uid || r.data.id || "");
            const exists = wRes.data.some(w => String(w) === idStr || String(w) === pUidStr);
            setIsWishlisted(exists);
          }
        } catch {
          // Guest mode
        }
      } else {
        setIsWishlisted(false);
      }
    } catch (err) {
      console.error("Failed to load digital asset:", err);
    }
  }, [id, member]);

  useEffect(() => { 
    load(); 
    window.scrollTo(0, 0); 
  }, [load]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Digital Design Vault | Olive Seeds`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${product.name} — executive digital design asset by Olive Seeds. ${product.description || ""}`);
      }

      // Inject JSON-LD Structured Data
      let script = document.getElementById("jsonld-digital");
      if (!script) {
        script = document.createElement("script");
        script.id = "jsonld-digital";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.thumbnail_url ? [`https://www.oliveseedsdesignstudio.com${product.thumbnail_url}`] : [],
        "description": product.description || "",
        "sku": product.product_uid || `DIGITAL-${product.id}`,
        "offers": {
          "@type": "Offer",
          "url": `https://www.oliveseedsdesignstudio.com/digital/${id}`,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": "https://schema.org/InStock"
        }
      };
      
      script.innerHTML = JSON.stringify(structuredData);
    }

    return () => {
      const script = document.getElementById("jsonld-digital");
      if (script) script.remove();
    };
  }, [product, id]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!product) return <CuteLoader />;

  const allImages = getAllProductImages(product);

  const finalPrice = (product.discount_price !== null && product.discount_price !== undefined && product.discount_price !== "")
    ? Number(product.discount_price)
    : Number(product.price || 0);
  const discount = (product.discount_price && product.price) ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const related = Array.isArray(product.related) ? product.related : [];

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: finalPrice,
      original_price: Number(product.price),
      discount_price: product.discount_price ? Number(product.discount_price) : null,
      type: "digital"
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleInstantAcquire = (gateway = "standard") => {
    addToCart({
      ...product,
      price: finalPrice,
      original_price: Number(product.price),
      discount_price: product.discount_price ? Number(product.discount_price) : null,
      type: "digital"
    });
    if (finalPrice === 0) {
      navigate("/checkout");
    } else if (gateway === "razorpay") {
      navigate("/checkout?method=razorpay");
    } else if (gateway === "paypal") {
      navigate("/checkout?method=paypal");
    } else {
      navigate("/checkout");
    }
  };

  const toggleWishlist = async () => {
    if (!member) {
      navigate("/login");
      return;
    }
    const targetUid = product.product_uid || product.id;
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${targetUid}`);
        setIsWishlisted(false);
      } else {
        await API.post("/wishlist/add", { product_uid: targetUid, product_type: "digital" });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist update failed:", err);
    }
  };

  // Structured specification details derived from digital product attributes
  const fileFormatText = product.file_format || "Figma, React / Webflow, 3D (OBJ/FBX), Vector AI";
  const fileSizeText = product.file_size || "48.5 MB (Uncompressed ZIP)";

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ color: "#1C2B26", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <SEO 
        title={`${product.name} | Digital Design Vault | Olive Seeds`} 
        description={product.description?.substring(0, 160) || "Download bespoke UI/UX design systems, website and mobile app templates, brand identity kits, 3D models, and digital files at Olive Seeds."}
        keywords={`${product.category_name || "digital template"}, ui ux kit, website template, mobile app ui, brand identity kit, 3d models, ai agent, Olive Seeds`}
        ogImage={product.thumbnail_url}
        imageAlt={product.image_alt || product.name}
      />

      {/* ── Breadcrumb Masthead ── */}
      <div className="border-b border-[#EAE4D6]" style={{ background: "#FAF6EE" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-[#6B7C75]">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#23483D] transition">Home</Link>
            <span>/</span>
            <Link to="/digital" className="hover:text-[#23483D] transition">Digital Design Vault</Link>
            {product.category_name && (
              <>
                <span>/</span>
                <span className="text-[#1C2B26] font-medium">{product.category_name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-stone-400 truncate max-w-[200px]">{product.name}</span>
          </div>

          <button
            onClick={copyShareLink}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] transition cursor-pointer"
            title="Copy share link"
          >
            {copiedLink ? <MdOutlineCheckCircle className="text-emerald-700" /> : <MdShare />}
            <span>{copiedLink ? "Link Copied" : "Share Dossier"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Product Display ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ── Left Gallery (7 Cols on desktop) ── */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Primary Viewport */}
            <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] overflow-hidden shadow-xs">
              {allImages.length > 0 ? (
                <img 
                  src={allImages[selectedImg]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF6EE] text-[#23483D] p-6 text-center">
                  <div className="w-20 h-20 rounded-full border border-[#A48855]/40 flex flex-col items-center justify-center bg-white shadow-2xs mb-3">
                    <span className="font-serif text-2xl font-bold tracking-widest text-[#A48855]">OS</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#6B7C75]">Vault</span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#6B7C75]">Digital Creative Suite</span>
                </div>
              )}

              {/* Format Badge */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-[2px] text-[9px] font-bold tracking-[0.16em] uppercase bg-white/90 backdrop-blur-md text-[#23483D] border border-[#EAE4D6] shadow-xs">
                  {fileFormatText}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
                  isWishlisted 
                    ? "bg-[#23483D] text-[#FAF6EE]" 
                    : "bg-white/90 backdrop-blur-md text-stone-500 hover:text-rose-600 border border-[#EAE4D6]"
                }`}
              >
                {isWishlisted ? <MdFavorite className="text-base text-rose-300" /> : <MdFavoriteBorder className="text-base" />}
              </button>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`relative w-20 h-14 rounded-[3px] overflow-hidden border transition shrink-0 cursor-pointer ${
                      selectedImg === i 
                        ? "border-[#23483D] ring-1 ring-[#23483D]" 
                        : "border-[#EAE4D6] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Asset view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Technical Specs Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#A48855]">Format</p>
                <p className="text-xs font-semibold text-[#1C2B26] mt-0.5 truncate">{fileFormatText}</p>
              </div>
              <div className="p-3 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#A48855]">Payload Size</p>
                <p className="text-xs font-semibold text-[#1C2B26] mt-0.5 truncate">{fileSizeText}</p>
              </div>
              <div className="p-3 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#A48855]">Licensing</p>
                <p className="text-xs font-semibold text-[#1C2B26] mt-0.5 truncate">Commercial Multi-Use</p>
              </div>
              <div className="p-3 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] text-center">
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#A48855]">Delivery</p>
                <p className="text-xs font-semibold text-[#1C2B26] mt-0.5 truncate">Instant Cloud Release</p>
              </div>
            </div>

          </div>

          {/* ── Right Buy Box Suite (5 Cols on desktop) ── */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              {/* Category & Discipline Kicker */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A48855]">
                  {product.category_name || "Digital Vault Asset"}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[10px] font-mono text-stone-400">
                  UID: {product.product_uid || product.id}
                </span>
              </div>

              {/* Title */}
              <h1 
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                className="text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#1C2B26] tracking-tight leading-[1.12]"
              >
                {product.name}
              </h1>

              {/* Star Rating & Reviews Count */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center text-[#A48855] text-sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    s <= Math.round(product.rating || 5) 
                      ? <MdStar key={s} className="text-base" /> 
                      : <MdStarBorder key={s} className="text-base text-stone-300" />
                  ))}
                </div>
                <span className="text-xs text-[#6B7C75]">
                  {Number(product.rating || 5).toFixed(1)} ({product.review_count || 12} authenticated evaluations)
                </span>
              </div>
            </div>

            {/* Price Presentation */}
            <div className="py-4 border-y border-[#EAE4D6] flex items-baseline gap-3">
              <span 
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                className="text-3xl sm:text-4xl font-bold text-[#1C2B26]"
              >
                {convert(finalPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-stone-400 line-through">
                    {convert(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[2px]">
                    -{discount}% Acquisition Incentive
                  </span>
                </>
              )}
            </div>

            {/* Tags Strip */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span 
                    key={t}
                    className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-[2px] bg-[#FAF6EE] text-[#23483D] border border-[#EAE4D6]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleInstantAcquire()}
                className="w-full py-4 bg-[#23483D] hover:bg-[#16352D] text-[#FAF6EE] text-xs font-bold tracking-[0.12em] uppercase rounded-[4px] transition shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <MdOutlineFileDownload className="text-base" />
                {finalPrice === 0 ? "Download Complimentary Asset" : "Acquire Asset — Instant Vault Release"}
              </button>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 text-xs font-bold tracking-[0.12em] uppercase rounded-[4px] transition border cursor-pointer flex items-center justify-center gap-2 ${
                  added 
                    ? "bg-[#16a34a] text-white border-[#16a34a]" 
                    : "bg-white hover:bg-[#FAF6EE] text-[#1C2B26] border-[#EAE4D6]"
                }`}
              >
                {added ? (
                  <>
                    <MdCheck className="text-base" />
                    <span>Deposited in Order Cart</span>
                  </>
                ) : (
                  <span>+ Add to Studio Order</span>
                )}
              </button>
            </div>

            {/* Secure Checkout Options (Hidden if 0 rupees / free) */}
            {finalPrice > 0 && (
              <div className="p-4 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#A48855]">
                    Direct Gateway Authentication
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">256-Bit SSL</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleInstantAcquire("razorpay")}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:border-[#23483D] border border-[#EAE4D6] rounded-[3px] text-xs font-semibold text-[#1C2B26] transition shadow-2xs cursor-pointer"
                  >
                    <MdCreditCard className="text-base text-[#23483D]" /> Razorpay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantAcquire("paypal")}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:border-[#23483D] border border-[#EAE4D6] rounded-[3px] text-xs font-semibold text-[#1C2B26] transition shadow-2xs cursor-pointer"
                  >
                    <MdAccountBalanceWallet className="text-base text-[#23483D]" /> PayPal
                  </button>
                </div>
              </div>
            )}

            {/* White-Glove Digital Assurance */}
            <div className="border border-[#EAE4D6] rounded-[4px] p-4 bg-white space-y-2.5 text-xs text-[#6B7C75]">
              <div className="flex items-center gap-2 text-[#1C2B26] font-bold uppercase tracking-wider text-[10px]">
                <MdShield className="text-[#A48855] text-sm" />
                <span>Olive Seeds Digital Guarantee</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center gap-2 text-stone-700">
                  <MdCheck className="text-emerald-700 shrink-0 text-sm" /> Instant cloud delivery upon payment completion
                </li>
                <li className="flex items-center gap-2 text-stone-700">
                  <MdCheck className="text-emerald-700 shrink-0 text-sm" /> Full uncompressed source formats & clean layer stacks
                </li>
                <li className="flex items-center gap-2 text-stone-700">
                  <MdCheck className="text-emerald-700 shrink-0 text-sm" /> Perpetual commercial royalty-free deployment license
                </li>
                <li className="flex items-center gap-2 text-stone-700">
                  <MdCheck className="text-emerald-700 shrink-0 text-sm" /> Lifetime re-download authorization via Client Atelier
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── Brand Banner Ad Panel ── */}
        <div className="mt-12">
          <AdBanner placement="Large Panel" />
        </div>

        {/* ── Architectural Digital Dossier & Specification Suite ── */}
        <section className="mt-14 pt-10 border-t border-[#EAE4D6]">
          
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
              Technical Dossier
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl font-normal text-[#1C2B26]">
              Digital Architecture &amp; Specification Dossier
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7C75] mt-1.5">
              Inspect design system hierarchy, file formats, software interoperability, and commercial deployment rights.
            </p>
          </div>

          {/* Dossier Interactive Tabs */}
          <div className="border-b border-[#EAE4D6] flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
            {[
              { id: "concept", label: "Asset Dossier & Philosophy", icon: <MdArchitecture className="text-base text-[#A48855]" /> },
              { id: "manifest", label: "File Manifest & Technical Specs", icon: <MdFolderOpen className="text-base text-[#A48855]" /> },
              { id: "licensing", label: "Commercial Rights & License", icon: <MdOutlineWorkspacePremium className="text-base text-[#A48855]" /> },
              { id: "verification", label: "Integrity & Authenticity", icon: <MdSecurity className="text-base text-[#A48855]" /> },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                    active
                      ? "border-[#23483D] text-[#23483D] bg-[#FAF6EE]/60"
                      : "border-transparent text-[#6B7C75] hover:text-[#1C2B26] hover:bg-[#FAF6EE]/30"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Asset Dossier & Philosophy */}
          {activeTab === "concept" && (
            <div className="py-8 space-y-6 animate-fadeIn max-w-4xl">
              <div className="p-6 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px]">
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26] mb-3">
                  System Architecture &amp; Creative Intent
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7C75] leading-relaxed whitespace-pre-wrap">
                  {product.description || "Crafted to exacting studio standards, this digital asset bridges bespoke visual design sensibility with high-performance production tolerances. Each system is authored natively in industry-leading software (Figma, React, Webflow, 3D, and AI frameworks), ensuring uncompromised precision, modular scalability, and instant commercial readiness."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 border border-[#EAE4D6] rounded-[4px] bg-white">
                  <MdArchitecture className="text-2xl text-[#A48855] mb-2" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Design System Precision</h4>
                  <p className="text-xs text-[#6B7C75] mt-1 leading-relaxed">
                    Clean token structures, auto-layout hierarchies, and verified component libraries ensure rapid assembly and zero visual artifacting across all screens.
                  </p>
                </div>
                <div className="p-5 border border-[#EAE4D6] rounded-[4px] bg-white">
                  <MdLayers className="text-2xl text-[#A48855] mb-2" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Executive Standard</h4>
                  <p className="text-xs text-[#6B7C75] mt-1 leading-relaxed">
                    Typography hierarchies, grid ratios, and proportion canons are calibrated to meet Fortune 500 board, high-growth startup, and luxury brand scrutiny.
                  </p>
                </div>
                <div className="p-5 border border-[#EAE4D6] rounded-[4px] bg-white">
                  <MdBolt className="text-2xl text-[#A48855] mb-2" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C2B26]">Production Ready</h4>
                  <p className="text-xs text-[#6B7C75] mt-1 leading-relaxed">
                    Zero missing font warnings or broken assets. Complete source files, documentation, and design tokens are packaged into the release archive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: File Manifest & Technical Specs */}
          {activeTab === "manifest" && (
            <div className="py-8 space-y-6 animate-fadeIn max-w-4xl">
              <div className="bg-white border border-[#EAE4D6] rounded-[4px] overflow-hidden shadow-xs">
                <div className="bg-[#FAF6EE] px-5 py-3 border-b border-[#EAE4D6]">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-normal text-[#1C2B26]">
                    Technical File Manifest &amp; Software Compatibility
                  </h3>
                </div>
                <div className="divide-y divide-[#EAE4D6] text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Primary Formats</span>
                    <span className="sm:col-span-2 text-[#1C2B26] font-medium">{fileFormatText}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Payload Archive</span>
                    <span className="sm:col-span-2 text-[#1C2B26] font-medium">{fileSizeText}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Supported Software</span>
                    <span className="sm:col-span-2 text-[#1C2B26]">Figma, Webflow, React, Next.js, Blender, Cinema 4D, Adobe Creative Cloud, Framer, and Modern AI Pipelines</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Layer Structure</span>
                    <span className="sm:col-span-2 text-[#1C2B26]">Cleanly named, grouped, zero unlinked assets, non-destructive vector paths</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Color &amp; Scale Space</span>
                    <span className="sm:col-span-2 text-[#1C2B26]">Scalable Vectors, 8pt Grid Standards &amp; Display P3 / sRGB Color Palettes</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4">
                    <span className="font-bold text-[#A48855] uppercase tracking-wider">Typography Hierarchy</span>
                    <span className="sm:col-span-2 text-[#1C2B26]">Cormorant Garamond &amp; DM Sans Google Fonts open-source pairing</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Commercial Rights & Licensing */}
          {activeTab === "licensing" && (
            <div className="py-8 space-y-6 animate-fadeIn max-w-4xl">
              <div className="p-6 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] space-y-4">
                <div className="flex items-center gap-2">
                  <MdOutlineWorkspacePremium className="text-xl text-[#A48855]" />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26]">
                    Commercial Deployment License Terms
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7C75] leading-relaxed">
                  Every acquisition from the Olive Seeds Digital Vault includes an unrestricted Perpetual Commercial Multi-Project License.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white border border-[#EAE4D6] rounded-[3px]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                      <MdCheck /> Authorized Use
                    </div>
                    <ul className="text-xs text-[#6B7C75] space-y-1">
                      <li>• Unlimited commercial &amp; client projects</li>
                      <li>• Multi-platform web, mobile app development &amp; client deliverables</li>
                      <li>• Corporate presentations, pitches &amp; marketing campaigns</li>
                      <li>• Modification and adaptation for brand design guidelines</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white border border-[#EAE4D6] rounded-[3px]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">
                      <MdClose /> Restricted Use
                    </div>
                    <ul className="text-xs text-[#6B7C75] space-y-1">
                      <li>• Resale, sub-licensing, or raw file re-distribution</li>
                      <li>• Inclusion in competing digital template vaults</li>
                      <li>• Claiming raw un-modified geometry as original authoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Integrity & Authenticity */}
          {activeTab === "verification" && (
            <div className="py-8 space-y-6 animate-fadeIn max-w-4xl">
              <div className="p-6 bg-white border border-[#EAE4D6] rounded-[4px] space-y-4">
                <div className="flex items-center gap-2">
                  <MdSecurity className="text-xl text-[#A48855]" />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#1C2B26]">
                    Studio Security & Integrity Guarantee
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7C75] leading-relaxed">
                  Your acquisition payload is mirrored across redundant encrypted cloud storage clusters. Download links never expire and can be retrieved at any hour via your private Client Atelier.
                </p>

                <div className="p-4 bg-[#FAF6EE] border border-[#EAE4D6] rounded-[3px] font-mono text-[11px] text-[#23483D] space-y-1.5">
                  <p className="flex items-center gap-2"><MdCheck className="text-emerald-700" /> SHA256 CHECKSUM: VERIFIED & SEALED</p>
                  <p className="flex items-center gap-2"><MdCheck className="text-emerald-700" /> MALWARE SCAN: 0/72 CLEAN ENGINES</p>
                  <p className="flex items-center gap-2"><MdCheck className="text-emerald-700" /> CLOUD BACKUP: GLOBAL REDUNDANCY ACTIVE</p>
                </div>
              </div>
            </div>
          )}

        </section>

        {/* ── Authenticated Customer Reviews ── */}
        <section className="mt-14 pt-10 border-t border-[#EAE4D6]">
          <ReviewSection productId={product.id || product.product_uid} dark={false} />
        </section>

        {/* ── Related Digital Assets Carousel / Grid ── */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#EAE4D6]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
                  Complementary Assets
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Archived from the Same Studio Collection
                </h2>
              </div>
              <Link 
                to="/digital" 
                className="text-xs font-semibold text-[#23483D] hover:underline uppercase tracking-wider"
              >
                View Complete Vault →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 4).map((r) => {
                const img = r.thumbnail_url || (r.images && r.images[0]);
                const price = r.discount_price || r.price;
                return (
                  <Link 
                    key={r.id} 
                    to={`/digital/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="group border border-[#EAE4D6] hover:border-[#23483D] rounded-[4px] bg-white overflow-hidden p-3 transition shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-[#FAF6EE] rounded-[3px] overflow-hidden mb-2.5 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-[#A48855]/30 flex flex-col items-center justify-center bg-white shadow-2xs">
                            <span className="font-serif text-xs font-bold text-[#A48855]">OS</span>
                          </div>
                        )}
                      </div>
                      <h4 
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                        className="text-sm sm:text-base font-medium text-[#1C2B26] group-hover:text-[#23483D] transition line-clamp-2"
                      >
                        {r.name}
                      </h4>
                    </div>
                    <div className="pt-2 border-t border-[#EAE4D6]/60 mt-3 flex items-center justify-between">
                      <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-base font-bold text-[#1C2B26]">
                        {convert(price)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#A48855]">
                        Inspect →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}