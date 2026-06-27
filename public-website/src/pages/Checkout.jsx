import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api";
import Navbar from "../components/Navbar";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { member } = useMember();
  const { convert, selected } = useCurrency();
  const navigate = useNavigate();
  const shipping = total >= 999 ? 0 : 60;

  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: "",
    address: "",
  });
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (!form.name || !form.email || !form.address) return;
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        product_id: i.type === "physical" ? i.id : null,
        digital_product_id: i.type === "digital" ? i.id : null,
        product_uid: i.product_uid,
        product_name: i.name,
        price: i.price,
        qty: i.qty,
        type: i.type,
      }));
      const res = await API.post("/orders", {
        member_id: member?.id || null,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: form.phone,
        items,
        address_line: form.address,
        shipping_fee: shipping,
      });
      clearCart();
      navigate(`/order-success?id=${res.data.order_id}`);
    } catch {
      alert("Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ background: "#FAF9F6", color: "#0D1512", fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen">
      <SEO 
        title="Secure Checkout" 
        description="Complete your order securely and verify your details for custom-engraved premium designs and digital assets." 
        keywords="checkout, pay commission, billing details"
      />
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-3xl font-black mb-8 tracking-tight"
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Delivery Details Form */}
          <div 
            style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
            className="lg:col-span-2 rounded-3xl border p-6 md:p-8 shadow-sm flex flex-col gap-5"
          >
            <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold tracking-tight">Delivery Details</h3>
            
            {[
              { key: "name", label: "Full Name", placeholder: "Your full name" },
              { key: "email", label: "Email Address", placeholder: "your@email.com" },
              { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                />
              </div>
            ))}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Full Delivery Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="House no, Street, City, State, Pincode"
                className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] resize-none"
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="w-full">
            <div 
              style={{ background: "white", borderColor: "rgba(27, 57, 49, 0.15)" }}
              className="rounded-3xl border p-6 shadow-md sticky top-6 flex flex-col gap-4"
            >
              <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-black tracking-tight mb-2">Order summary</h3>
              
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                {cart.map((i) => (
                  <div key={`${i.id}-${i.type}`} className="flex justify-between text-xs font-semibold">
                    <span className="truncate flex-1 mr-2 opacity-85">{i.name} × {i.qty}</span>
                    <span className="text-[#0D1512]">{convert(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 flex flex-col gap-2.5">
                <div className="flex justify-between text-xs font-semibold opacity-75">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? "Free" : convert(shipping)}</span>
                </div>
                <div className="flex justify-between font-black text-lg text-[#0D1512] pt-1">
                  <span>Total</span>
                  <span>{convert(total + shipping)}</span>
                </div>
              </div>

              {selected.currency_code !== "INR" && (
                <div className="bg-[#FAF9F6]/60 border border-[#0D1512]/10 rounded-xl p-3 text-[10px] leading-relaxed text-[#0D1512]/75">
                  ℹ️ Your card will be processed in Indian Rupees (INR) at the store base rate: <strong>₹{total + shipping}</strong>.
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={placing || cart.length === 0}
                style={{ background: "#0D1512", color: "#FAF9F6" }}
                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all mt-2 disabled:opacity-50"
              >
                {placing ? "Placing order..." : `Pay ₹${total + shipping}`}
              </button>
              
              <p className="text-[10px] text-stone-400 text-center font-bold uppercase tracking-widest mt-1">
                Pay via cash on delivery / cards
              </p>
            </div>

            {/* High-attention Square Brand Ad */}
            <div className="mt-6">
              <AdBanner placement="Square Tile" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}