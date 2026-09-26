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
import { getAllProductImages, resolveImageUrl } from "../utils/imageHelper";
import { 
  MdLocalShipping, MdFavorite, MdFavoriteBorder, MdStar, MdStarBorder
} from "react-icons/md";

function Stars({ rating, size = "md" }) {
  const sz = size === "sm" ? "text-xs" : "text-base";
  return (
    <div className="flex items-center text-[#A48855]">
      {[1, 2, 3, 4, 5].map(i => (
        i <= Math.round(rating) 
          ? <MdStar key={i} className={sz} /> 
          : <MdStarBorder key={i} className={`${sz} text-stone-300`} />
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
      ✓ Thank you for your review. It will appear once approved by the studio.
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
    <div className="border border-[#E7E7E2] bg-white p-5 rounded-[4px] space-y-4">
      <h4 className="font-bold text-[#181A18] text-sm">
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
                star <= form.rating ? "text-[#A48855]" : "text-stone-300 hover:text-[#A48855]"
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
          className="w-full border border-[#DADCD7] px-3 py-2 text-xs focus:outline-none focus:border-[#23483D] rounded-[4px] resize-none"
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-[#23483D] hover:bg-[#16352D] text-white px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition disabled:opacity-50 rounded-[4px]"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

// Step 6: Product Shipping Estimate Component
function ProductShippingEstimate({ productId }) {
  const { convert, selected } = useCurrency();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem("preferred_shipping_country") || "IN";
  });
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/shipping-countries/enabled")
      .then((res) => {
        setCountries(res.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    API.get(`/shipping-rates/product-weights/${productId}`)
      .then((wRes) => {
        const weight = wRes.data?.weight_grams || 500;
        return API.get(
          `/shipping-rates/country/${selectedCountry}?weight_grams=${weight}&currency_code=${selected.currency_code || "INR"}`
        );
      })
      .then((res) => {
        setShippingData(res.data);
      })
      .catch((err) => console.error("Error fetching product shipping estimate:", err))
      .finally(() => setLoading(false));
  }, [productId, selectedCountry, selected.currency_code]);

  const handleCountryChange = (code) => {
    setSelectedCountry(code);
    localStorage.setItem("preferred_shipping_country", code);
  };

  const freeShippingThreshold = shippingData?.methods?.find((m) => m.free_shipping_above)?.free_shipping_above;

  return (
    <div className="border border-stone-200/80 bg-stone-50/60 p-4 rounded-2xl flex flex-col gap-2.5 mt-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-stone-900 flex items-center gap-1.5 text-[13px]">
          <MdLocalShipping className="text-base text-[#23483D]" /> Shipping Estimate
        </span>
        {shippingData?.zone && (
          <span className="text-[10px] text-stone-500 font-semibold bg-white border px-2 py-0.5 rounded-full">
            {shippingData.zone}
          </span>
        )}
      </div>

      <div>
        <label className="text-[11px] text-stone-500 font-medium block mb-1">Select your country:</label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500"
        >
          {countries.length > 0 ? (
            countries.map((c) => (
              <option key={c.country_code} value={c.country_code}>
                {c.country_name} ({c.country_code})
              </option>
            ))
          ) : (
            <option value="IN">India (IN)</option>
          )}
        </select>
      </div>

      {loading ? (
        <div className="py-2.5 text-center text-[11px] text-stone-400 font-medium">
          Loading shipping rates...
        </div>
      ) : shippingData?.methods && shippingData.methods.length > 0 ? (
        <div className="flex flex-col gap-1.5 pt-1">
          {shippingData.methods.map((m) => (
            <div key={m.method_id} className="flex items-center justify-between py-1 border-b border-stone-200/50 last:border-b-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-800">{m.method_name}:</span>
                <span className="text-[10px] text-stone-400">({m.estimated_days})</span>
              </div>
              <span className="font-bold font-mono text-stone-900">
                {convert(m.shipping_cost_inr)}
              </span>
            </div>
          ))}

          {freeShippingThreshold && (
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1 flex items-center gap-1">
              <span>✅</span> Free shipping on orders above {convert(freeShippingThreshold)}
            </div>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-stone-500 italic py-1">
          Shipping not available for this country.
        </p>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { id } = useParams();
  const { convert, selected } = useCurrency();
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Discover "${product?.name || 'Bespoke Piece'}" from Olive Seeds Design Studio:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

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

    // Fetch recommended related products
    try {
      const relRes = await API.get(`/products/${id}/related`);
      if (Array.isArray(relRes.data) && relRes.data.length > 0) {
        setRelatedProducts(relRes.data);
      } else if (Array.isArray(r.data?.related) && r.data.related.length > 0) {
        setRelatedProducts(r.data.related);
      }
    } catch {
      if (Array.isArray(r.data?.related)) {
        setRelatedProducts(r.data.related);
      }
    }
    
    // Check if item is in wishlist
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
        // Guest user
      }
    } else {
      setIsWishlisted(false);
    }

    // Initialize default values for customizable fields
    if (r.data.enable_personalization && r.data.templates?.length) {
      const defaultValues = {};
      r.data.templates[0].fields?.forEach(f => {
        defaultValues[f.field_key] = f.default_value || "";
      });
      setCustomValues(defaultValues);
    }
  }, [id, member]);

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [load]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Olive Seeds Design Studio`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", `${product.name} — bespoke design piece by Olive Seeds Design Studio. ${product.description || ""}`);
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFFFF" }}>
      <div className="text-stone-400">Loading...</div>
    </div>
  );

  const allImages = getAllProductImages(product);

  const finalPrice = (product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price))
    ? Number(product.discount_price)
    : Number(product.price);
  const discount = (product.discount_price && Number(product.discount_price) < Number(product.price))
    ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100) : 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const related = Array.isArray(product.related) ? product.related : [];

  const handleAddToCart = () => {
    if (sizes.length && !selectedSize) {
      alert("Please select a size first");
      return false;
    }

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
      return false;
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
      price: finalPrice,
      original_price: Number(product.price),
      discount_price: product.discount_price ? Number(product.discount_price) : null,
      selectedSize, 
      qty,
      customizations: itemCustomizations,
      customizationSummary: itemCustomizations.map(c => `${c.field_label}: ${c.field_value}`).join(", ")
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    return true;
  };

  const handleDirectCheckout = (gateway = "paypal") => {
    if (product.stock === 0) return;
    const ok = handleAddToCart();
    if (ok) {
      navigate(`/checkout?method=${gateway}`);
    }
  };

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(v => v.rating === r).length,
    pct: reviews.length ? Math.round(reviews.filter(v => v.rating === r).length / reviews.length * 100) : 0
  }));

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO 
        title={product.name} 
        description={product.description ? product.description.substring(0, 160) : ""} 
        keywords={`${product.category_name || "bespoke objects"}, dynamic keepsakes, architectural finish, bespoke commissions`} 
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
                    className={`border overflow-hidden transition rounded-[4px]
                      ${selectedImg === i ? "border-[#23483D]" : "border-[#E7E7E2] hover:border-stone-400"}`}>
                    <img src={img} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image / Live Preview */}
            <div 
              style={{ containerType: "inline-size" }}
              className="flex-1 bg-white border border-[#E7E7E2] rounded-[4px] overflow-hidden relative"
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
                          const resolvedSrc = resolveImageUrl(imgUrl);
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
                <div className="w-full aspect-square flex flex-col items-center justify-center bg-[#FAF6EE] text-[#23483D]">
                  <div className="w-20 h-20 rounded-full border border-[#A48855]/40 flex flex-col items-center justify-center bg-white shadow-2xs mb-2">
                    <span className="font-serif text-2xl font-bold tracking-widest text-[#A48855]">OS</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#6B7C75]">Atelier</span>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#6B7C75]">Architectural Piece</span>
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
              <h1 className="text-2xl lg:text-3xl font-normal text-[#181A18] leading-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
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
                className="w-10 h-10 rounded-full border border-[#E7E7E2] bg-white flex items-center justify-center text-lg shadow-none hover:border-[#23483D] transition shrink-0 cursor-pointer"
              >
                {isWishlisted ? <MdFavorite className="text-rose-600 text-lg" /> : <MdFavoriteBorder className="text-stone-400 text-lg" />}
              </button>
            </div>

            {/* Quiet Luxury Studio Share Row */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#8A8D88] font-semibold">Share Piece:</span>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium bg-[#FAF6EE] border border-[#EAE4D6] text-[#23483D] rounded-[4px] hover:border-[#23483D] transition cursor-pointer"
                title="Share via WhatsApp"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-[#EAE4D6] text-[#181A18] rounded-[4px] hover:bg-[#FAF6EE] transition cursor-pointer"
                title="Copy piece link"
              >
                <span>{copiedLink ? "✓ Link Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm text-[#23483D] hover:underline cursor-pointer">
                {product.rating} out of 5 ({product.review_count || 0} reviews)
              </span>
            </div>

            <div className="border-t border-[#E7E7E2] pt-4">
              {product.discount_price ? (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-light text-[#181A18]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{convert(finalPrice)}</span>
                    <span className="text-base text-stone-400 line-through">M.R.P: {convert(product.price)}</span>
                    <span className="text-sm font-bold text-red-600">({discount}% off)</span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-light text-[#181A18]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{convert(product.price)}</span>
              )}

              {/* FEATURE 6: Live Stock Counter */}
              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-xs font-bold text-orange-600 mt-2">
                  Only {product.stock} pieces remaining in studio stock.
                </p>
              )}
              {product.stock === 0 && (
                <p className="text-xs font-bold text-red-600 mt-2">
                  Out of Stock
                </p>
              )}
              <p className="text-xs text-stone-500 mt-0.5">Inclusive of all taxes</p>
            </div>

            {/* Step 6: Shipping Estimate Section */}
            {product && <ProductShippingEstimate productId={product.id} />}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-stone-700 mb-2">
                  Size: <span className="text-[#23483D]">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-sm border transition font-medium rounded-[4px]
                        ${selectedSize === s
                          ? "border-[#23483D] bg-[#FAF6EE] text-[#23483D]"
                          : "border-[#E7E7E2] text-stone-700 hover:border-stone-400"}`}>
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
                    : product.stock <= 5 ? `Only ${product.stock} pieces remaining in studio stock.`
                      : "In stock"}
                </p>
              </div>
            </div>

            {sizes.length > 0 && !selectedSize && (
              <p className="text-xs text-red-500">Please select a size</p>
            )}

            {/* Personalization Section */}
            {product.enable_personalization && product.templates?.length > 0 && (
              <div className="border border-[#E7E7E2] bg-white p-5 flex flex-col gap-4 mb-2 rounded-[4px]">
                <div>
                  <span className="text-[10px] text-[#23483D] font-bold uppercase tracking-wider block">Customisation Details</span>
                  <h3 className="text-lg font-bold text-[#181A18]">Personalise Your Piece</h3>
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
                          className={`flex flex-col items-center p-2 border transition rounded-[4px]
                            ${selectedTemplateIdx === idx
                              ? "border-[#23483D] bg-[#FAF6EE] text-[#23483D]"
                              : "border-[#E7E7E2] text-stone-600 hover:border-stone-400"}`}
                        >
                          <img src={t.preview_image} alt="" className="w-12 h-12 object-cover rounded-[2px] mb-1 bg-stone-100" />
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
                              <img src={resolveImageUrl(value)} alt="" className="w-16 h-16 object-cover rounded border bg-stone-50" />
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
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 font-semibold text-xs uppercase tracking-widest transition-all rounded-[4px] cursor-pointer
                  ${added ? "bg-emerald-700 text-white"
                    : product.stock === 0 ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-[#23483D] hover:bg-[#16352D] text-white"}`}
              >
                {added ? "✓ Added to Studio Order" : "Acquire Piece — Add to Order"}
              </button>
              <button
                type="button"
                className="w-full py-4 font-semibold text-xs uppercase tracking-widest bg-white border border-[#23483D] text-[#23483D] hover:bg-[#FAF6EE] transition-all rounded-[4px] cursor-pointer"
                onClick={() => handleDirectCheckout("razorpay")}
              >
                Direct Commission — Instant Checkout
              </button>
            </div>

            {/* Quiet Luxury Studio Assurance & White-Glove Guarantee */}
            <div className="border border-[#EAE4D6] bg-[#FAF6EE]/80 p-5 rounded-[4px] mt-2 space-y-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#8A8D88] font-semibold border-b border-[#EAE4D6] pb-2.5">
                <span>Studio Assurance</span>
                <span>Encrypted Direct Commission</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2D312E]">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#A48855] text-sm">✦</span>
                  <div>
                    <strong className="block text-[11px] font-semibold text-[#181A18]">Noble Timber Provenance</strong>
                    <span className="text-[10.5px] text-[#676A65] leading-relaxed">Certified hardwoods with natural grain variation.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#A48855] text-sm">✦</span>
                  <div>
                    <strong className="block text-[11px] font-semibold text-[#181A18]">Insured Doorstep Dispatch</strong>
                    <span className="text-[10.5px] text-[#676A65] leading-relaxed">Multi-layer protective archival packaging.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#A48855] text-sm">✦</span>
                  <div>
                    <strong className="block text-[11px] font-semibold text-[#181A18]">Bespoke Joinery & Precision</strong>
                    <span className="text-[10.5px] text-[#676A65] leading-relaxed">Master artisan hand-finishing & laser detail.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#A48855] text-sm">✦</span>
                  <div>
                    <strong className="block text-[11px] font-semibold text-[#181A18]">7-Day Studio Inspection</strong>
                    <span className="text-[10.5px] text-[#676A65] leading-relaxed">Complete satisfaction guarantee upon delivery.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE4D6] flex items-center justify-between text-[10px] text-[#8A8D88]">
                <span>Secured via Razorpay &amp; PayPal</span>
                <span className="tracking-wider uppercase font-medium">Global Delivery Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Brand Banner Ad Panel */}
        <div className="mt-12 mb-10">
          <AdBanner placement="Large Panel" />
        </div>

        {/* ── PIECE OVERVIEW (Clean Editorial Layout) ── */}
        {product.description && (
          <div className="mt-12 pt-8 border-t border-[#EAE4D6] max-w-4xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-2">
              Piece Overview &amp; Craft
            </span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#181A18] mb-4">
              About this Piece
            </h3>
            <div className="text-sm sm:text-base text-[#3A3E3B] leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        )}

        {/* ── RECOMMENDED (SIMILAR) PRODUCTS SECTION ── */}
        <section className="mt-14 pt-10 border-t border-[#EAE4D6]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A48855] block mb-1">
                Curated Recommendations
              </span>
              <h2 
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#181A18] tracking-tight"
              >
                Similar Pieces &amp; Recommended Works
              </h2>
              <p className="text-xs sm:text-sm text-[#676A65] mt-1">
                Explore complementary bespoke creations crafted with identical architectural precision.
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#23483D] hover:underline whitespace-nowrap self-start sm:self-end"
            >
              View Full Collection →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(relatedProducts.length > 0 ? relatedProducts : related).slice(0, 4).map((p) => {
              const pImg = p.image_url || (p.images && p.images[0]) || "";
              const pFinalPrice = (p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < Number(p.price))
                ? Number(p.discount_price)
                : Number(p.price);
              const pDiscount = (p.discount_price && Number(p.discount_price) < Number(p.price))
                ? Math.round((1 - Number(p.discount_price) / Number(p.price)) * 100)
                : 0;

              return (
                <div
                  key={p.id || p.product_uid}
                  className="group bg-white border border-[#EAE4D6] hover:border-[#23483D] rounded-[2px] overflow-hidden flex flex-col justify-between transition-all duration-200"
                >
                  <Link to={`/products/${p.id}`} className="block relative overflow-hidden" onClick={() => window.scrollTo(0, 0)}>
                    <div className="aspect-[4/5] w-full bg-[#FAF6EE] overflow-hidden relative">
                      {pImg ? (
                        <img
                          src={pImg}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF6EE]">
                          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl text-[#A48855]/50 font-bold">OS</span>
                        </div>
                      )}
                      {pDiscount > 0 && (
                        <span className="absolute top-2 left-2 text-[8.5px] font-bold px-2 py-0.5 rounded-[2px] bg-[#23483D] text-white tracking-[0.1em] uppercase">
                          −{pDiscount}%
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#A48855] font-bold mb-1.5 truncate">
                      {p.category_name || "Bespoke Collection"}
                    </p>
                    <Link to={`/products/${p.id}`} onClick={() => window.scrollTo(0, 0)}>
                      <h4
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        className="text-base sm:text-lg font-medium text-[#181A18] group-hover:text-[#23483D] transition line-clamp-2 min-h-[2.5em] mb-3"
                      >
                        {p.name}
                      </h4>
                    </Link>

                    <div className="mt-auto pt-2.5 border-t border-[#FAF6EE] flex items-baseline justify-between mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg sm:text-xl font-semibold text-[#181A18]">
                          {convert(pFinalPrice)}
                        </span>
                        {p.discount_price && Number(p.discount_price) < Number(p.price) && (
                          <span className="text-[11px] line-through text-[#8A8D88]">
                            {convert(p.price)}
                          </span>
                        )}
                      </div>
                      {p.stock <= 5 && p.stock > 0 && (
                        <span className="text-[8.5px] text-[#A48855] font-bold uppercase tracking-wider">
                          Reserve
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/products/${p.id}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="w-full py-2 text-center text-xs font-semibold text-[#23483D] bg-[#FAF6EE] hover:bg-[#23483D] hover:text-white transition rounded-[2px] uppercase tracking-wider"
                    >
                      Inspect Piece →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* FEATURE 4: Recently Viewed Products */}
        <RecentlyViewed currentProductId={product.id} />
      </div>
      <Footer />
    </div>
  );
}