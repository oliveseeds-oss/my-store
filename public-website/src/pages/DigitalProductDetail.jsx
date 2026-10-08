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
  MdShare, MdStar, MdStarBorder,
  MdFavorite, MdFavoriteBorder, MdCheck,
  MdCreditCard, MdAccountBalanceWallet
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
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-[#6B7C75]">
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
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-grow">
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

        {/* ── ASSET OVERVIEW & SPECIFICATIONS HIGHLIGHT ── */}
        {product.description && (
          <div className="mt-12 pt-8 border-t border-[#EAE4D6] max-w-4xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-2">
              System Overview &amp; Specifications
            </span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26] mb-4">
              About this Digital Asset
            </h3>
            <div className="text-sm sm:text-base text-[#4A5550] leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>

            {/* Quick Specs Highlight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#EAE4D6]">
              <div className="p-3 bg-[#FAF6EE] rounded-[3px] border border-[#EAE4D6]">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#A48855] block mb-0.5">Formats</span>
                <span className="text-xs font-semibold text-[#1C2B26] truncate block">{fileFormatText}</span>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-[3px] border border-[#EAE4D6]">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#A48855] block mb-0.5">Package Size</span>
                <span className="text-xs font-semibold text-[#1C2B26] truncate block">{fileSizeText}</span>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-[3px] border border-[#EAE4D6]">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#A48855] block mb-0.5">Licensing</span>
                <span className="text-xs font-semibold text-[#1C2B26] truncate block">Perpetual Commercial</span>
              </div>
              <div className="p-3 bg-[#FAF6EE] rounded-[3px] border border-[#EAE4D6]">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#A48855] block mb-0.5">Delivery</span>
                <span className="text-xs font-semibold text-[#1C2B26] truncate block">Instant Download</span>
              </div>
            </div>
          </div>
        )}

        {/* ── RECOMMENDED (SIMILAR) DIGITAL ASSETS ── */}
        <section className="mt-14 pt-10 border-t border-[#EAE4D6]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
                Curated Recommendations
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#1C2B26]">
                Similar Assets &amp; Recommended Systems
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7C75] mt-1">
                Explore complementary digital templates, design kits, and studio systems crafted to accelerate your creative workflow.
              </p>
            </div>
            <Link 
              to="/digital" 
              className="text-xs font-semibold text-[#23483D] hover:underline uppercase tracking-wider whitespace-nowrap self-start sm:self-end"
            >
              View Full Vault →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.slice(0, 4).map((r) => {
              const rImg = r.thumbnail_url || (r.images && r.images[0]);
              const rFinalPrice = (r.discount_price !== null && r.discount_price !== undefined && r.discount_price !== "")
                ? Number(r.discount_price)
                : Number(r.price || 0);
              const rDiscount = (r.discount_price && r.price) ? Math.round((1 - r.discount_price / r.price) * 100) : 0;

              return (
                <div
                  key={r.id} 
                  className="group bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[3px] overflow-hidden p-3.5 transition flex flex-col justify-between shadow-2xs hover:shadow-md"
                >
                  <Link 
                    to={`/digital/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="block relative overflow-hidden mb-3"
                  >
                    <div className="aspect-[16/10] bg-[#FAF6EE] rounded-[2px] overflow-hidden flex items-center justify-center relative">
                      {rImg ? (
                        <img 
                          src={rImg} 
                          alt={r.name} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-[#A48855]/30 flex flex-col items-center justify-center bg-white shadow-2xs">
                          <span className="font-serif text-xs font-bold text-[#A48855]">OS</span>
                        </div>
                      )}
                      {rDiscount > 0 && (
                        <span className="absolute top-2 left-2 text-[8.5px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#23483D] text-[#FAF6EE] tracking-wider uppercase">
                          −{rDiscount}%
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1">
                    <Link to={`/digital/${r.id}`} onClick={() => window.scrollTo(0, 0)}>
                      <h4 
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                        className="text-base sm:text-lg font-medium text-[#1C2B26] group-hover:text-[#23483D] transition line-clamp-2 min-h-[2.5em] mb-2"
                      >
                        {r.name}
                      </h4>
                    </Link>

                    <div className="mt-auto pt-2.5 border-t border-[#EAE4D6]/70 flex items-baseline justify-between mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg sm:text-xl font-bold text-[#1C2B26]">
                          {rFinalPrice === 0 ? "Free" : convert(rFinalPrice)}
                        </span>
                        {r.discount_price && Number(r.discount_price) < Number(r.price) && (
                          <span className="text-[11px] line-through text-[#8A8D88]">
                            {convert(r.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] uppercase font-bold text-[#A48855] tracking-wider">
                        Vault Asset
                      </span>
                    </div>

                    <Link
                      to={`/digital/${r.id}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="w-full py-2 text-center text-xs font-semibold text-[#23483D] bg-[#FAF6EE] hover:bg-[#23483D] hover:text-white transition rounded-[2px] uppercase tracking-wider"
                    >
                      Inspect Asset →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Authenticated Customer Reviews ── */}
        <section className="mt-14 pt-10 border-t border-[#EAE4D6]">
          <ReviewSection productId={product.id || product.product_uid} dark={false} />
        </section>

      </main>

      <Footer />
    </div>
  );
}