import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../api";
import { useMember } from "../context/MemberContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { 
  MdShoppingBag, MdLock, MdHome, MdCloudDownload, 
  MdFavorite, MdExitToApp, MdArrowBack, MdCheckCircle, MdSave, MdNotifications,
  MdOutlineLocalShipping, MdOutlineReceiptLong, MdShield
} from "react-icons/md";
import SmartAddressForm from "../components/SmartAddressForm";

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { member, login, logout } = useMember();
  const { addToCart } = useCart();
  const { convert } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  
  // Profile editing form states
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    street_address: "",
    apt_suite: "",
    city: "",
    state: "",
    country: "India",
    pincode: ""
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Sync tab with URL
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "home" ? {} : { tab });
  };

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const r = await API.get("/notifications");
      setNotifications(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const markAllReadNotifications = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {}
  };

  const markSingleReadNotification = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, is_read: true }) : n));
    } catch (err) {}
  };

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const r = await API.get("/orders/my");
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const r = await API.get("/wishlist");
      setWishlist(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoadingWishlist(false);
    }
  }, []);

  useEffect(() => {
    if (!member) {
      navigate("/login");
      return;
    }

    // Load full member profile details
    API.get("/members/profile")
      .then((r) => {
        if (r.data) {
          setProfile({
            full_name: r.data.full_name || r.data.name || member?.name || "",
            email: r.data.email || member?.email || "",
            phone: r.data.phone || member?.phone || "",
            street_address: r.data.street_address || r.data.address || "",
            apt_suite: r.data.apt_suite || "",
            city: r.data.city || "",
            state: r.data.state || "",
            country: r.data.country || "India",
            pincode: r.data.pincode || ""
          });
        }
      })
      .catch((err) => console.error("Failed to load profile details:", err));

    fetchOrders();
    fetchWishlist();
    fetchNotifications();
  }, [member, navigate, fetchOrders, fetchWishlist, fetchNotifications]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await API.put("/members/profile", profile);
      setSuccessMsg("Client dossier updated and secured successfully.");

      const stored = JSON.parse(localStorage.getItem("member") || "{}");
      if (stored.member) {
        login({
          ...stored,
          member: {
            ...stored.member,
            name: profile.full_name || stored.member.name,
            email: profile.email || stored.member.email,
            phone: profile.phone || stored.member.phone
          }
        });
      } else if (stored.token) {
        login({
          ...stored,
          name: profile.full_name || stored.name,
          email: profile.email || stored.email,
          phone: profile.phone || stored.phone
        });
      }

      setTimeout(() => setSuccessMsg(""), 4500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (itemOrId) => {
    const targetId = typeof itemOrId === "object" ? (itemOrId.product_uid || itemOrId.slug || itemOrId.id || itemOrId.wishlist_id) : itemOrId;
    setWishlist((prev) =>
      prev.filter((item) => {
        if (typeof itemOrId === "object") {
          if (itemOrId.wishlist_id && item.wishlist_id && item.wishlist_id === itemOrId.wishlist_id) return false;
          if (itemOrId.product_uid && item.product_uid && item.product_uid === itemOrId.product_uid) return false;
          if (itemOrId.id && item.id && String(item.id) === String(itemOrId.id)) return false;
        }
        if (targetId && (item.product_uid === targetId || String(item.id) === String(targetId) || String(item.wishlist_id) === String(targetId))) return false;
        return true;
      })
    );

    try {
      await API.delete(`/wishlist/${targetId}`);
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
      fetchWishlist();
    }
  };

  const handleAddWishlistToCart = (item) => {
    const p = {
      id: item.product_uid || item.id,
      product_uid: item.product_uid || item.id,
      name: item.product_type === "digital" ? item.digital_name : item.product_name,
      price: item.product_type === "digital" ? item.digital_price : item.product_price,
      image_url: item.product_type === "digital" ? item.digital_image : item.product_image,
      thumbnail_url: item.product_type === "digital" ? item.digital_image : item.product_image,
      type: item.product_type || "physical"
    };
    addToCart(p);
  };

  // Initials for avatar monogram
  const memberInitials = (profile.full_name || member?.name || "Client")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;
  const digitalOrders = orders.filter(o => o.type === "digital");

  const STATUS_PILL = {
    Processing: "bg-[#FAF6EE] text-[#A48855] border-[#EAE4D6]",
    Shipped: "bg-[#23483D]/10 text-[#23483D] border-[#23483D]/20",
    Delivered: "bg-[#23483D] text-[#FAF6EE] border-[#23483D]",
    Cancelled: "bg-stone-100 text-stone-500 border-stone-300",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF", color: "#1C2B26", fontFamily: "'DM Sans', sans-serif" }}>
      <SEO
        title="Client Atelier & Concierge | Olive Seeds Studio"
        description="Private patron dossier, commissioned acquisition tracking, digital vault access, and white-glove delivery management."
        noIndex={true}
      />
      <Navbar />

      {/* ── Atelier Masthead ── */}
      <section className="relative border-b border-[#EAE4D6] overflow-hidden" style={{ background: "#FAF6EE" }}>
        {/* Subtle decorative watermark */}
        <div className="absolute right-6 -bottom-10 select-none pointer-events-none opacity-[0.03] text-stone-900 font-serif text-[180px] leading-none">
          OS
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Patron Profile Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0 border border-[#A48855]/40 shadow-sm"
                style={{ background: "#FFFFFF", color: "#23483D" }}
              >
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-medium tracking-wider">
                  {memberInitials}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#A48855]">
                    Private Client Atelier
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#A48855]" />
                  <span className="text-[10px] tracking-[0.16em] uppercase font-bold px-2.5 py-0.5 rounded-[3px] border border-[#23483D]/20 text-[#23483D] bg-[#23483D]/5">
                    Patron Portfolio
                  </span>
                </div>

                <h1 
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} 
                  className="text-2xl sm:text-4xl font-normal text-[#1C2B26] mt-0.5 tracking-tight"
                >
                  {profile.full_name || member?.name || "Distinguished Client"}
                </h1>

                <p className="text-xs text-[#6B7C75] mt-1 flex items-center gap-2 flex-wrap">
                  <span>{profile.email || member?.email}</span>
                  {profile.country && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="text-stone-700 font-medium">{profile.country} Jurisdiction</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Metrics Pillar */}
            <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-[#EAE4D6] pt-4 md:pt-0 md:pl-6">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C75] font-semibold">Commissions</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-bold text-[#23483D] mt-0.5">
                  {orders.length}
                </p>
              </div>
              <div className="w-[1px] h-8 bg-[#EAE4D6]" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C75] font-semibold">Vault Assets</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-bold text-[#23483D] mt-0.5">
                  {digitalOrders.length}
                </p>
              </div>
              <div className="w-[1px] h-8 bg-[#EAE4D6]" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C75] font-semibold">Saved Pieces</p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-bold text-[#23483D] mt-0.5">
                  {wishlist.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Luxury Navigation Tab Bar (Desktop & Mobile Swipeable) ── */}
        <div className="border-t border-[#EAE4D6] bg-white/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth" style={{ scrollbarWidth: "none" }}>
              {[
                { key: "home", label: "Overview", icon: "🏛️" },
                { key: "orders", label: "Commissions & Orders", count: orders.length, icon: "📜" },
                { key: "digital", label: "Digital Vault", count: digitalOrders.length, icon: "💾" },
                { key: "addresses", label: "Delivery Sanctum", icon: "📍" },
                { key: "wishlist", label: "Curated Wishlist", count: wishlist.length, icon: "⚜️" },
                { key: "security", label: "Client Dossier", icon: "🔐" },
                { key: "notifications", label: "Studio Despatches", count: unreadNotificationsCount, icon: "📬" },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => switchTab(tab.key)}
                    className={`whitespace-nowrap flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-medium rounded-[4px] transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#23483D] text-[#FAF6EE] shadow-sm font-semibold"
                        : "text-[#6B7C75] hover:text-[#1C2B26] hover:bg-[#FAF6EE]"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span 
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive 
                            ? "bg-[#A48855] text-white" 
                            : "bg-stone-200/80 text-stone-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* ── Main Atelier Body ── */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ─── 0. ATELIER OVERVIEW (ARCHITECTURAL TILES) ─── */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A48855] block mb-1">
                Concierge Portfolio
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-medium text-[#1C2B26]">
                Client Sanctum Overview
              </h2>
              <p className="text-xs text-[#6B7C75] mt-1 max-w-xl">
                Direct access to your commissioned handcrafted furniture, digital CAD assets, white-glove dispatch parameters, and private patron dossier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Tile 1: Orders */}
              <div 
                onClick={() => switchTab("orders")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdShoppingBag />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      {orders.length} Records
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Commissions & Orders
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Track white-glove timber dispatch status, inspect purchase histories, and retrieve authenticated digital e-invoices.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  Inspect Acquisitions →
                </div>
              </div>

              {/* Tile 2: Digital Vault */}
              <div 
                onClick={() => switchTab("digital")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdCloudDownload />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      {digitalOrders.length} Assets
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Digital Design Vault
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Direct access to licensed CAD schematics, 3D architectural models, DWG drawings, and vector stationery kits.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  Access Downloads →
                </div>
              </div>

              {/* Tile 3: Addresses */}
              <div 
                onClick={() => switchTab("addresses")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdHome />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      {profile.city ? "Verified" : "Default"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Delivery Sanctum
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Manage private residential freight coordinates, gated dispatch instructions, and global delivery jurisdictions.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  Edit Delivery Destination →
                </div>
              </div>

              {/* Tile 4: Wishlist */}
              <div 
                onClick={() => switchTab("wishlist")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdFavorite />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      {wishlist.length} Curated
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Curated Wishlist
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Review shortlisted studio crafts, monitor production schedules, and swiftly commission pieces to cart.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  View Curated List →
                </div>
              </div>

              {/* Tile 5: Credentials & Dossier */}
              <div 
                onClick={() => switchTab("security")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdLock />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      Encrypted
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Patron Credentials
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Maintain your authenticated personal name, encrypted email contact, telephone line, and regional security profile.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  Manage Credentials →
                </div>
              </div>

              {/* Tile 6: Notifications */}
              <div 
                onClick={() => switchTab("notifications")}
                className="group p-6 rounded-[4px] border border-[#EAE4D6] hover:border-[#23483D] bg-white transition duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#FAF6EE] text-[#23483D] flex items-center justify-center text-xl border border-[#EAE4D6] group-hover:scale-105 transition">
                      <MdNotifications />
                    </span>
                    <span className="text-[11px] font-bold text-[#A48855] tracking-wider uppercase">
                      {unreadNotificationsCount ? `${unreadNotificationsCount} Unread` : "Archived"}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-semibold text-[#1C2B26] group-hover:text-[#23483D] transition">
                    Studio Despatches
                  </h3>
                  <p className="text-xs text-[#6B7C75] mt-2 leading-relaxed">
                    Official dispatch tracking notices, private previews, studio bulletins, and commission progression logs.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EAE4D6]/60 flex items-center text-xs font-semibold text-[#23483D] group-hover:translate-x-1 transition">
                  Read Despatches →
                </div>
              </div>

            </div>

            {/* Quiet Luxury Sign Out Bar */}
            <div className="border-t border-[#EAE4D6] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-[#6B7C75]">
                <MdShield className="text-[#A48855] text-base" />
                <span>Protected Patron Session · Olive Seeds Studio Authenticated</span>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="text-xs font-medium text-stone-600 hover:text-red-700 px-4 py-2 border border-[#EAE4D6] hover:border-red-300 rounded-[4px] bg-[#FAF6EE]/50 hover:bg-red-50 transition cursor-pointer flex items-center gap-2"
              >
                <MdExitToApp className="text-sm" /> Sign Out Session
              </button>
            </div>

          </div>
        )}

        {/* ─── 1. COMMISSIONS & ORDERS PANEL ─── */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EAE4D6] pb-4">
              <div>
                <button 
                  onClick={() => switchTab("home")}
                  className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
                >
                  <MdArrowBack /> Atelier Overview
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Commissioned Acquisitions
                </h2>
                <p className="text-xs text-[#6B7C75] mt-1">Review official statements for bespoke handcrafted pieces and digital suites.</p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-16 text-[#6B7C75] text-xs font-semibold animate-pulse tracking-widest uppercase">
                Retrieving Atelier Ledgers...
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-12 text-center bg-[#FAF6EE]/40">
                <span className="text-3xl block mb-2 opacity-40">🪵</span>
                <p className="text-[#1C2B26] font-medium text-sm">No commissions recorded in this ledger.</p>
                <p className="text-xs text-[#6B7C75] mt-1">Your handcrafted acquisitions and digital purchases will appear here.</p>
                <Link 
                  to="/products" 
                  className="inline-block mt-4 px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] text-xs font-semibold rounded-[4px] hover:bg-[#16352D] transition tracking-wider uppercase"
                >
                  Explore Collections →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div key={o.id} className="border border-[#EAE4D6] rounded-[4px] bg-white overflow-hidden shadow-sm">
                    {/* Header Strip */}
                    <div className="bg-[#FAF6EE] border-b border-[#EAE4D6] px-5 py-4 flex flex-wrap justify-between items-center gap-4 text-xs">
                      <div className="flex flex-wrap gap-6 text-[#6B7C75]">
                        <div>
                          <p className="uppercase text-[9px] font-bold tracking-widest text-[#A48855]">Commission Date</p>
                          <p className="font-medium text-[#1C2B26] mt-0.5">
                            {new Date(o.created_at).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric"
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase text-[9px] font-bold tracking-widest text-[#A48855]">Acquisition Value</p>
                          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-base font-bold text-[#23483D] mt-0.5">
                            {convert(o.total)}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase text-[9px] font-bold tracking-widest text-[#A48855]">Type</p>
                          <p className="font-medium text-[#1C2B26] mt-0.5 capitalize">{o.type} Craft</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="uppercase text-[9px] font-bold tracking-widest text-[#A48855]">Order Reference</p>
                        <p className="font-mono text-xs font-bold text-[#1C2B26] mt-0.5">#{o.order_uid || o.id}</p>
                      </div>
                    </div>

                    {/* Body Items & Actions */}
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-[3px] border uppercase tracking-wider ${
                            STATUS_PILL[o.status] || "bg-[#FAF6EE] text-[#1C2B26] border-[#EAE4D6]"
                          }`}>
                            {o.status}
                          </span>
                        </div>

                        <div className="space-y-2 pt-1">
                          {o.items?.map((item) => (
                            <div key={item.id} className="text-xs text-[#1C2B26] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A48855]" />
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-[#6B7C75] text-[11px]">× {item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                        {o.type === "physical" ? (
                          <Link 
                            to={`/track-order?order=${o.order_uid || o.id}`}
                            className="text-center px-4 py-2.5 border border-[#23483D] text-[#23483D] hover:bg-[#23483D] hover:text-white text-xs font-semibold rounded-[4px] transition flex items-center justify-center gap-1.5"
                          >
                            <MdOutlineLocalShipping className="text-sm" /> White-Glove Tracking
                          </Link>
                        ) : (
                          <button 
                            onClick={() => switchTab("digital")}
                            className="text-center px-4 py-2.5 border border-[#23483D] text-[#23483D] hover:bg-[#23483D] hover:text-white text-xs font-semibold rounded-[4px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MdCloudDownload className="text-sm" /> Access Digital Files
                          </button>
                        )}
                        <a 
                          href={`/invoice/${o.order_uid || o.id}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-center px-4 py-2.5 bg-[#FAF6EE] hover:bg-[#EAE4D6]/70 border border-[#EAE4D6] text-[#1C2B26] text-xs font-semibold rounded-[4px] transition flex items-center justify-center gap-1.5"
                        >
                          <MdOutlineReceiptLong className="text-sm text-[#A48855]" /> Authenticated E-Invoice
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 2. DIGITAL VAULT PANEL ─── */}
        {activeTab === "digital" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EAE4D6] pb-4">
              <div>
                <button 
                  onClick={() => switchTab("home")}
                  className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
                >
                  <MdArrowBack /> Atelier Overview
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Digital Design Vault
                </h2>
                <p className="text-xs text-[#6B7C75] mt-1">Instant high-speed download access to all acquired CAD models, vector templates, and brand suites.</p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-16 text-[#6B7C75] text-xs font-semibold animate-pulse tracking-widest uppercase">
                Unlocking Vault Credentials...
              </div>
            ) : digitalOrders.length === 0 ? (
              <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-12 text-center bg-[#FAF6EE]/40">
                <span className="text-3xl block mb-2 opacity-40">💾</span>
                <p className="text-[#1C2B26] font-medium text-sm">Your digital vault contains no licensed assets.</p>
                <p className="text-xs text-[#6B7C75] mt-1">Acquired digital templates, 3D CAD files, and design kits are automatically deposited here.</p>
                <Link 
                  to="/digital" 
                  className="inline-block mt-4 px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] text-xs font-semibold rounded-[4px] hover:bg-[#16352D] transition tracking-wider uppercase"
                >
                  Explore Digital Atelier →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {digitalOrders.map((o) => (
                  <div key={o.id} className="border border-[#EAE4D6] rounded-[4px] p-5 sm:p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-[#EAE4D6] pb-3 mb-4">
                        <div>
                          <p className="font-serif font-bold text-[#1C2B26] text-base">Vault Release #{o.id}</p>
                          <p className="text-[10px] text-[#6B7C75] mt-0.5">Licensed on {new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] bg-[#23483D]/10 text-[#23483D] border border-[#23483D]/20 font-bold px-2.5 py-0.5 rounded-[3px] uppercase">
                          Authenticated ✓
                        </span>
                      </div>

                      <div className="space-y-4">
                        {o.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-3 p-3 bg-[#FAF6EE] border border-[#EAE4D6]/80 rounded-[4px]">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#1C2B26] truncate">{item.product_name}</p>
                              <p className="text-[9px] text-[#A48855] font-mono mt-0.5 truncate">UID: {item.product_uid}</p>
                            </div>
                            <a 
                              href={`${API.defaults.baseURL}/digital-products/download/${item.product_uid}`} 
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-[10px] font-bold uppercase tracking-wider rounded-[3px] transition shadow-sm"
                            >
                              <MdCloudDownload className="text-xs" /> Download File
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAE4D6]/60 flex items-center justify-between text-[11px] text-[#6B7C75]">
                      <span>Lifetime re-download authorized</span>
                      <a href={`/invoice/${o.order_uid || o.id}`} target="_blank" rel="noreferrer" className="text-[#23483D] hover:underline font-semibold">
                        Receipt
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 3. DELIVERY SANCTUM PANEL ─── */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-fadeIn max-w-3xl">
            <div className="flex items-center justify-between border-b border-[#EAE4D6] pb-4">
              <div>
                <button 
                  onClick={() => switchTab("home")}
                  className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
                >
                  <MdArrowBack /> Atelier Overview
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Delivery Sanctum
                </h2>
                <p className="text-xs text-[#6B7C75] mt-1">Configure default destination coordinates for white-glove packaging and freight logistics.</p>
              </div>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 text-[#23483D] bg-[#23483D]/10 border border-[#23483D]/30 text-xs px-4 py-3 rounded-[4px] font-medium">
                <MdCheckCircle className="text-base text-[#23483D]" /> {successMsg}
              </div>
            )}

            {/* Active Destination Card */}
            {(profile.street_address || profile.city) && (
              <div className="bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] font-bold bg-[#23483D] text-[#FAF6EE] px-2.5 py-0.5 rounded-[3px]">
                    Active Delivery Destination
                  </span>
                  <span className="text-xs font-semibold text-[#23483D] flex items-center gap-1">
                    ✓ Verified on File
                  </span>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-lg font-bold text-[#1C2B26]">
                  {profile.full_name || member?.name || "Member Residence"}
                </p>
                <p className="text-xs text-[#6B7C75] mt-1 leading-relaxed">
                  {[profile.street_address, profile.apt_suite, profile.city, profile.state, profile.pincode, profile.country].filter(Boolean).join(", ")}
                </p>
                {profile.phone && <p className="text-xs text-[#6B7C75] font-mono mt-2">📞 {profile.phone}</p>}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 bg-white border border-[#EAE4D6] p-6 rounded-[4px] shadow-sm">
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-xl font-normal text-[#1C2B26]">
                Update Destination Parameters
              </h3>
              
              <SmartAddressForm
                form={{
                  name: profile.full_name,
                  phone: profile.phone,
                  delivery_street: profile.street_address,
                  delivery_apt: profile.apt_suite,
                  delivery_city: profile.city,
                  delivery_state: profile.state,
                  country: profile.country,
                  delivery_pincode: profile.pincode
                }}
                onChange={(updated) => {
                  setProfile((prev) => ({
                    ...prev,
                    full_name: updated.name !== undefined ? updated.name : (updated.full_name !== undefined ? updated.full_name : prev.full_name),
                    phone: updated.phone !== undefined ? updated.phone : prev.phone,
                    street_address: updated.delivery_street !== undefined ? updated.delivery_street : (updated.street_address !== undefined ? updated.street_address : prev.street_address),
                    apt_suite: updated.delivery_apt !== undefined ? updated.delivery_apt : (updated.apt_suite !== undefined ? updated.apt_suite : prev.apt_suite),
                    city: updated.delivery_city !== undefined ? updated.delivery_city : (updated.city !== undefined ? updated.city : prev.city),
                    state: updated.delivery_state !== undefined ? updated.delivery_state : (updated.state !== undefined ? updated.state : prev.state),
                    country: updated.country || prev.country,
                    pincode: updated.delivery_pincode !== undefined ? updated.delivery_pincode : (updated.pincode !== undefined ? updated.pincode : prev.pincode)
                  }));
                }}
                isPhysical={false}
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <MdSave className="text-sm" /> {saving ? "Securing Coordinates..." : "Save Delivery Sanctum"}
              </button>
            </form>
          </div>
        )}

        {/* ─── 4. CURATED WISHLIST PANEL ─── */}
        {activeTab === "wishlist" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EAE4D6] pb-4">
              <div>
                <button 
                  onClick={() => switchTab("home")}
                  className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
                >
                  <MdArrowBack /> Atelier Overview
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Curated Private Wishlist
                </h2>
                <p className="text-xs text-[#6B7C75] mt-1">Review saved studio crafts, monitor production schedules, and acquire pieces to cart.</p>
              </div>
            </div>

            {loadingWishlist ? (
              <div className="text-center py-16 text-[#6B7C75] text-xs font-semibold animate-pulse tracking-widest uppercase">
                Loading Curated Archive...
              </div>
            ) : wishlist.length === 0 ? (
              <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-12 text-center bg-[#FAF6EE]/40">
                <span className="text-3xl block mb-2 opacity-40">⚜️</span>
                <p className="text-[#1C2B26] font-medium text-sm">Your curated wishlist is empty.</p>
                <p className="text-xs text-[#6B7C75] mt-1">Bookmark bespoke furniture pieces or digital suites as you explore the collection.</p>
                <Link 
                  to="/products" 
                  className="inline-block mt-4 px-5 py-2.5 bg-[#23483D] text-[#FAF6EE] text-xs font-semibold rounded-[4px] hover:bg-[#16352D] transition tracking-wider uppercase"
                >
                  Explore Collection →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => {
                  const itemImg = item.image || item.image_url || item.product_image || item.digital_image;
                  const itemName = item.name || item.product_name || item.digital_name || "Bespoke Piece";
                  const itemPrice = item.price || item.product_price || item.digital_price || 0;
                  const itemType = item.type || item.product_type || "physical";
                  const targetUid = item.product_uid || item.slug || item.product_id || item.id;
                  const productLink = itemType === "digital" ? `/digital/${targetUid}` : `/products/${targetUid}`;

                  return (
                    <div 
                      key={item.wishlist_id || item.id} 
                      className="border border-[#EAE4D6] rounded-[4px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-[#A48855] transition shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Link to={productLink} className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF6EE] rounded-[4px] overflow-hidden shrink-0 border border-[#EAE4D6] block flex items-center justify-center">
                          {itemImg ? (
                            <img src={itemImg} alt={itemName} className="w-full h-full object-cover hover:scale-105 transition" />
                          ) : (
                            <span className="text-xl">{itemType === "digital" ? "💾" : "🪵"}</span>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.16em] text-[#A48855] mb-1">
                            {itemType} Collection
                          </span>
                          <Link to={productLink} style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="block font-medium text-base sm:text-lg text-[#1C2B26] hover:text-[#23483D] transition truncate">
                            {itemName}
                          </Link>
                          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-base sm:text-lg font-bold text-[#23483D] mt-0.5">
                            {convert(itemPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleAddWishlistToCart(item)}
                          className="px-4 py-2 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <MdShoppingBag className="text-sm" /> Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveWishlist(item)}
                          className="text-xs text-stone-500 hover:text-red-700 px-2 py-1 transition cursor-pointer"
                          title="Remove item from wishlist"
                        >
                          Relinquish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── 5. CLIENT DOSSIER & SECURITY PANEL ─── */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fadeIn max-w-xl">
            <div className="border-b border-[#EAE4D6] pb-4">
              <button 
                onClick={() => switchTab("home")}
                className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
              >
                <MdArrowBack /> Atelier Overview
              </button>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                Patron Credentials & Dossier
              </h2>
              <p className="text-xs text-[#6B7C75] mt-1">Manage private correspondence channels and authenticated account parameters.</p>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 text-[#23483D] bg-[#23483D]/10 border border-[#23483D]/30 text-xs px-4 py-3 rounded-[4px] font-medium">
                <MdCheckCircle className="text-base text-[#23483D]" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 bg-white border border-[#EAE4D6] p-6 rounded-[4px] shadow-sm">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#A48855] tracking-widest block mb-1.5">
                  Patron Legal Name
                </label>
                <input 
                  type="text" 
                  required
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                  placeholder="e.g. Alistair Vance"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#A48855] tracking-widest block mb-1.5">
                  Encrypted Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                  placeholder="client@sanctum.com"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#A48855] tracking-widest block mb-1.5">
                  Private Telephone Line
                </label>
                <div className="flex gap-2">
                  <select
                    value={profile.phone?.split(" ")[0]?.startsWith("+") ? profile.phone.split(" ")[0] : "+91"}
                    onChange={(e) => {
                      const numOnly = profile.phone?.replace(/^\+\d+\s*/, "") || "";
                      setProfile({...profile, phone: `${e.target.value} ${numOnly}`});
                    }}
                    className="bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-2.5 py-2.5 text-xs focus:outline-none text-[#1C2B26] font-mono shrink-0"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+1">🇨🇦 +1</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+64">🇳🇿 +64</option>
                    <option value="+41">🇨🇭 +41</option>
                  </select>
                  <input 
                    type="text" 
                    value={profile.phone?.replace(/^\+\d+\s*/, "") || profile.phone || ""}
                    onChange={(e) => {
                      const currentPrefix = profile.phone?.split(" ")[0]?.startsWith("+") ? profile.phone.split(" ")[0] : "+91";
                      setProfile({...profile, phone: `${currentPrefix} ${e.target.value}`});
                    }}
                    className="w-full bg-[#FAF6EE]/50 border border-[#EAE4D6] focus:border-[#23483D] rounded-[4px] px-3.5 py-2.5 text-xs focus:outline-none text-[#1C2B26]"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#23483D] text-[#FAF6EE] hover:bg-[#16352D] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <MdSave className="text-sm" /> {saving ? "Encrypting Changes..." : "Save Patron Credentials"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── 6. STUDIO DESPATCHES (NOTIFICATIONS) PANEL ─── */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-fadeIn max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE4D6] pb-4">
              <div>
                <button 
                  onClick={() => switchTab("home")}
                  className="flex items-center gap-1.5 text-xs text-[#6B7C75] hover:text-[#23483D] font-bold mb-2 transition uppercase tracking-wider cursor-pointer"
                >
                  <MdArrowBack /> Atelier Overview
                </button>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-2xl sm:text-3xl font-normal text-[#1C2B26]">
                  Studio Despatches & Updates
                </h2>
                <p className="text-xs text-[#6B7C75] mt-1">Official bulletins, production schedules, and dispatch status alerts.</p>
              </div>

              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={markAllReadNotifications}
                  className="text-xs font-semibold px-4 py-2 border border-[#23483D] text-[#23483D] hover:bg-[#23483D] hover:text-white rounded-[4px] transition shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {loadingNotifications ? (
              <div className="text-center py-16 text-[#6B7C75] text-xs font-semibold animate-pulse tracking-widest uppercase">
                Loading Despatches...
              </div>
            ) : notifications.length === 0 ? (
              <div className="border border-dashed border-[#EAE4D6] rounded-[4px] p-12 text-center bg-[#FAF6EE]/40 space-y-2">
                <span className="text-3xl block mb-2 opacity-40">📬</span>
                <p className="text-[#1C2B26] font-medium text-sm">No active studio despatches.</p>
                <p className="text-xs text-[#6B7C75] max-w-sm mx-auto">You will receive bespoke notices when your commissions undergo seasoning, assembly, or white-glove transit.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markSingleReadNotification(n.id)}
                    className={`p-4 sm:p-5 rounded-[4px] border transition cursor-pointer flex justify-between items-start shadow-sm hover:shadow-md ${
                      n.is_read ? "bg-white border-[#EAE4D6]" : "bg-[#FAF6EE] border-[#A48855]"
                    }`}
                  >
                    <div className="flex gap-3.5 items-start min-w-0">
                      <span className="text-xl p-2 bg-white rounded-[4px] border border-[#EAE4D6] shrink-0">
                        {n.type === 'order_confirmed' ? '📦' :
                         n.type === 'order_shipped' ? '🚚' :
                         n.type === 'order_out_for_delivery' ? '🛵' :
                         n.type === 'order_delivered' ? '✨' :
                         n.type === 'new_arrival' ? '⚜️' : '📬'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm ${n.is_read ? 'font-semibold text-[#1C2B26]' : 'font-bold text-[#23483D]'}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-[#6B7C75] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-[#A48855] font-mono mt-2">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!n.is_read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A48855] shrink-0 mt-1 ml-2" title="Unread" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}