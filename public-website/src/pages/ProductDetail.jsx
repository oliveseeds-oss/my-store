import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdBanner from "../components/AdBanner";

function Stars({ rating, size = "md" }) {
  const sz = size === "sm" ? "text-xs" : "text-base";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`${sz} ${i <= Math.round(rating) ? "text-amber-500" : "text-stone-300"}`}>★</span>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSubmit }) {
  const { member } = useMember();
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!member) return (
    <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
      <Link to="/login" className="underline font-semibold">Sign in</Link> to write a review
    </div>
  );

  if (done) return (
    <div className="bg-green-50 border border-green-200 p-4 text-sm text-green-800">
      ✓ Thank you for your review!
    </div>
  );

  const submit = async () => {
    if (!form.comment) return;
    setLoading(true);
    try {
      await API.post("/reviews", {
        product_id: productId, product_type: "physical",
        rating: form.rating, title: form.title, comment: form.comment
      });
      setDone(true);
      onSubmit();
    } finally { setLoading(false); }
  };

  return (
    <div className="border border-stone-200 bg-white p-5">
      <h4 className="font-bold text-stone-800 mb-4">
        Write a customer review
      </h4>
      <div className="mb-3">
        <p className="text-xs text-stone-500 mb-1">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setForm(f => ({ ...f, rating: i }))}
              className={`text-2xl transition ${i <= form.rating ? "text-amber-500" : "text-stone-300 hover:text-amber-300"}`}>
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-stone-500 mb-1 block">Review title</label>
        <input value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Summarise your experience"
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-amber-400 rounded-sm" />
      </div>
      <div className="mb-4">
        <label className="text-xs text-stone-500 mb-1 block">Your review</label>
        <textarea value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          rows={4}
          placeholder="What did you like or dislike? How was the quality?"
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-amber-400 rounded-sm" />
      </div>
      <button onClick={submit} disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 text-sm
                   font-semibold transition disabled:opacity-50 rounded-sm">
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { convert } = useCurrency();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const load = useCallback(async () => {
    const r = await API.get(`/products/${id}`);
    setProduct(r.data);
    if (r.data.sizes?.length) setSelectedSize(r.data.sizes[0]);
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [load]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f3ef" }}>
      <div className="text-stone-400">Loading...</div>
    </div>
  );

  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const finalPrice = product.discount_price || product.price;
  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const related = Array.isArray(product.related) ? product.related : [];

  const handleAddToCart = () => {
    if (sizes.length && !selectedSize) return;
    addToCart({ ...product, type: "physical", selectedSize, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(v => v.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(v => v.rating === r).length / reviews.length * 100) : 0
  }));

  return (
    <div className="min-h-screen" style={{ background: "#f7f3ef" }}>
      <SEO 
        title={product.name} 
        description={product.description.substring(0, 160)} 
        keywords={`${product.category_name || "laser engraving"}, dynamic keepsakes, organic wood carvings, custom gift`} 
        ogImage={product.image_url}
        imageAlt={product.image_alt || product.name}
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main product section */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Images ── */}
          <div className="lg:w-1/2 flex gap-3">
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 w-16 flex-shrink-0">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`border-2 overflow-hidden transition
                      ${selectedImg === i ? "border-amber-500" : "border-stone-200 hover:border-stone-400"}`}>
                    <img src={img} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 bg-white border border-stone-200 overflow-hidden">
              {allImages.length > 0
                ? <img src={allImages[selectedImg]} alt={product.name}
                  className="w-full aspect-square object-cover" />
                : <div className="w-full aspect-square flex items-center justify-center bg-stone-100">
                  <span className="text-8xl">🪵</span>
                </div>}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map(t => (
                  <span key={t}
                    className={`text-xs font-bold px-2 py-0.5 uppercase tracking-wider
                      ${t === "Best Seller" ? "bg-amber-500 text-white"
                        : t === "New Arrival" ? "bg-emerald-600 text-white"
                          : "bg-stone-800 text-white"}`}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm text-amber-700 hover:underline cursor-pointer">
                {product.rating} out of 5 ({product.review_count || 0} reviews)
              </span>
            </div>

            <div className="border-t border-stone-200 pt-4">
              {product.discount_price ? (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-stone-900">{convert(finalPrice)}</span>
                    <span className="text-base text-stone-400 line-through">M.R.P: {convert(product.price)}</span>
                    <span className="text-sm font-bold text-red-600">({discount}% off)</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">Inclusive of all taxes</p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold text-stone-900">{convert(product.price)}</span>
                  <p className="text-xs text-stone-500 mt-0.5">Inclusive of all taxes</p>
                </div>
              )}
            </div>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-stone-700 mb-2">
                  Size: <span className="text-amber-700">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-sm border-2 transition font-medium
                        ${selectedSize === s
                          ? "border-amber-500 bg-amber-50 text-amber-800"
                          : "border-stone-300 text-stone-700 hover:border-stone-500"}`}
                      style={{ borderRadius: "2px" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-stone-300">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 text-lg leading-none">
                    −
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold min-w-8 text-center">
                    {qty}
                  </span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 text-lg leading-none">
                    +
                  </button>
                </div>
                <p className={`text-sm ${product.stock <= 5 ? "text-red-600 font-semibold" : "text-green-700"}`}>
                  {product.stock === 0 ? "Out of stock"
                    : product.stock <= 5 ? `Only ${product.stock} left in stock!`
                      : "In stock"}
                </p>
              </div>
            </div>

            {sizes.length > 0 && !selectedSize && (
              <p className="text-xs text-red-500">Please select a size</p>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-1">
              <button onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 font-bold text-sm tracking-wide transition
                  ${added ? "bg-green-700 text-white"
                    : product.stock === 0 ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600 text-white"}`}
                style={{ borderRadius: "2px" }}>
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button
                className="w-full py-3 font-bold text-sm tracking-wide bg-stone-800
                           hover:bg-stone-900 text-white transition"
                style={{ borderRadius: "2px" }}
                onClick={() => { handleAddToCart(); window.location.href = "/checkout"; }}>
                Buy Now
              </button>
            </div>

            {/* Perks */}
            <div className="border border-stone-200 bg-white p-3 flex flex-col gap-2">
              {[
                ["🚚", "Free delivery above ₹999"],
                ["🔄", "7-day easy returns"],
                ["🔒", "Secure payment via Razorpay"],
                ["✏️", "100% custom engraving"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-xs text-stone-600">
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic High-Attention Brand Banner Ad Panel */}
        <div className="mt-10">
          <AdBanner placement="Large Panel" />
        </div>

        {/* ── Description ── */}
        <div className="mt-10 border-t border-stone-200 pt-8">
          <h2 className="text-xl font-bold text-stone-800 mb-4">
            Product description
          </h2>
          <p className="text-stone-600 leading-relaxed whitespace-pre-wrap text-sm">
            {product.description}
          </p>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-10 border-t border-stone-200 pt-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6">
            Customer Reviews
          </h2>

          {reviews.length > 0 && (
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Overall rating */}
              <div className="flex flex-col items-center justify-center w-40 flex-shrink-0">
                <p className="text-6xl font-bold text-stone-900">
                  {Number(product.rating).toFixed(1)}
                </p>
                <Stars rating={product.rating} />
                <p className="text-xs text-stone-500 mt-1">{reviews.length} reviews</p>
              </div>
              {/* Breakdown */}
              <div className="flex-1 flex flex-col gap-1.5">
                {ratingCounts.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-amber-700 w-12 text-right">{star} star</span>
                    <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-stone-500 w-8">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review list */}
          <div className="flex flex-col gap-4 mb-8">
            {reviews.map(r => (
              <div key={r.id} className="border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center
                                  justify-center text-amber-700 font-bold text-sm">
                    {r.member_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700">{r.member_name}</p>
                    <Stars rating={r.rating} size="sm" />
                  </div>
                  <p className="text-xs text-stone-400 ml-auto">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {r.title && <p className="text-sm font-semibold text-stone-800 mb-1">{r.title}</p>}
                <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-stone-400">No reviews yet. Be the first to review!</p>
            )}
          </div>

          <ReviewForm productId={product.id} onSubmit={load} />
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-10 border-t border-stone-200 pt-8">
            <h2 className="text-xl font-bold text-stone-800 mb-6">
              Customers also viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map(r => {
                const img = Array.isArray(r.images) ? r.images[0] : null;
                const price = r.discount_price || r.price;
                return (
                  <Link key={r.id} to={`/products/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="group bg-white border border-stone-200 hover:shadow-md
                               transition text-center overflow-hidden">
                    <div className="aspect-square bg-stone-100 overflow-hidden">
                      {img
                        ? <img src={img} alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition" />
                        : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">🪵</span>
                        </div>}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-stone-700 line-clamp-2 leading-snug
                                     group-hover:text-amber-800 transition">{r.name}</p>
                      <p className="text-sm font-bold text-stone-900 mt-1">{convert(price)}</p>
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