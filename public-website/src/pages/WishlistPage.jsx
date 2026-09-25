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

  const removeFromWishlist = async (p) => {
    const identifier = p.product_uid || p.slug || p.product_id || p.id || p.wishlist_id;
    // Optimistic removal from UI
    setWishlistItems((prev) =>
      prev.filter((item) => {
        if (p.wishlist_id && item.wishlist_id && item.wishlist_id === p.wishlist_id) return false;
        if (p.product_uid && item.product_uid && item.product_uid === p.product_uid) return false;
        if (p.id && item.id && String(item.id) === String(p.id)) return false;
        if (identifier && (item.product_uid === identifier || String(item.id) === String(identifier) || String(item.wishlist_id) === String(identifier))) return false;
        return true;
      })
    );

    try {
      await API.delete(`/wishlist/${identifier}`);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      fetchWishlist();
    }
  };

  return (
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex flex-col">
      <SEO title="My Saved Wishlist | Olive Seeds Studio" description="View and manage your saved products on Olive Seeds Studio." />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E7E7E2] pb-6 mb-8 gap-4">
          <div>
            <span className="eyebrow" style={{ marginBottom: 6 }}>
              Curated Selection
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl sm:text-4xl font-normal text-[#181A18] flex items-center gap-3">
              <MdFavorite className="text-[#A48855]" /> Saved Commissions &amp; Objects
            </h1>
            <p className="text-xs sm:text-sm text-[#676A65] mt-1">Curate your shortlisted bespoke pieces and studio assets.</p>
          </div>

          <span className="bg-[#F8F8F6] text-[#23483D] text-xs font-semibold px-3.5 py-1.5 rounded-[4px] border border-[#E7E7E2] self-start sm:self-auto">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Saved Piece" : "Saved Pieces"}
          </span>
        </div>

        {!member ? (
          <div className="bg-white rounded-[4px] border border-[#E7E7E2] p-10 sm:p-12 text-center space-y-4 shadow-xs max-w-md mx-auto my-8">
            <MdFavoriteBorder className="text-4xl text-[#8A8D88] mx-auto" />
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#181A18]">Login to View Wishlist</h3>
            <p className="text-xs sm:text-sm text-[#676A65]">Please sign in to view your curated pieces across devices.</p>
            <Link to="/login" className="btn-primary inline-flex text-xs">
              Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-xs text-[#8A8D88]">Loading saved items...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-[4px] border border-[#E7E7E2] p-10 sm:p-12 text-center space-y-4 shadow-xs max-w-md mx-auto my-8">
            <MdShoppingBag className="text-4xl text-[#8A8D88] mx-auto" />
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl font-normal text-[#181A18]">Your Saved Collection is Empty</h3>
            <p className="text-xs sm:text-sm text-[#676A65]">Explore our collection and select the heart icon to curate pieces here.</p>
            <Link to="/products" className="btn-primary inline-flex text-xs">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((p) => {
              const targetUid = p.product_uid || p.id;
              const productLink = p.type === "digital" ? `/digital/${targetUid}` : `/products/${targetUid}`;
              const imgSrc = p.image || p.image_url || "/logo192.png";
              return (
                <div key={p.wishlist_id || targetUid} className="bg-white border border-[#E7E7E2] rounded-[4px] p-4 sm:p-5 shadow-xs hover:border-[#CACCC6] transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Link to={productLink} className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F8F8F6] rounded-[3px] overflow-hidden flex-shrink-0 border border-[#E7E7E2] block">
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#A48855] bg-[#F8F8F6] border border-[#E7E7E2] px-2 py-0.5 rounded-[2px] mb-1">
                        {p.type === "digital" ? "Digital Asset" : (p.category || "Custom Piece")}
                      </span>
                      <h2 className="text-sm sm:text-base font-normal truncate">
                        <Link to={productLink} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-[#181A18] text-lg sm:text-xl hover:text-[#23483D] transition">
                          {p.name}
                        </Link>
                      </h2>
                      <p className="font-semibold text-sm sm:text-base text-[#23483D] mt-0.5">
                        {convert(p.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <Link to={productLink} className="btn-secondary text-xs" style={{ padding: "9px 18px" }}>
                      View Piece
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(p)}
                      className="p-2 text-[#8A8D88] hover:text-[#181A18] hover:bg-[#F8F8F6] rounded-[3px] transition cursor-pointer"
                      title="Remove from saved pieces"
                    >
                      <MdFavorite className="text-lg text-[#A48855]" />
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
