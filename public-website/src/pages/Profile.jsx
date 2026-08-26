import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../api";
import { useMember } from "../context/MemberContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  MdShoppingBag, MdLock, MdHome, MdCloudDownload, 
  MdFavorite, MdExitToApp, MdArrowBack, MdCheckCircle, MdSave 
} from "react-icons/md";

export default function Profile() {
  const [searchParams] = useSearchParams();
  const { member, login, logout } = useMember();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home"); // 'home', 'orders', 'security', 'addresses', 'digital', 'wishlist'
  
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

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const r = await API.get("/orders/my");
      setOrders(r.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const r = await API.get("/wishlist/my");
      setWishlist(r.data);
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
        setProfile({
          full_name: r.data.full_name || r.data.name || "",
          email: r.data.email || "",
          phone: r.data.phone || "",
          street_address: r.data.street_address || "",
          apt_suite: r.data.apt_suite || "",
          city: r.data.city || "",
          state: r.data.state || "",
          country: r.data.country || "India",
          pincode: r.data.pincode || ""
        });
      })
      .catch((err) => console.error("Failed to load profile details:", err));

    fetchOrders();
    fetchWishlist();
  }, [member, navigate, fetchOrders, fetchWishlist]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await API.put("/members/profile", profile);
      setSuccessMsg("Profile updated successfully!");

      // Update the local member context to keep Navbar and Profile headers synced in real time
      const stored = JSON.parse(localStorage.getItem("member") || "{}");
      login({
        ...stored,
        member: {
          ...stored.member,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone
        }
      });

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`);
      fetchWishlist();
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
    }
  };

  const handleAddWishlistToCart = (item) => {
    const p = {
      id: item.product_uid,
      product_uid: item.product_uid,
      name: item.product_type === "digital" ? item.digital_name : item.product_name,
      price: item.product_type === "digital" ? item.digital_price : item.product_price,
      image_url: item.product_type === "digital" ? item.digital_image : item.product_image,
      thumbnail_url: item.product_type === "digital" ? item.digital_image : item.product_image,
      type: item.product_type
    };
    addToCart(p);
  };

  const STATUS_COLOR = {
    Processing: "bg-[#FAF9F6] text-[#0D1512] border-[#0D1512]/30",
    Shipped: "bg-blue-50 text-blue-700 border-blue-200",
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      
      {/* Breadcrumbs */}
      <div style={{ background: "#0D1512" }} className="text-[#FAF9F6] text-xs py-3 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2">
          <Link to="/" className="hover:text-white/80 transition">Home</Link>
          <span className="opacity-60">›</span>
          <span 
            className="cursor-pointer hover:text-white/80 transition"
            onClick={() => setActiveTab("home")}
          >
            Your Account
          </span>
          {activeTab !== "home" && (
            <>
              <span className="opacity-60">›</span>
              <span className="text-white capitalize">
                {activeTab === "security" ? "Login & Security" : activeTab === "addresses" ? "Your Addresses" : activeTab}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
        
        {/* Header Summary */}
        <div className="flex items-center justify-between border-b border-[#0D1512]/15 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: "#0D1512" }}>
              Your Account
            </h1>
            <p className="text-[#0D1512]/70 text-xs mt-1">
              Welcome back, <strong className="text-[#0D1512]">{profile.full_name || member?.name}</strong> · Registered member
            </p>
          </div>
          <div className="text-right">
            <span style={{ background: "#0D1512", color: "#FAF9F6" }} className="text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
              {profile.country || "India"} Region
            </span>
          </div>
        </div>

        {/* ─── HOME VIEW (Amazon-style Card Grid) ─── */}
        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Card 1: Your Orders */}
            <div 
              onClick={() => setActiveTab("orders")}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-2xl border hover:border-[#0D1512] p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-3xl text-[#0D1512] flex-shrink-0 mt-0.5"><MdShoppingBag /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug">Your Orders</h3>
                <p className="text-[#0D1512]/60 text-xs mt-1.5 leading-relaxed">
                  Track orders, view receipts, download official e-invoices, and review historical physical & digital purchases.
                </p>
              </div>
            </div>

            {/* Card 2: Login & Security */}
            <div 
              onClick={() => setActiveTab("security")}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-2xl border hover:border-[#0D1512] p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-3xl text-[#0D1512] flex-shrink-0 mt-0.5"><MdLock /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug">Login & Security</h3>
                <p className="text-[#0D1512]/60 text-xs mt-1.5 leading-relaxed">
                  Update your contact details, personal name, login credentials, and default account phone number details.
                </p>
              </div>
            </div>

            {/* Card 3: Your Addresses */}
            <div 
              onClick={() => setActiveTab("addresses")}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-2xl border hover:border-[#0D1512] p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-3xl text-[#0D1512] flex-shrink-0 mt-0.5"><MdHome /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug">Your Addresses</h3>
                <p className="text-[#0D1512]/60 text-xs mt-1.5 leading-relaxed">
                  Edit default shipping location details, apartments, pins, city, state, and destination parameters for checkout.
                </p>
              </div>
            </div>

            {/* Card 4: Digital Content */}
            <div 
              onClick={() => setActiveTab("digital")}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-2xl border hover:border-[#0D1512] p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-3xl text-[#0D1512] flex-shrink-0 mt-0.5"><MdCloudDownload /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug">Digital Purchases</h3>
                <p className="text-[#0D1512]/60 text-xs mt-1.5 leading-relaxed">
                  Instantly access your digital product purchases, downloadable assets, invoice references, and licensed formats.
                </p>
              </div>
            </div>

            {/* Card 5: Your Wishlist */}
            <div 
              onClick={() => setActiveTab("wishlist")}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-2xl border hover:border-[#0D1512] p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <div className="text-3xl text-[#0D1512] flex-shrink-0 mt-0.5"><MdFavorite /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug">Your Wishlist</h3>
                <p className="text-[#0D1512]/60 text-xs mt-1.5 leading-relaxed">
                  Manage your wishlisted items, transfer products instantly to the shopping cart, or delete saved records.
                </p>
              </div>
            </div>

            {/* Card 6: Logout */}
            <div 
              onClick={() => { logout(); navigate("/"); }}
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.1)" }}
              className="rounded-2xl border hover:border-red-400 p-6 
                         flex gap-4 cursor-pointer shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 group"
            >
              <div className="text-3xl text-stone-400 group-hover:text-red-500 flex-shrink-0 mt-0.5 transition"><MdExitToApp /></div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] group-hover:text-red-600 text-sm leading-snug transition">Sign Out</h3>
                <p className="text-[#0D1512]/65 text-xs mt-1.5 leading-relaxed">
                  Safely sign out of this member session on this browser. Clears cached tokens and account parameters securely.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ─── TAB CONTENTS ─── */}
        {activeTab !== "home" && (
          <div style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }} className="rounded-[2rem] border shadow-xl p-6 md:p-10 animate-fadeIn">
            
            {/* Back to Account Link */}
            <button 
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-1.5 text-xs text-[#0D1512] hover:text-[#0D1512]/80 font-black mb-8 transition uppercase tracking-wider"
            >
              <MdArrowBack className="text-sm" /> Back to Your Account
            </button>

            {/* 1. Orders Panel */}
            {activeTab === "orders" && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] mb-1">Your Orders</h2>
                <p className="text-xs text-[#0D1512]/60 mb-8">Review your historical physical & digital order statements</p>
                
                {loadingOrders ? (
                  <div className="text-center py-10 text-[#0D1512]/50 text-xs font-bold animate-pulse uppercase tracking-widest">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div style={{ background: "#FAF9F6/20", borderColor: "rgba(27, 57, 49, 0.1)" }} className="border border-dashed rounded-2xl p-12 text-center">
                    <p className="text-[#0D1512]/60 text-sm font-medium">You haven't placed any orders yet.</p>
                    <Link to="/products" className="inline-block mt-4 text-xs font-bold text-[#0D1512] hover:underline">
                      Start browsing premium crafts →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((o) => (
                      <div key={o.id} style={{ borderColor: "rgba(27, 57, 49, 0.15)" }} className="border rounded-2xl overflow-hidden shadow-sm bg-white">
                        {/* Header bar */}
                        <div style={{ background: "#FAF9F6/40", borderBottomColor: "rgba(27, 57, 49, 0.1)" }} className="border-b p-4 flex flex-wrap justify-between items-center gap-4">
                          <div className="flex gap-6 text-[11px] text-[#0D1512]/70">
                            <div>
                              <p className="uppercase font-bold text-[9px] tracking-widest text-[#0D1512]/50 mb-0.5">Order Placed</p>
                              <p className="font-bold text-[#0D1512]">
                                {new Date(o.created_at).toLocaleDateString("en-IN", {
                                  year: "numeric", month: "short", day: "numeric"
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="uppercase font-bold text-[9px] tracking-widest text-[#0D1512]/50 mb-0.5">Total Amount</p>
                              <p className="font-extrabold text-[#0D1512]">₹{o.total}</p>
                            </div>
                            <div>
                              <p className="uppercase font-bold text-[9px] tracking-widest text-[#0D1512]/50 mb-0.5">Shipment Type</p>
                              <p className="font-bold text-[#0D1512] capitalize">{o.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="uppercase font-bold text-[9px] tracking-widest text-[#0D1512]/50 mb-0.5">Order #ID</p>
                            <p className="font-mono text-xs font-black text-[#0D1512]">{o.id}</p>
                          </div>
                        </div>
                        {/* Body content */}
                        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider
                                ${STATUS_COLOR[o.status] || "bg-[#FAF9F6] text-[#0D1512] border-[#0D1512]/30"}`}>
                                {o.status}
                              </span>
                            </div>
                            <div className="space-y-1.5 pl-0.5">
                              {o.items?.map((item) => (
                                <p key={item.id} className="text-xs text-[#0D1512] font-semibold">
                                  {item.product_name} <strong className="text-[#0D1512]/40 font-black ml-1">×{item.qty}</strong>
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full md:w-auto">
                            {o.type === "physical" ? (
                              <Link 
                                to={`/track-order?order=${o.order_uid || o.id}`}
                                className="text-center px-4 py-2.5 border border-[#0D1512]/20 hover:border-[#0D1512] text-xs font-bold text-[#0D1512] bg-white rounded-xl transition"
                              >
                                🚚 Track Package
                              </Link>
                            ) : (
                              <button 
                                onClick={() => setActiveTab("digital")}
                                className="text-center px-4 py-2.5 border border-[#0D1512]/20 hover:border-[#0D1512] text-xs font-bold text-[#0D1512] bg-white rounded-xl transition"
                              >
                                💿 Access Download Link
                              </button>
                            )}
                            <a 
                              href={`/invoice/${o.order_uid || o.id}`}
                              target="_blank" 
                              rel="noreferrer"
                              style={{ background: "#0D1512", color: "#FAF9F6" }}
                              className="text-center px-4 py-2.5 text-xs font-bold rounded-xl shadow transition active:scale-95"
                            >
                              🧾 View E-Invoice
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Login & Security Panel */}
            {activeTab === "security" && (
              <div className="max-w-xl">
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] mb-1">Login & Security</h2>
                <p className="text-xs text-[#0D1512]/60 mb-8">Manage your profile details and credential configurations</p>

                {successMsg && (
                  <div style={{ background: "#FAF9F6", borderColor: "rgba(27, 57, 49, 0.2)" }} className="flex items-center gap-2 text-[#0D1512] text-xs px-4 py-3 rounded-xl mb-6 font-semibold border">
                    <MdCheckCircle className="text-base text-green-600" /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                      className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                      className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Phone Number</label>
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                      className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{ background: "#0D1512", color: "#FAF9F6" }}
                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition mt-6 disabled:opacity-50"
                  >
                    <MdSave className="text-base" /> {saving ? "Saving Changes..." : "Save Account Settings"}
                  </button>
                </form>
              </div>
            )}

            {/* 3. Your Addresses Panel */}
            {activeTab === "addresses" && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] mb-1">Your Addresses</h2>
                <p className="text-xs text-[#0D1512]/60 mb-8">Manage shipping locations and destination parameters</p>

                {successMsg && (
                  <div style={{ background: "#FAF9F6", borderColor: "rgba(27, 57, 49, 0.2)" }} className="flex items-center gap-2 text-[#0D1512] text-xs px-4 py-3 rounded-xl mb-6 font-semibold border">
                    <MdCheckCircle className="text-base text-green-600" /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleSave} className="max-w-2xl space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Street Address</label>
                      <input 
                        type="text"
                        value={profile.street_address}
                        onChange={(e) => setProfile({...profile, street_address: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        placeholder="Flat/House No., Building Name, Street"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Apartment/Suite</label>
                      <input 
                        type="text"
                        value={profile.apt_suite}
                        onChange={(e) => setProfile({...profile, apt_suite: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        placeholder="Apt., Suite, Block, etc."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Pincode</label>
                      <input 
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        placeholder="600001"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">City</label>
                      <input 
                        type="text"
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        placeholder="e.g. New Delhi"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">State</label>
                      <input 
                        type="text"
                        value={profile.state}
                        onChange={(e) => setProfile({...profile, state: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                        placeholder="e.g. Delhi"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">Country</label>
                      <select 
                        value={profile.country}
                        onChange={(e) => setProfile({...profile, country: e.target.value})}
                        style={{ borderColor: "rgba(27, 57, 49, 0.2)" }}
                        className="w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                      >
                        <option value="India">🇮🇳 India</option>
                        <option value="United States">🇺🇸 United States</option>
                        <option value="United Kingdom">🇬🇧 United Kingdom</option>
                        <option value="Australia">🇦🇺 Australia</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                        <option value="Singapore">🇸🇬 Singapore</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Japan">🇯🇵 Japan</option>
                        <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                        <option value="Qatar">🇶🇦 Qatar</option>
                        <option value="Malaysia">🇲🇾 Malaysia</option>
                        <option value="New Zealand">🇳🇿 New Zealand</option>
                        <option value="Other">🌐 Other Country</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{ background: "#0D1512", color: "#FAF9F6" }}
                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-xs font-black tracking-wider uppercase shadow-lg active:scale-95 transition mt-6 disabled:opacity-50"
                  >
                    <MdSave className="text-base" /> {saving ? "Saving Changes..." : "Save Delivery Location"}
                  </button>
                </form>
              </div>
            )}

            {/* 4. Digital Purchases Panel */}
            {activeTab === "digital" && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] mb-1">Digital Purchases</h2>
                <p className="text-xs text-[#0D1512]/60 mb-8">Instantly access and redownload your acquired digital assets</p>
                
                {loadingOrders ? (
                  <div className="text-center py-10 text-[#0D1512]/50 text-xs font-bold animate-pulse uppercase tracking-widest">Loading items...</div>
                ) : orders.filter(o => o.type === "digital").length === 0 ? (
                  <div style={{ background: "#FAF9F6/20", borderColor: "rgba(27, 57, 49, 0.1)" }} className="border border-dashed rounded-2xl p-12 text-center">
                    <p className="text-[#0D1512]/60 text-sm font-medium">You haven't bought any digital products yet.</p>
                    <Link to="/digital" className="inline-block mt-4 text-xs font-bold text-[#0D1512] hover:underline">
                      Explore digital plans & bundles →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.filter(o => o.type === "digital").map((o) => (
                      <div key={o.id} style={{ borderColor: "rgba(27, 57, 49, 0.15)" }} className="border rounded-2xl p-6 shadow-sm bg-[#FAF9F6]/10">
                        <div className="flex justify-between items-start border-b border-[#0D1512]/10 pb-3 mb-4">
                          <div>
                            <p className="font-black text-[#0D1512] text-sm">Order #{o.id}</p>
                            <p className="text-[10px] text-[#0D1512]/60 mt-0.5">Purchased on {new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-black px-2 py-0.5 rounded uppercase">
                            Paid ✓
                          </span>
                        </div>
                        <div className="space-y-4">
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-4 flex-wrap">
                              <div>
                                <p className="text-xs font-bold text-[#0D1512]">{item.product_name}</p>
                                <p className="text-[9px] text-[#0D1512]/50 mt-0.5 font-mono">UID: {item.product_uid}</p>
                              </div>
                              <a 
                                href={`${API.defaults.baseURL}/digital-products/download/${item.product_uid}`} 
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: "#0D1512", color: "#FAF9F6" }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-wider uppercase transition shadow active:scale-95"
                              >
                                <MdCloudDownload /> Download File
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Your Wishlist Panel */}
            {activeTab === "wishlist" && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-black text-[#0D1512] mb-1">Your Wishlist</h2>
                <p className="text-xs text-[#0D1512]/60 mb-8">Manage your saved crafts and premium items</p>

                {loadingWishlist ? (
                  <div className="text-center py-10 text-[#0D1512]/50 text-xs font-bold animate-pulse uppercase tracking-widest">Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                  <div style={{ background: "#FAF9F6/20", borderColor: "rgba(27, 57, 49, 0.1)" }} className="border border-dashed rounded-2xl p-12 text-center">
                    <p className="text-[#0D1512]/60 text-sm font-medium">Your wishlist is currently empty.</p>
                    <Link to="/products" className="inline-block mt-4 text-xs font-bold text-[#0D1512] hover:underline">
                      Go add premium products →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} style={{ borderColor: "rgba(27, 57, 49, 0.12)" }} className="border rounded-2xl overflow-hidden shadow-md flex flex-col bg-white hover:shadow-lg transition">
                        <div className="aspect-square bg-stone-100 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                          {(item.product_image || item.digital_image) ? (
                            <img 
                              src={item.product_image || item.digital_image} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl">{item.product_type === "digital" ? "📦" : "🪵"}</span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <p className="text-[10px] font-black text-[#0D1512] uppercase tracking-widest mb-1.5 capitalize">
                            {item.product_type} Product
                          </p>
                          <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="font-bold text-[#0D1512] text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-2">
                            {item.product_type === "digital" ? item.digital_name : item.product_name}
                          </h3>
                          <p className="font-black text-[#0D1512] text-lg mb-4">
                            ₹{item.product_type === "digital" ? item.digital_price : item.product_price}
                          </p>

                          <div className="flex flex-col gap-2 mt-auto">
                            <button
                              onClick={() => handleAddWishlistToCart(item)}
                              style={{ background: "#0D1512", color: "#FAF9F6" }}
                              className="w-full py-2.5 font-bold text-xs rounded-xl shadow active:scale-95 transition flex items-center justify-center gap-1.5"
                            >
                              🛒 Add to Cart
                            </button>
                            <button
                              onClick={() => handleRemoveWishlist(item.id)}
                              className="w-full py-2.5 text-center text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl border border-transparent hover:border-red-200 transition"
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}