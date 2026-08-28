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
import RecentlyViewed, { trackRecentlyViewed } from "../components/RecentlyViewed";
import ReviewSection from "../components/ReviewSection";
import { trackGA4Event } from "../utils/ga4";

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
  const [form, setForm] = useState({ rating: 5, review_text: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!member) return (
    <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 rounded-lg">
      <Link to="/login" className="underline font-bold text-amber-900">Login to leave a review</Link>
    </div>
  );

  if (done) return (
    <div className="bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 rounded-lg">
      ✓ Thank you for your review! It will appear once approved by admin.
    </div>
  );

  const submit = async () => {
    setLoading(true);
    try {
      await API.post("/reviews", {
        product_id: productId,
        rating: form.rating,
        review_text: form.review_text
      });
      setDone(true);
      if (onSubmit) onSubmit();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit review");
    } finally { setLoading(false); }
  };

  return (
    <div className="border border-stone-200 bg-white p-5 rounded-xl space-y-4">
      <h4 className="font-bold text-stone-800 text-sm">
        Write a customer review
      </h4>

      <div>
        <p className="text-xs font-bold text-stone-600 mb-1">Your Rating *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => setForm(f => ({ ...f, rating: star }))}
              className={`w-11 h-11 flex items-center justify-center text-2xl transition cursor-pointer ${
                star <= form.rating ? "text-amber-500" : "text-stone-300 hover:text-amber-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-stone-600 mb-1 block">Your Review (Optional)</label>
        <textarea
          value={form.review_text}
          onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
          rows={3}
          placeholder="What did you like or dislike? How was the quality?"
          className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg resize-none"
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold transition disabled:opacity-50 rounded-lg shadow-sm"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { id } = useParams();
  const { convert } = useCurrency();
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  // Personalization Module States
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [customValues, setCustomValues] = useState({});
  const [customErrors, setCustomErrors] = useState({});
  const [uploadingField, setUploadingField] = useState(null);

  const load = useCallback(async () => {
    const r = await API.get(`/products/${id}`);
    setProduct(r.data);
    if (r.data?.id) {
      trackRecentlyViewed(r.data.id);
      trackGA4Event("view_item", {
        currency: "INR",
        value: r.data.price,
        items: [{ item_id: r.data.id, item_name: r.data.name }]
      });
    }
    if (r.data.sizes?.length) setSelectedSize(r.data.sizes[0]);
    
    // Check if item is in wishlist
    try {
      const wRes = await API.get("/wishlist/my");
      if (Array.isArray(wRes.data)) {
        const idStr = String(id);
        const pUidStr = String(r.data.product_uid || r.data.id || "");
        const exists = wRes.data.some(w => String(w) === idStr || String(w) === pUidStr);
        setIsWishlisted(exists);
      }
    } catch {
      // Guest user
    }

    // Initialize default values for customizable fields
    if (r.data.enable_personalization && r.data.templates?.length) {
      const defaultValues = {};
      r.data.templates[0].fields?.forEach(f => {
        defaultValues[f.field_key] = f.default_value || "";
      });
      setCustomValues(defaultValues);
    }
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [load]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Custom Engravings | Oliveseeds Studio`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${product.name} at Oliveseeds Studio. ${product.description || ""}`);
      }

      // Inject JSON-LD Structured Data
      let script = document.getElementById("jsonld-product");
      if (!script) {
        script = document.createElement("script");
        script.id = "jsonld-product";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      
      const siteUrl = (process.env.SITE_URL || process.env.REACT_APP_SITE_URL || "https://oliveseedsdesignstudio.com").replace(/\/$/, "");
      const productImgUrl = product.image_url ? (product.image_url.startsWith("http") ? product.image_url : `${siteUrl}${product.image_url}`) : `${siteUrl}/logo192.png`;

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Custom printed ${product.name} by Olive Seeds Studio`,
        "image": [productImgUrl],
        "sku": product.product_uid || `PROD-${product.id}`,
        "brand": {
          "@type": "Brand",
          "name": "Olive Seeds Studio"
        },
        "offers": {
          "@type": "Offer",
          "url": `${siteUrl}/product/${product.id}`,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Olive Seeds Studio"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": ["AU","CA","FR","DE","IN","KW","MY","NL","NZ","NO","QA","SA","SG","CH","AE","GB","US"]
            }
          }
        }
      };

      if (reviews && reviews.length > 0) {
        const avgRating = (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1);
        structuredData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": String(avgRating),
          "reviewCount": String(reviews.length)
        };
      }
      
      script.innerHTML = JSON.stringify(structuredData);
    }

    return () => {
      const script = document.getElementById("jsonld-product");
      if (script) script.remove();
    };
  }, [product, id]);

  const handleTemplateChange = (idx) => {
    setSelectedTemplateIdx(idx);
    const template = product.templates[idx];
    const newValues = {};
    template.fields?.forEach(f => {
      newValues[f.field_key] = customValues[f.field_key] || f.default_value || "";
    });
    setCustomValues(newValues);
    setCustomErrors({});
  };

  const handleFieldChange = (field, value) => {
    setCustomValues(prev => ({ ...prev, [field.field_key]: value }));
    
    // Validate character length & required
    let err = "";
    if (field.is_required && !value) {
      err = `${field.label} is required`;
    } else if (field.min_chars && value.length < field.min_chars) {
      err = `Min ${field.min_chars} characters required`;
    } else if (field.max_chars && value.length > field.max_chars) {
      err = `Max ${field.max_chars} characters exceeded`;
    }
    
    setCustomErrors(prev => ({ ...prev, [field.field_key]: err }));
  };

  const handleFieldFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit files to under 25 MB
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = "File is too large. Maximum size allowed is 25MB.";
      setCustomErrors(prev => ({ ...prev, [field.field_key]: errorMsg }));
      alert(errorMsg);
      return;
    }

    setUploadingField(field.field_key);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCustomValues(prev => ({ ...prev, [field.field_key]: res.data.url }));
      setCustomErrors(prev => ({ ...prev, [field.field_key]: "" }));
    } catch (err) {
      setCustomErrors(prev => ({ ...prev, [field.field_key]: "Upload failed. Try again." }));
    } finally {
      setUploadingField(null);
    }
  };

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

    // Customization fields validation
    const hasTemplates = product.enable_personalization && product.templates && product.templates.length > 0;
    const currentTemplate = hasTemplates ? product.templates[selectedTemplateIdx] : null;

    let errors = {};
    if (hasTemplates && currentTemplate.fields) {
      for (const f of currentTemplate.fields) {
        const val = customValues[f.field_key] || "";
        if (f.is_required && !val) {
          errors[f.field_key] = `${f.label} is required`;
        }
        if (f.min_chars && val.length < f.min_chars) {
          errors[f.field_key] = `${f.label} must be at least ${f.min_chars} characters`;
        }
        if (f.max_chars && val.length > f.max_chars) {
          errors[f.field_key] = `${f.label} cannot exceed ${f.max_chars} characters`;
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setCustomErrors(errors);
      alert("Please resolve customization errors before adding to cart");
      return;
    }
    
    const itemCustomizations = hasTemplates ? currentTemplate.fields.map(f => ({
      template_id: currentTemplate.id,
      template_name: currentTemplate.name,
      field_key: f.field_key,
      field_label: f.label,
      field_value: customValues[f.field_key] || f.default_value || "",
      field_type: f.type
    })) : [];

    addToCart({ 
      ...product, 
      type: "physical", 
      selectedSize, 
      qty,
      customizations: itemCustomizations,
      customizationSummary: itemCustomizations.map(c => `${c.field_label}: ${c.field_value}`).join(", ")
    });
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
        description={product.description ? product.description.substring(0, 160) : ""} 
        keywords={`${product.category_name || "laser engraving"}, dynamic keepsakes, organic wood carvings, custom gift`} 
        ogImage={product.image_url}
        imageAlt={product.image_alt || product.name}
        isProduct={true}
        productData={product}
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main product section */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Images ── */}
          <div className="lg:w-1/2 flex flex-col-reverse sm:flex-row gap-3">
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-16 flex-shrink-0 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`border-2 overflow-hidden transition
                      ${selectedImg === i ? "border-amber-500" : "border-stone-200 hover:border-stone-400"}`}>
                    <img src={img} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image / Live Preview */}
            <div 
              style={{ containerType: "inline-size" }}
              className="flex-1 bg-white border border-stone-200 overflow-hidden relative"
            >
              {product.enable_personalization && product.templates?.length > 0 ? (
                (() => {
                  const t = product.templates[selectedTemplateIdx] || product.templates[0];
                  return (
                    <div 
                      className="relative w-full aspect-square bg-cover bg-center" 
                      style={{ 
                        backgroundImage: t.background_image ? `url(${t.background_image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <img src={t.preview_image} alt="" className="w-full h-full object-cover absolute inset-0 z-0" />
                      
                      {/* Overlay Text/Image Details */}
                      {t.fields?.map(f => {
                        if (f.x_pos === null || f.y_pos === null) return null;
                        
                        if (["text", "textarea", "number", "date"].includes(f.type)) {
                          const text = customValues[f.field_key] || f.default_value || "";
                          const style = {
                            position: "absolute",
                            left: `${(f.x_pos / 500) * 100}%`,
                            top: `${(f.y_pos / 500) * 100}%`,
                            fontFamily: f.font_family || "sans-serif",
                            fontSize: f.font_size ? `${(f.font_size / 500) * 100}cqw` : "3.5cqw",
                            color: f.font_color || "#000",
                            textAlign: f.text_align || "center",
                            maxWidth: f.max_width ? `${(f.max_width / 500) * 100}%` : "90%",
                            transform: `translate(-50%, -50%) rotate(${f.rotation || 0}deg)`,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: "1.2",
                            pointerEvents: "none",
                            zIndex: 10
                          };
                          return (
                            <div key={f.id} style={style}>
                              {text || f.placeholder || ""}
                            </div>
                          );
                        }

                        if (["image", "file"].includes(f.type)) {
                          const imgUrl = customValues[f.field_key] || f.default_value || "";
                          if (!imgUrl) return null;
                          const resolvedSrc = imgUrl.startsWith("http") ? imgUrl : `http://localhost:5000${imgUrl}`;
                          const style = {
                            position: "absolute",
                            left: `${(f.x_pos / 500) * 100}%`,
                            top: `${(f.y_pos / 500) * 100}%`,
                            width: f.max_width ? `${(f.max_width / 500) * 100}%` : "25%",
                            height: "auto",
                            transform: `translate(-50%, -50%) rotate(${f.rotation || 0}deg)`,
                            pointerEvents: "none",
                            zIndex: 10,
                            borderRadius: "4px",
                            border: "1px dashed rgba(217, 119, 6, 0.4)"
                          };
                          return (
                            <img key={f.id} src={resolvedSrc} alt="" style={style} />
                          );
                        }

                        return null;
                      })}
                    </div>
                  );
                })()
              ) : allImages.length > 0 ? (
                <img src={allImages[selectedImg]} alt={product.name}
                  className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-stone-100">
                  <span className="text-8xl">🪵</span>
                </div>
              )}
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

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
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
                      await API.post("/wishlist/add", { product_uid: targetUid, product_type: "physical" });
                      setIsWishlisted(true);
                    }
                  } catch (err) {
                    console.error("Wishlist update failed", err);
                  }
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                aria-label="Wishlist"
                className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-xl shadow-sm hover:scale-105 transition shrink-0 cursor-pointer"
                style={{ color: isWishlisted ? "#e11d48" : "#64748b" }}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            {/* FEATURE 7: Social Share Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1 pb-1">
              <span className="text-xs text-stone-500 font-bold w-full sm:w-auto">Share this product:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center text-xs font-bold bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center text-xs font-bold bg-black text-white rounded-xl hover:opacity-90 transition"
              >
                Twitter/X
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.image_url || "")}&description=${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center text-xs font-bold bg-[#BD081C] text-white rounded-xl hover:opacity-90 transition"
              >
                Pinterest
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Copied!");
                }}
                className="min-h-[44px] px-3.5 py-2 inline-flex items-center justify-center text-xs font-bold bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition"
              >
                Copy Link
              </button>
            </div>

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
                </div>
              ) : (
                <span className="text-3xl font-bold text-stone-900">{convert(product.price)}</span>
              )}

              {/* FEATURE 6: Live Stock Counter */}
              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-xs font-bold text-orange-600 mt-2">
                  Only {product.stock} left in stock!
                </p>
              )}
              {product.stock === 0 && (
                <p className="text-xs font-bold text-red-600 mt-2">
                  Out of Stock
                </p>
              )}
              <p className="text-xs text-stone-500 mt-0.5">Inclusive of all taxes</p>
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

            {/* Personalization Section */}
            {product.enable_personalization && product.templates?.length > 0 && (
              <div className="border border-stone-200 bg-white p-4 flex flex-col gap-4 mb-2" style={{ borderRadius: "2px" }}>
                <div>
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider block">✏️ Custom Engraving Details</span>
                  <h3 className="text-lg font-bold text-stone-850">Customize Your Product</h3>
                </div>

                {/* Template selector */}
                {product.allow_multiple_templates && product.templates.length > 1 && (
                  <div>
                    <span className="text-xs font-bold text-stone-600 block mb-2">Select Design Template:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {product.templates.map((t, idx) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTemplateChange(idx)}
                          className={`flex flex-col items-center p-2 border-2 transition rounded-sm
                            ${selectedTemplateIdx === idx
                              ? "border-amber-500 bg-amber-50 text-amber-800"
                              : "border-stone-200 text-stone-600 hover:border-stone-300"}`}
                        >
                          <img src={t.preview_image} alt="" className="w-12 h-12 object-cover rounded-sm mb-1 bg-stone-100" />
                          <span className="text-[10px] font-bold text-center truncate w-full">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="flex flex-col gap-3.5 mt-1">
                  {(product.templates[selectedTemplateIdx] || product.templates[0]).fields?.map(f => {
                    const value = customValues[f.field_key] || "";
                    const error = customErrors[f.field_key] || "";
                    const charCount = value.length;

                    return (
                      <div key={f.id} className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                          <span>
                            {f.label} {f.is_required && <span className="text-red-500">*</span>}
                          </span>
                          {["text", "textarea"].includes(f.type) && f.max_chars && (
                            <span className="text-[10px] text-stone-400 font-medium">
                              {charCount}/{f.max_chars}
                            </span>
                          )}
                        </label>

                        {/* Rendering input fields based on type */}
                        {f.type === "text" && (
                          <input
                            type="text"
                            maxLength={f.max_chars || undefined}
                            placeholder={f.placeholder}
                            value={value}
                            onChange={e => handleFieldChange(f, e.target.value)}
                            className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm"
                          />
                        )}

                        {f.type === "textarea" && (
                          <textarea
                            rows={3}
                            maxLength={f.max_chars || undefined}
                            placeholder={f.placeholder}
                            value={value}
                            onChange={e => handleFieldChange(f, e.target.value)}
                            className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm resize-none"
                          />
                        )}

                        {f.type === "number" && (
                          <input
                            type="number"
                            placeholder={f.placeholder}
                            value={value}
                            onChange={e => handleFieldChange(f, e.target.value)}
                            className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm"
                          />
                        )}

                        {f.type === "date" && (
                          <input
                            type="date"
                            value={value}
                            onChange={e => handleFieldChange(f, e.target.value)}
                            className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm"
                          />
                        )}

                        {f.type === "dropdown" && (
                          <select
                            value={value}
                            onChange={e => handleFieldChange(f, e.target.value)}
                            className="w-full border border-stone-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm bg-white"
                          >
                            <option value="">-- Choose Option --</option>
                            {f.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {f.type === "radio" && (
                          <div className="flex flex-col gap-1.5 mt-0.5">
                            {f.options?.map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`field_${f.id}`}
                                  value={opt}
                                  checked={value === opt}
                                  onChange={e => handleFieldChange(f, e.target.value)}
                                  className="text-amber-500 focus:ring-amber-400"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}

                        {f.type === "checkbox" && (
                          <div className="flex flex-col gap-1.5 mt-0.5">
                            {f.options?.map(opt => {
                              const arr = Array.isArray(value) ? value : (value ? value.split(", ") : []);
                              const checked = arr.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={opt}
                                    checked={checked}
                                    onChange={e => {
                                      const next = checked ? arr.filter(x => x !== opt) : [...arr, opt];
                                      handleFieldChange(f, next.join(", "));
                                    }}
                                    className="text-amber-500 focus:ring-amber-400 rounded-sm"
                                  />
                                  {opt}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {["image", "file"].includes(f.type) && (
                          <div className="flex flex-col gap-2 mt-0.5">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={value}
                                placeholder={f.placeholder || "No file uploaded"}
                                className="flex-1 border border-stone-300 px-3 py-2 text-xs bg-stone-50 rounded-sm focus:outline-none"
                              />
                              <label className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-sm cursor-pointer transition flex items-center justify-center shadow-sm whitespace-nowrap">
                                {uploadingField === f.field_key ? "Uploading..." : "Upload File"}
                                <input
                                  type="file"
                                  disabled={uploadingField !== null}
                                  accept={f.type === "image" ? "image/*" : "*/*"}
                                  className="hidden"
                                  onChange={e => handleFieldFileUpload(e, f)}
                                />
                              </label>
                            </div>
                            {f.type === "image" && value && (
                              <img src={`http://localhost:5000${value}`} alt="" className="w-16 h-16 object-cover rounded border bg-stone-50" />
                            )}
                          </div>
                        )}

                        {f.help_text && <p className="text-[10px] text-stone-400 italic mt-0.5">{f.help_text}</p>}
                        {error && <p className="text-[10px] text-red-500 font-bold mt-0.5">{error}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-4">
              <button onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 font-bold text-xs uppercase tracking-widest transition-all shadow-md rounded-full cursor-pointer
                  ${added ? "bg-emerald-700 text-white"
                    : product.stock === 0 ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button
                className="w-full py-4 font-bold text-xs uppercase tracking-widest bg-stone-950 hover:bg-stone-900 text-white transition-all shadow-lg rounded-full cursor-pointer"
                style={{ fontFamily: "'Outfit', sans-serif" }}
                onClick={() => { handleAddToCart(); window.location.href = "/checkout"; }}>
                Buy Now — Secure Checkout
              </button>
            </div>

            {/* Payment Integration UI */}
            <div className="border border-stone-200/60 bg-white p-5 flex flex-col gap-3.5 rounded-2xl shadow-sm mt-3">
              <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-widest block" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.12em" }}>🔒 SECURE CHECKOUT OPTIONS</span>
              <p className="text-[11.5px] text-stone-500 leading-normal">Select payment partner to complete transaction securely:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => alert("Razorpay checkout selected. You can proceed with Card/UPI/NetBanking at checkout.")}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-stone-200 rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition cursor-pointer text-xs font-bold text-stone-700"
                >
                  💳 Razorpay
                </button>
                <button
                  type="button"
                  onClick={() => alert("PayPal checkout selected. You can proceed with International cards/PayPal at checkout.")}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-stone-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition cursor-pointer text-xs font-bold text-stone-700"
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            {/* Perks */}
            <div className="border border-stone-200/60 bg-white p-5 flex flex-col gap-3 rounded-2xl shadow-sm mt-1">
              {[
                ["🚚", "Free delivery above ₹999"],
                ["🔄", "7-day easy returns policy"],
                ["🔒", "Secure payment via Razorpay / PayPal"],
                ["✏️", "100% custom micron laser engraving"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-2.5 text-xs text-stone-600">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map(r => {
                const img = Array.isArray(r.images) ? r.images[0] : null;
                const price = r.discount_price || r.price;
                const discount = r.discount_price ? Math.round((1 - r.discount_price / r.price) * 100) : 0;
                return (
                  <Link key={r.id} to={`/products/${r.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    className="group bg-white border border-stone-200 hover:shadow-md transition overflow-hidden rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="aspect-square bg-stone-50 overflow-hidden rounded-[4px] mb-2 flex items-center justify-center">
                        {img
                          ? <img src={img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          : <span className="text-3xl">🪵</span>}
                      </div>
                      <p className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2 leading-snug mb-1 font-medium">
                        {r.name}
                      </p>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-amber-500">
                          {"★".repeat(Math.round(r.rating || 5)) + "☆".repeat(5 - Math.round(r.rating || 5))}
                        </span>
                        <span className="text-[10px] text-[#007185]">{r.review_count || 12}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-stone-900">{convert(price)}</span>
                        {r.discount_price && (
                          <>
                            <span className="text-[10px] text-stone-400 line-through">{convert(r.price)}</span>
                            <span className="text-[10px] font-bold text-green-700">({discount}% off)</span>
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

        {/* FEATURE 4: Recently Viewed Products */}
        <RecentlyViewed currentProductId={product.id} />

        {/* Customer Reviews */}
        <ReviewSection productId={product.id} />
      </div>
      <Footer />
    </div>
  );
}