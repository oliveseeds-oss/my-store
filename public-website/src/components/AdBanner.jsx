import { useEffect, useState } from "react";
import API from "../api";
import { motion } from "framer-motion";

export default function AdBanner({ placement, priority }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    // Normalise placement default
    const placementName = placement || "Horizontal Banner";
    API.get(`/ads/active?placement=${placementName}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Select a random active ad for this placement
          const randomAd = res.data[Math.floor(Math.random() * res.data.length)];
          setAd(randomAd);
        }
      })
      .catch((err) => console.error("Ad loading failed:", err));
  }, [placement]);

  // Fallbacks: Beautiful visual stock promos representing the exact aspect ratio/content
  const fallbacks = {
    "Horizontal Banner": {
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop&h=200",
      link_url: "/products"
    },
    "Vertical Tower": {
      image_url: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=350&auto=format&fit=crop&h=700",
      link_url: "/digital"
    },
    "Square Tile": {
      image_url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=400&auto=format&fit=crop&h=400",
      link_url: "/products"
    },
    "Large Panel": {
      image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop&h=400",
      link_url: "/digital"
    }
  };

  const type = placement || "Horizontal Banner";
  const currentAd = ad || fallbacks[type] || fallbacks["Horizontal Banner"];

  // Layout sizing wrappers mapping perfectly to their suggested dimensions!
  let layoutClasses = "";
  if (type === "Horizontal Banner") {
    layoutClasses = "w-full h-32 md:h-24";
  } else if (type === "Vertical Tower") {
    layoutClasses = "w-full max-w-[300px] h-[600px] mx-auto";
  } else if (type === "Square Tile") {
    layoutClasses = "w-full max-w-[300px] aspect-square mx-auto";
  } else if (type === "Large Panel") {
    layoutClasses = "w-full h-full";
  }

  return (
    <motion.a
      href={currentAd.link_url || "/products"}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`block relative rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all duration-300 group ${layoutClasses}`}
    >
      <img
        src={currentAd.image_url}
        alt={`Ad Campaign Promo - ${type}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading={priority === "high" ? "eager" : "lazy"}
        fetchpriority={priority === "high" ? "high" : "auto"}
      />
    </motion.a>
  );
}
