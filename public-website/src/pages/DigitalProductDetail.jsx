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

function ReviewForm({ productId, onSubmit }) {
  const { member } = useMember();
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!member) return (
    <div className="p-4 text-xs rounded-[4px]" style={{ background: "#F8F8F6", border: "1px solid #E7E7E2", color: "#676A65" }}>
      <Link to="/login" className="underline font-bold" style={{ color: "#23483D" }}>Sign in</Link> to write a review
    </div>
  );

  if (done) return (
    <div className="p-4 text-xs rounded-[4px]" style={{ background: "#F8F8F6", border: "1px solid #23483D", color: "#23483D" }}>
      ✓ Review submitted successfully. Thank you.
    </div>
  );

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!form.comment.trim()) {
      setError("Please enter your review text before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await API.post("/reviews", {
        digital_product_id: productId, product_type: "digital",
        rating: form.rating, title: form.title, comment: form.comment
      });
      setDone(true);
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Review submission error:", err);
      setError(err.response?.data?.error || "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-6 rounded-[4px]" style={{ background: "#FFFFFF", border: "1px solid #E7E7E2" }}>
      <h4 className="text-base font-semibold mb-4" style={{ color: "#181A18", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        Write a Review
      </h4>
      {error && (
        <div className="mb-3 p-2.5 text-xs rounded-[4px]" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid #f43f5e", color: "#f43f5e" }}>
          {error}
        </div>
      )}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-1" style={{ color: "#676A65" }}>Rating</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <button type="button" key={i} onClick={() => setForm(f => ({ ...f, rating: i }))}
              className="text-2xl transition cursor-pointer"
              style={{ color: i <= form.rating ? "#A48855" : "#E7E7E2" }}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs font-semibold mb-1 block" style={{ color: "#676A65" }}>Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Brief summary"
          className="w-full px-3 py-2 text-xs focus:outline-none rounded-[4px]"
          style={{ background: "#FFFFFF", color: "#181A18", border: "1px solid #DADCD7" }}
        />
      </div>
      <div className="mb-3">
        <label className="text-xs font-semibold mb-1 block" style={{ color: "#676A65" }}>Review *</label>
        <textarea
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={4}
          placeholder="Your detailed review..."
          className="w-full px-3 py-2 text-xs focus:outline-none rounded-[4px]"
          style={{ background: "#FFFFFF", color: "#181A18", border: "1px solid #DADCD7" }}
        />
      </div>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 text-xs font-semibold tracking-wider transition cursor-pointer disabled:opacity-50 rounded-[4px]"
        style={{ background: "#23483D", color: "white", border: "none" }}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export default function DigitalProductDetail() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { convert } = useCurrency();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const load = useCallback(async () => {
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
  }, [id, member]);
  useEffect(() => { load(); window.scrollTo(0,0); }, [load]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Creative Assets | Oliveseeds Studio`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${product.name} template by Oliveseeds Studio. ${product.description || ""}`);
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

  if (!product) return <CuteLoader />;

  const allImages = getAllProductImages(product);

  const finalPrice = (product.discount_price !== null && product.discount_price !== undefined && product.discount_price !== "")
    ? Number(product.discount_price)
    : Number(product.price || 0);
  const discount = (product.discount_price && product.price) ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const related = Array.isArray(product.related) ? product.related : [];

  const ratingCounts = [5,4,3,2,1].map(r => ({
    star: r,
    count: reviews.filter(v => v.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(v => v.rating === r).length / reviews.length * 100) : 0
  }));

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <SEO 
        title={`${product.name} | Olive Seeds Studio`} 
        description={product.description?.substring(0, 150) || "Download bespoke digital design suites, presentation templates, and brand identity kits at Olive Seeds Studio."}
        keywords={`${product.category_name || "digital template"}, brand identity kit, digital design suites, Olive Seeds`}
        ogImage={product.thumbnail_url}
        imageAlt={product.image_alt || product.name}
      />

      {/* Breadcrumb */}
      <div style={{ background: "#F8F8F6", borderBottom: "1px solid #E7E7E2" }}>
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs"
          style={{ color: "#676A65" }}>
          <Link to="/" className="hover:text-[#23483D] transition">Home</Link>
          <span>›</span>
          <Link to="/digital" className="hover:text-[#23483D] transition">Digital</Link>
          {product.category_name && (
            <><span>›</span><span style={{ color: "#181A18", fontWeight: 600 }}>{product.category_name}</span></>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Images */}
          <div className="lg:w-1/2 flex flex-col-reverse sm:flex-row gap-3">
            {allImages.length > 1 && (
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-16 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className="border-2 overflow-hidden transition aspect-video rounded-[4px]"
                    style={{
                      borderColor: selectedImg === i ? "#23483D" : "#E7E7E2",
                    }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden rounded-[4px]"
              style={{ border: "1px solid #E7E7E2", background: "#F8F8F6" }}>
              {allImages.length > 0
                ? <img src={allImages[selectedImg]} alt={product.name}
                    className="w-full aspect-video object-cover" />
                : <div className="w-full aspect-video flex items-center justify-center">
                    <span className="text-6xl opacity-20">⬡</span>
                  </div>}
            </div>
          </div>

          {/* Info */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map(t => (
                  <span key={t} className="text-xs font-semibold px-3 py-1 rounded-[4px]"
                    style={{ background: "#F8F8F6", border: "1px solid #E7E7E2", color: "#23483D" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {product.category_name && (
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#23483D" }}>
                {product.category_name}
              </p>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(26px, 3.5vw, 38px)", color: "#181A18", fontWeight: 400, lineHeight: 1.15 }}>
                {product.name}
              </h1>
              <button
                onClick={async () => {
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
                    console.error("Wishlist update failed", err);
                  }
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label="Wishlist"
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition shrink-0 cursor-pointer"
                style={{ background: "#FFFFFF", border: "1px solid #E7E7E2", color: isWishlisted ? "#e11d48" : "#64748b" }}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-base"
                    style={{ color: i <= Math.round(product.rating) ? "#A48855" : "#E7E7E2" }}>★</span>
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: "#676A65" }}>
                {Number(product.rating || 0).toFixed(1)} ({product.review_count || 0} reviews)
              </span>
            </div>

            <div style={{ borderTop: "1px solid #E7E7E2", paddingTop: "1rem" }}>
              {product.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#181A18" }}>{convert(finalPrice)}</span>
                  <span className="text-sm line-through" style={{ color: "#8A8D88" }}>{convert(product.price)}</span>
                  <span className="text-xs font-bold text-rose-700">-{discount}%</span>
                </div>
              ) : (
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#181A18" }}>{convert(finalPrice)}</span>
              )}
            </div>

            {/* File info */}
            {(product.file_format || product.file_size) && (
              <div className="flex gap-4">
                {product.file_format && (
                  <div className="text-center px-4 py-2 rounded-[4px]"
                    style={{ background: "#F8F8F6", border: "1px solid #E7E7E2" }}>
                    <p className="text-[11px]" style={{ color: "#676A65" }}>Format</p>
                    <p className="text-sm font-semibold" style={{ color: "#181A18" }}>{product.file_format}</p>
                  </div>
                )}
                {product.file_size && (
                  <div className="text-center px-4 py-2 rounded-[4px]"
                    style={{ background: "#F8F8F6", border: "1px solid #E7E7E2" }}>
                    <p className="text-[11px]" style={{ color: "#676A65" }}>File size</p>
                    <p className="text-sm font-semibold" style={{ color: "#181A18" }}>{product.file_size}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart({
                    ...product,
                    price: finalPrice,
                    original_price: Number(product.price),
                    discount_price: product.discount_price ? Number(product.discount_price) : null,
                    type: "digital"
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-[4px] cursor-pointer"
                style={{
                  background: added ? "#16a34a" : "transparent",
                  color: added ? "white" : "#23483D",
                  border: `1.5px solid ${added ? "#16a34a" : "#23483D"}`,
                }}>
                {added ? "✓ Added to Order" : "Add to Order"}
              </button>
              <button
                className="w-full py-3.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-[4px] cursor-pointer"
                style={{ background: "#23483D", color: "white", border: "none" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#16352D"}
                onMouseOut={(e) => e.currentTarget.style.background = "#23483D"}
                onClick={() => {
                  addToCart({
                    ...product,
                    price: finalPrice,
                    original_price: Number(product.price),
                    discount_price: product.discount_price ? Number(product.discount_price) : null,
                    type: "digital"
                  });
                  navigate(finalPrice === 0 ? "/checkout" : "/checkout?method=paypal");
                }}
              >
                {finalPrice === 0 ? "⚡ Download Asset" : "Acquire Asset — Secure Checkout"}
              </button>
            </div>

            {/* Payment Integration UI (Hidden if 0 rupees / free) */}
            {finalPrice > 0 && (
              <div className="p-5 flex flex-col gap-3.5 rounded-[4px] mt-2" style={{ background: "#F8F8F6", border: "1px solid #E7E7E2" }}>
                <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: "#23483D", letterSpacing: "0.12em" }}>Secure Checkout Options</span>
                <p className="text-xs leading-normal" style={{ color: "#676A65" }}>Choose gateway to authenticate payment securely:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        ...product,
                        price: finalPrice,
                        original_price: Number(product.price),
                        discount_price: product.discount_price ? Number(product.discount_price) : null,
                        type: "digital"
                      });
                      navigate("/checkout?method=razorpay");
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-[4px] transition cursor-pointer text-xs font-semibold text-[#181A18] bg-white hover:border-[#23483D] shadow-sm"
                    style={{ border: "1px solid #DADCD7" }}
                  >
                    💳 Razorpay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        ...product,
                        price: finalPrice,
                        original_price: Number(product.price),
                        discount_price: product.discount_price ? Number(product.discount_price) : null,
                        type: "digital"
                      });
                      navigate("/checkout?method=paypal");
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-[4px] transition cursor-pointer text-xs font-semibold text-[#181A18] bg-white hover:border-[#23483D] shadow-sm"
                    style={{ border: "1px solid #DADCD7" }}
                  >
                    🅿️ PayPal
                  </button>
                </div>
              </div>
            )}

            {/* Perks */}
            <div className="flex flex-col gap-2.5 text-xs"
              style={{ borderTop: "1px solid #E7E7E2", paddingTop: "1.2rem", color: "#676A65" }}>
              {[
                "⚡ Instant digital delivery after purchase",
                "📁 All source file formats included",
                "🔁 Free developer updates for life",
                "🛡️ Commercial use license included",
              ].map(t => <p key={t}>{t}</p>)}
            </div>
          </div>
        </div>

        {/* Dynamic High-Attention Brand Banner Ad Panel */}
        <div className="mt-10">
          <AdBanner placement="Large Panel" />
        </div>

        {/* Description */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid #E7E7E2" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 600, color: "#181A18", marginBottom: 12 }}>
            Product Description
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#676A65" }}>
            {product.description}
          </p>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <ReviewSection productId={product.id || product.product_uid} dark={false} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 pt-8" style={{ borderTop: "1px solid #E7E7E2" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 600, color: "#181A18", marginBottom: 16 }}>
              Customers Also Viewed
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
              {related.map(r => {
                const img = r.thumbnail_url || (r.images && r.images[0]);
                const price = r.discount_price || r.price;
                const discount = r.discount_price ? Math.round((1 - r.discount_price / r.price) * 100) : 0;
                return (
                  <Link key={r.id} to={`/digital/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ flex: "0 0 200px", background: "#FFFFFF", border: "1px solid #E7E7E2" }}
                    className="group hover:border-[#CACCC6] transition overflow-hidden rounded-[4px] p-3 flex flex-col justify-between">
                    <div>
                      <div className="aspect-video bg-[#F8F8F6] overflow-hidden rounded-[4px] mb-2 flex items-center justify-center">
                        {img
                          ? <img src={img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          : <span className="text-2xl opacity-20">⬡</span>}
                      </div>
                      <p className="text-xs line-clamp-2 leading-snug mb-1 font-medium" style={{ color: "#181A18" }}>
                        {r.name}
                      </p>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-[#A48855]">
                          {"★".repeat(Math.round(r.rating || 5)) + "☆".repeat(5 - Math.round(r.rating || 5))}
                        </span>
                        <span className="text-[10px]" style={{ color: "#676A65" }}>{r.review_count || 8}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-[#181A18]">{convert(price)}</span>
                        {r.discount_price && (
                          <>
                            <span className="text-[10px] line-through" style={{ color: "#8A8D88" }}>{convert(r.price)}</span>
                            <span className="text-[10px] font-bold text-rose-600">({discount}% off)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}