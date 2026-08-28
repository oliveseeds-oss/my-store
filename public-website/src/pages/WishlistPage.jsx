import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdFavorite, MdFavoriteBorder, MdShoppingBag } from "react-icons/md";
import API from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";

export default function WishlistPage() {
  const { member } = useMember();
  const { convert } = useCurrency();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!member) {
      setLoading(false);
      return;
    }
    try {
      const res = await API.get("/wishlist");
      setWishlistItems(res.data || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [member]);

  const removeFromWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen flex flex-col">
      <SEO title="My Saved Wishlist | Olive Seeds Studio" description="View and manage your saved products on Olive Seeds Studio." />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between border-b border-[#0D1512]/10 pb-6 mb-8">
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-black text-[#0D1512] flex items-center gap-3">
              <MdFavorite className="text-rose-500" /> My Saved Wishlist
            </h1>
            <p className="text-xs text-[#0D1512]/60 mt-1">Keep track of your favorite custom products and order when ready.</p>
          </div>

          <span className="bg-[#0D1512]/5 text-[#0D1512] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#0D1512]/10">
            {wishlistItems.length} Saved Items
          </span>
        </div>

        {!member ? (
          <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-12 text-center space-y-4 shadow-sm max-w-md mx-auto my-8">
            <MdFavoriteBorder className="text-5xl text-stone-300 mx-auto" />
            <h3 className="font-bold text-[#0D1512]">Login to View Wishlist</h3>
            <p className="text-xs text-stone-500">Please sign in to access your saved products across devices.</p>
            <Link to="/login" className="inline-block bg-[#0D1512] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-stone-800 transition">
              Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-xs text-[#0D1512]/50">Loading saved items...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#0D1512]/10 p-12 text-center space-y-4 shadow-sm max-w-md mx-auto my-8">
            <MdShoppingBag className="text-5xl text-stone-300 mx-auto" />
            <h3 className="font-bold text-[#0D1512]">Your Wishlist is Empty</h3>
            <p className="text-xs text-stone-500">Explore our catalog and click the heart icon to save products here.</p>
            <Link to="/products" className="inline-block bg-[#0D1512] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-stone-800 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((p) => {
              const targetUid = p.product_uid || p.id;
              const productLink = p.type === "digital" ? `/digital/${targetUid}` : `/products/${targetUid}`;
              const imgSrc = p.image || p.image_url || "/logo192.png";
              return (
                <div key={p.wishlist_id || targetUid} className="bg-white border border-[#0D1512]/10 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Link to={productLink} className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200/60 block">
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mb-1">
                        {p.type === "digital" ? "Digital Asset" : (p.category || "Custom Printed")}
                      </span>
                      <Link to={productLink} className="block font-bold text-sm sm:text-base text-[#0D1512] hover:text-amber-700 transition truncate">
                        {p.name}
                      </Link>
                      <p className="font-extrabold text-sm sm:text-base text-[#0D1512] mt-1">
                        {convert(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <Link to={productLink} className="bg-[#0D1512] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-800 transition shadow-sm">
                      View Product
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(targetUid)}
                      className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <MdFavorite className="text-xl text-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
