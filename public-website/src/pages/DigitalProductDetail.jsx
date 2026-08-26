import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";
import CuteLoader from "../components/CuteLoader";

function ReviewForm({ productId, onSubmit }) {
  const { member } = useMember();
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [done, setDone] = useState(false);

  if (!member) return (
    <div className="p-4 text-xs" style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.15)", color: "#94a3b8" }}>
      <Link to="/login" className="underline" style={{ color: "#38bdf8" }}>Sign in</Link> to write a review
    </div>
  );

  if (done) return (
    <div className="p-4 text-xs" style={{ background: "#0c1445", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
      ✓ Review submitted. Thank you!
    </div>
  );

  const submit = async () => {
    if (!form.comment) return;
    await API.post("/reviews", {
      digital_product_id: productId, product_type: "digital",
      rating: form.rating, title: form.title, comment: form.comment
    });
    setDone(true); onSubmit();
  };

  return (
    <div className="p-5" style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.15)" }}>
      <h4 className="text-sm font-bold mb-4" style={{ color: "#38bdf8", fontFamily: "'Space Mono', monospace" }}>
        {"// WRITE A REVIEW"}
      </h4>
      <div className="mb-3">
        <p className="text-xs mb-1" style={{ color: "#64748b" }}>Rating</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <button key={i} onClick={() => setForm(f => ({ ...f, rating: i }))}
              className="text-2xl transition"
              style={{ color: i <= form.rating ? "#0ea5e9" : "#1e293b" }}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs mb-1 block" style={{ color: "#64748b" }}>Title</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Brief summary"
          className="w-full px-3 py-2 text-xs focus:outline-none"
          style={{ background: "#020617", color: "#e2e8f0", border: "1px solid rgba(56,189,248,0.2)" }}
        />
      </div>
      <div className="mb-3">
        <label className="text-xs mb-1 block" style={{ color: "#64748b" }}>Review</label>
        <textarea
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={4}
          placeholder="Your detailed review..."
          className="w-full px-3 py-2 text-xs focus:outline-none"
          style={{ background: "#020617", color: "#e2e8f0", border: "1px solid rgba(56,189,248,0.2)" }}
        />
      </div>
      <button onClick={submit}
        className="px-6 py-2 text-xs font-bold tracking-widest transition"
        style={{ background: "#0ea5e9", color: "white", border: "none" }}>
        SUBMIT REVIEW
      </button>
    </div>
  );
}

export default function DigitalProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const load = useCallback(async () => {
    const r = await API.get(`/digital-products/${id}`);
    setProduct(r.data);
    try {
      const wRes = await API.get("/wishlist/my");
      if (Array.isArray(wRes.data)) {
        const targetUid = r.data.product_uid || r.data.id;
        const exists = wRes.data.some(w => w.product_uid === targetUid || String(w.product_uid) === String(id));
        setIsWishlisted(exists);
      }
    } catch {
      // Guest mode
    }
  }, [id]);
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

  const allImages = [
    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const finalPrice = product.discount_price || product.price;
  const discount = product.discount_price ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const related = Array.isArray(product.related) ? product.related : [];

  const ratingCounts = [5,4,3,2,1].map(r => ({
    star: r,
    count: reviews.filter(v => v.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(v => v.rating === r).length / reviews.length * 100) : 0
  }));

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      <Navbar />
      <SEO 
        title={`${product.name} - Premium Digital Studio`} 
        description={product.description?.substring(0, 160) || "Download premium custom React apps, Notion templates, Figma UI kits, and vector masterworks at Olive Seeds."}
        keywords={`${product.category_name || "digital template"}, Notion templates, Figma kit, React developer tools, Olive Seeds`}
        ogImage={product.thumbnail_url}
        imageAlt={product.image_alt || product.name}
      />

      {/* Breadcrumb */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid rgba(56,189,248,0.1)" }}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-xs"
          style={{ color: "#64748b" }}>
          <Link to="/" className="hover:text-sky-400 transition">Home</Link>
          <span>›</span>
          <Link to="/digital" className="hover:text-sky-400 transition">Digital</Link>
          {product.category_name && (
            <><span>›</span><span style={{ color: "#38bdf8" }}>{product.category_name}</span></>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Images */}
          <div className="lg:w-1/2 flex flex-col-reverse sm:flex-row gap-3">
            {allImages.length > 1 && (
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-16 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className="border-2 overflow-hidden transition aspect-video"
                    style={{
                      borderColor: selectedImg === i ? "#38bdf8" : "rgba(56,189,248,0.15)",
                    }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden"
              style={{ border: "1px solid rgba(56,189,248,0.2)", background: "#0f172a" }}>
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
                  <span key={t} className="text-xs font-bold px-3 py-1"
                    style={{ background: "#0ea5e9", color: "white" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {product.category_name && (
              <p className="text-xs font-bold tracking-widest" style={{ color: "#38bdf8" }}>
                {product.category_name}
              </p>
            )}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
                {product.name}
              </h1>
              <button
                onClick={async () => {
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm hover:scale-105 transition shrink-0 cursor-pointer"
                style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.3)", color: isWishlisted ? "#e11d48" : "#94a3b8" }}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-base"
                    style={{ color: i <= Math.round(product.rating) ? "#0ea5e9" : "#1e293b" }}>★</span>
                ))}
              </div>
              <span className="text-xs" style={{ color: "#38bdf8" }}>
                {Number(product.rating || 0).toFixed(1)} ({product.review_count || 0} reviews)
              </span>
            </div>

            <div style={{ borderTop: "1px solid rgba(56,189,248,0.15)", paddingTop: "1rem" }}>
              {product.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" style={{ color: "#f1f5f9" }}>₹{finalPrice}</span>
                  <span className="text-sm line-through" style={{ color: "#475569" }}>₹{product.price}</span>
                  <span className="text-xs font-bold" style={{ color: "#f43f5e" }}>-{discount}%</span>
                </div>
              ) : (
                <span className="text-3xl font-bold" style={{ color: "#f1f5f9" }}>₹{finalPrice}</span>
              )}
            </div>

            {/* File info */}
            {(product.file_format || product.file_size) && (
              <div className="flex gap-4">
                {product.file_format && (
                  <div className="text-center px-4 py-2"
                    style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.2)" }}>
                    <p className="text-xs" style={{ color: "#64748b" }}>Format</p>
                    <p className="text-sm font-bold" style={{ color: "#38bdf8" }}>{product.file_format}</p>
                  </div>
                )}
                {product.file_size && (
                  <div className="text-center px-4 py-2"
                    style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.2)" }}>
                    <p className="text-xs" style={{ color: "#64748b" }}>File size</p>
                    <p className="text-sm font-bold" style={{ color: "#38bdf8" }}>{product.file_size}</p>
                  </div>
                )}
              </div>
            )}

             <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => { addToCart({ ...product, type: "digital" }); setAdded(true); setTimeout(() => setAdded(false), 2000); }}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-full cursor-pointer"
                style={{
                  background: added ? "#0ea5e9" : "transparent",
                  color: added ? "white" : "#38bdf8",
                  border: `1.5px solid ${added ? "#0ea5e9" : "#38bdf8"}`,
                  fontFamily: "'Space Mono', monospace",
                  boxShadow: "0 4px 14px rgba(14,165,233,0.15)"
                }}>
                {added ? "✓ ADDED TO CART" : "ADD TO CART"}
              </button>
              <button
                className="w-full py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-full cursor-pointer hover:brightness-110 shadow-lg shadow-sky-500/10"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", color: "white", border: "none", fontFamily: "'Space Mono', monospace" }}
                onClick={() => { addToCart({ ...product, type: "digital" }); window.location.href = "/checkout"; }}
              >
                BUY NOW — INSTANT DOWNLOAD
              </button>
            </div>

            {/* Payment Integration UI */}
            <div className="p-5 flex flex-col gap-3.5 rounded-2xl mt-4" style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.15)" }}>
              <span className="text-[10px] font-extrabold uppercase tracking-widest block" style={{ color: "#38bdf8", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}>{"// SECURE CHECKOUT"}</span>
              <p className="text-[11.5px] leading-normal" style={{ color: "#64748b" }}>Choose gateway to authenticate payment instantly:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => alert("Razorpay checkout selected. Complete your transaction securely.")}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition cursor-pointer text-xs font-bold text-[#38bdf8] hover:bg-sky-500/10"
                  style={{ background: "#020617", border: "1px solid rgba(56,189,248,0.2)" }}
                >
                  💳 Razorpay
                </button>
                <button
                  type="button"
                  onClick={() => alert("PayPal checkout selected. Complete your transaction securely.")}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition cursor-pointer text-xs font-bold text-[#38bdf8] hover:bg-blue-500/10"
                  style={{ background: "#020617", border: "1px solid rgba(56,189,248,0.2)" }}
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            {/* Perks */}
            <div className="flex flex-col gap-2.5 text-xs"
              style={{ borderTop: "1px solid rgba(56,189,248,0.15)", paddingTop: "1.2rem", color: "#64748b" }}>
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
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
          <h2 className="text-sm font-bold tracking-widest mb-4" style={{ color: "#38bdf8" }}>
            {"// PRODUCT DESCRIPTION"}
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#94a3b8" }}>
            {product.description}
          </p>
        </div>

        {/* Reviews */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
          <h2 className="text-sm font-bold tracking-widest mb-6" style={{ color: "#38bdf8" }}>
            {"// CUSTOMER REVIEWS"}
          </h2>
          {reviews.length > 0 && (
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center justify-center w-40">
                <p className="text-5xl font-bold" style={{ color: "#f1f5f9" }}>
                  {Number(product.rating).toFixed(1)}
                </p>
                <div className="flex my-1">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= Math.round(product.rating) ? "#0ea5e9" : "#1e293b" }}>★</span>
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#64748b" }}>{reviews.length} reviews</p>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {ratingCounts.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs w-12 text-right" style={{ color: "#38bdf8" }}>{star} ★</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#0ea5e9" }} />
                    </div>
                    <span className="text-xs w-8" style={{ color: "#64748b" }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            {reviews.map(r => (
              <div key={r.id} className="pb-4" style={{ borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#0c1445", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
                    {r.member_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#e2e8f0" }}>{r.member_name}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className="text-xs"
                          style={{ color: i <= r.rating ? "#0ea5e9" : "#1e293b" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs ml-auto" style={{ color: "#334155" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                </div>
                {r.title && <p className="text-xs font-bold mb-1" style={{ color: "#38bdf8" }}>{r.title}</p>}
                <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{r.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-xs" style={{ color: "#334155" }}>No reviews yet. Be the first!</p>
            )}
          </div>
          <ReviewForm productId={product.id} onSubmit={load} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
            <h2 className="text-sm font-bold tracking-widest mb-4" style={{ color: "#38bdf8", fontFamily: "'Space Mono', monospace" }}>
              {"// CUSTOMERS ALSO VIEWED"}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
              {related.map(r => {
                const img = r.thumbnail_url || (r.images && r.images[0]);
                const price = r.discount_price || r.price;
                const discount = r.discount_price ? Math.round((1 - r.discount_price / r.price) * 100) : 0;
                return (
                  <Link key={r.id} to={`/digital/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ flex: "0 0 180px", background: "#0f172a", border: "1px solid rgba(56,189,248,0.15)" }}
                    className="group hover:shadow-md transition overflow-hidden rounded-[4px] p-3 flex flex-col justify-between">
                    <div>
                      <div className="aspect-video bg-slate-950 overflow-hidden rounded-[4px] mb-2 flex items-center justify-center">
                        {img
                          ? <img src={img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          : <span className="text-2xl opacity-20">⬡</span>}
                      </div>
                      <p className="text-xs hover:underline line-clamp-2 leading-snug mb-1 font-medium" style={{ color: "#38bdf8" }}>
                        {r.name}
                      </p>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-amber-400">
                          {"★".repeat(Math.round(r.rating || 5)) + "☆".repeat(5 - Math.round(r.rating || 5))}
                        </span>
                        <span className="text-[10px]" style={{ color: "#64748b" }}>{r.review_count || 8}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white">₹{price}</span>
                        {r.discount_price && (
                          <>
                            <span className="text-[10px] line-through" style={{ color: "#64748b" }}>₹{r.price}</span>
                            <span className="text-[10px] font-bold text-rose-500">({discount}% off)</span>
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
      <Footer dark />
    </div>
  );
}