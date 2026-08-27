import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useCurrency } from "../context/CurrencyContext";

const STORAGE_KEY = "oss_recently_viewed";

export function trackRecentlyViewed(productId) {
  if (!productId) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter((id) => String(id) !== String(productId));
    list.unshift(productId);
    if (list.length > 6) list = list.slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to update recently viewed:", err);
  }
}

export default function RecentlyViewed({ currentProductId = null }) {
  const { convert } = useCurrency();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      let ids = JSON.parse(raw);
      if (currentProductId) {
        ids = ids.filter((id) => String(id) !== String(currentProductId));
      }
      if (!ids.length) return;

      // Fetch active physical products matching recently viewed IDs
      API.get("/products")
        .then((res) => {
          if (Array.isArray(res.data)) {
            const matches = ids
              .map((id) => res.data.find((p) => String(p.id) === String(id)))
              .filter(Boolean);
            setProducts(matches.slice(0, 6));
          }
        })
        .catch((err) => console.error("Failed to load recently viewed products:", err));
    } catch (err) {
      console.error("Error reading recently viewed from localStorage:", err);
    }
  }, [currentProductId]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-12 pt-8 border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-4">
        <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold text-stone-900 mb-6">
          Recently Viewed
        </h3>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
          {products.map((p) => {
            const img = p.image_url || "/logo192.png";
            return (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                style={{ flex: "0 0 180px" }}
                className="group bg-white border border-stone-200 hover:shadow-md transition overflow-hidden rounded-xl p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-stone-50 overflow-hidden rounded-lg mb-2 flex items-center justify-center">
                    <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug mb-1">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-stone-400 mb-2">{p.category || "Custom Printed"}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-stone-900">{convert(p.price)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
