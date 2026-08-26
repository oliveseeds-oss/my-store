import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api";
import Navbar from "../components/Navbar";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const loadPayPalScript = (clientId, currency) => {
  return new Promise((resolve) => {
    const id = "paypal-sdk-script";
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
      if (window.paypal) {
        try {
          delete window.paypal;
        } catch (e) {
          window.paypal = undefined;
        }
      }
    }
    
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
    delivery_street: "",
    delivery_apt: "",
    delivery_city: "",
    delivery_state: "",
    delivery_country: "India",
    delivery_pincode: "",
  });

  // Check if cart contains physical items
  const hasPhysicalItems = cart.some(i => i.type === "physical" || !i.type);

  // 18 Allowed Physical Shipping Destinations with Dial Codes & Flags
  const PHYSICAL_COUNTRIES = [
    { name: "Australia", code: "+61", flag: "🇦🇺" },
    { name: "Bahrain", code: "+973", flag: "🇧🇭" },
    { name: "Belgium", code: "+32", flag: "🇧🇪" },
    { name: "Canada", code: "+1", flag: "🇨🇦" },
    { name: "France", code: "+33", flag: "🇫🇷" },
    { name: "Germany", code: "+49", flag: "🇩🇪" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "Kuwait", code: "+965", flag: "🇰🇼" },
    { name: "Malaysia", code: "+60", flag: "🇲🇾" },
    { name: "Netherlands", code: "+31", flag: "🇳🇱" },
    { name: "New Zealand", code: "+64", flag: "🇳🇿" },
    { name: "Norway", code: "+47", flag: "🇳🇴" },
    { name: "Qatar", code: "+974", flag: "🇶🇦" },
    { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
    { name: "Singapore", code: "+65", flag: "🇸🇬" },
    { name: "Switzerland", code: "+41", flag: "🇨🇭" },
    { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
    { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
    { name: "United States", code: "+1", flag: "🇺🇸" },
  ];

  // Extended World List for Digital Products (Complete International Nations)
  const ALL_COUNTRIES = [
    ...PHYSICAL_COUNTRIES,
    { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
    { name: "Albania", code: "+355", flag: "🇦🇱" },
    { name: "Algeria", code: "+213", flag: "🇩🇿" },
    { name: "Argentina", code: "+54", flag: "🇦🇷" },
    { name: "Armenia", code: "+374", flag: "🇦🇲" },
    { name: "Austria", code: "+43", flag: "🇦🇹" },
    { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
    { name: "Bhutan", code: "+975", flag: "🇧🇹" },
    { name: "Brazil", code: "+55", flag: "🇧🇷" },
    { name: "Chile", code: "+56", flag: "🇨🇱" },
    { name: "China", code: "+86", flag: "🇨🇳" },
    { name: "Colombia", code: "+57", flag: "🇨🇴" },
    { name: "Denmark", code: "+45", flag: "🇩🇰" },
    { name: "Egypt", code: "+20", flag: "🇪🇬" },
    { name: "Finland", code: "+358", flag: "🇫🇮" },
    { name: "Greece", code: "+30", flag: "🇬🇷" },
    { name: "Hong Kong", code: "+852", flag: "🇭🇰" },
    { name: "Hungary", code: "+36", flag: "🇭🇺" },
    { name: "Indonesia", code: "+62", flag: "🇮🇩" },
    { name: "Ireland", code: "+353", flag: "🇮🇪" },
    { name: "Israel", code: "+972", flag: "🇮🇱" },
    { name: "Italy", code: "+39", flag: "🇮🇹" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
    { name: "Jordan", code: "+962", flag: "🇯🇴" },
    { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
    { name: "Kenya", code: "+254", flag: "🇰🇪" },
    { name: "Maldives", code: "+960", flag: "🇲🇻" },
    { name: "Mexico", code: "+52", flag: "🇲🇽" },
    { name: "Nepal", code: "+977", flag: "🇳🇵" },
    { name: "Nigeria", code: "+234", flag: "🇳🇬" },
    { name: "Oman", code: "+968", flag: "🇴🇲" },
    { name: "Pakistan", code: "+92", flag: "🇵🇰" },
    { name: "Philippines", code: "+63", flag: "🇵🇭" },
    { name: "Poland", code: "+48", flag: "🇵🇱" },
    { name: "Portugal", code: "+351", flag: "🇵🇹" },
    { name: "Romania", code: "+40", flag: "🇷🇴" },
    { name: "South Africa", code: "+27", flag: "🇿🇦" },
    { name: "South Korea", code: "+82", flag: "🇰🇷" },
    { name: "Spain", code: "+34", flag: "🇪🇸" },
    { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
    { name: "Sweden", code: "+46", flag: "🇸🇪" },
    { name: "Taiwan", code: "+886", flag: "🇹🇼" },
    { name: "Thailand", code: "+66", flag: "🇹🇭" },
    { name: "Turkey", code: "+90", flag: "🇹🇷" },
    { name: "Vietnam", code: "+84", flag: "🇻🇳" },
    { name: "Other Country", code: "+1", flag: "🌐" },
  ];

  const availableCountries = hasPhysicalItems ? PHYSICAL_COUNTRIES : ALL_COUNTRIES;
  const [phoneCode, setPhoneCode] = useState("+91");
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(selected.currency_code === "INR" ? "razorpay" : "paypal");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    API.get("/settings")
      .then(res => setSiteSettings(res.data))
      .catch(err => console.error("Failed to load settings keys", err));
  }, []);

  useEffect(() => {
    if (member) {
      API.get("/members/profile")
        .then(res => {
          const p = res.data;
          setForm(prev => ({
            ...prev,
            name: p.full_name || p.name || prev.name,
            email: p.email || prev.email,
            phone: p.phone || prev.phone || "",
            delivery_street: p.street_address || "",
            delivery_apt: p.apt_suite || "",
            delivery_city: p.city || "",
            delivery_state: p.state || "",
            delivery_country: p.country || "India",
            delivery_pincode: p.pincode || "",
          }));
        })
        .catch(err => console.error("Failed to load member profile info", err));
    }
  }, [member]);

  useEffect(() => {
    if (!siteSettings || paymentMethod !== "paypal") return;
    const paypalCurrency = selected.currency_code === "INR" ? "USD" : selected.currency_code;
    const clientId = siteSettings.paypal_client_id;
    if (!clientId || clientId === "sb" || clientId.includes("your_paypal")) {
      console.warn("PayPal Client ID is missing or default. PayPal Gateway disabled.");
      return;
    }
    setPaypalLoaded(false);
    loadPayPalScript(clientId, paypalCurrency)
      .then(success => {
        if (success && window.paypal) {
          setPaypalLoaded(true);
        }
      });
  }, [siteSettings, selected.currency_code, paymentMethod]);

  useEffect(() => {
    if (paymentMethod === "paypal" && paypalLoaded && window.paypal && document.getElementById("paypal-button-container")) {
      document.getElementById("paypal-button-container").innerHTML = "";
      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            const isINR = selected.currency_code === "INR";
            const currencyCode = isINR ? "USD" : selected.currency_code;
            const rateMultiplier = isINR ? 0.012 : selected.rate_to_inr;
            const convertedVal = ((total + shipping) * rateMultiplier).toFixed(2);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: currencyCode,
                  value: convertedVal
                }
              }]
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            await placeOrder({
              mode: "PayPal",
              transactionId: details.id
            });
          },
          onError: (err) => {
            console.error("PayPal processing error:", err);
            alert("PayPal encountered a processing error. Please try again.");
          }
        }).render("#paypal-button-container");
      } catch (e) {
        console.error("Failed to render PayPal buttons:", e);
      }
    }
  }, [paymentMethod, paypalLoaded, total, shipping, selected]);

  const placeOrder = async (gatewayDetails = null) => {
    if (!form.name || !form.email || !form.delivery_street || !form.delivery_city || !form.delivery_state || !form.delivery_pincode) {
      alert("Please fill in all required delivery details (Name, Email, Street, City, State, and Pincode) first.");
      return;
    }
    const formattedAddressLine = [
      form.delivery_street,
      form.delivery_apt,
      form.delivery_city,
      form.delivery_state,
      form.delivery_country,
      form.delivery_pincode
    ].filter(Boolean).join(", ");

    const fullPhone = form.phone ? `${phoneCode} ${form.phone.trim()}` : "";

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
        selected_size: i.selectedSize || null,
        customizations: i.customizations || []
      }));
      const res = await API.post("/orders", {
        member_id: member?.id || null,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: fullPhone,
        items,
        address_line: formattedAddressLine,
        delivery_street: form.delivery_street,
        delivery_apt: form.delivery_apt,
        delivery_city: form.delivery_city,
        delivery_state: form.delivery_state,
        delivery_country: form.delivery_country,
        delivery_pincode: form.delivery_pincode,
        shipping_fee: shipping,
        payment_mode: gatewayDetails?.mode || "COD",
        transaction_id: gatewayDetails?.transactionId || null,
        currency_code: selected.currency_code,
        currency_rate: selected.rate_to_inr
      });
      clearCart();
      navigate(`/order-success?id=${res.data.order_id}`);
    } catch {
      alert("Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!form.name || !form.email || !form.delivery_street || !form.delivery_city || !form.delivery_state || !form.delivery_pincode) {
      alert("Please fill in all required delivery details (Name, Email, Street, City, State, and Pincode) first.");
      return;
    }
    const formattedAddressLine = [
      form.delivery_street,
      form.delivery_apt,
      form.delivery_city,
      form.delivery_state,
      form.delivery_country,
      form.delivery_pincode
    ].filter(Boolean).join(", ");
    const fullPhone = form.phone ? `${phoneCode} ${form.phone.trim()}` : "";

    setPlacing(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Failed to load Razorpay Payment Gateway. Check your connectivity.");
      setPlacing(false);
      return;
    }

    try {
      const orderPayload = {
        member_id: member?.id || null,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: fullPhone,
        items: cart.map(i => ({
          product_id: i.type === "physical" ? i.id : null,
          digital_product_id: i.type === "digital" ? i.id : null,
          product_uid: i.product_uid,
          product_name: i.name,
          price: i.price,
          qty: i.qty,
          type: i.type,
          selected_size: i.selectedSize || null,
          customizations: i.customizations || []
        })),
        address_line: formattedAddressLine,
        delivery_street: form.delivery_street,
        delivery_apt: form.delivery_apt,
        delivery_city: form.delivery_city,
        delivery_state: form.delivery_state,
        delivery_country: form.delivery_country,
        delivery_pincode: form.delivery_pincode,
        currency_code: selected.currency_code || "INR",
        shipping_fee: shipping
      };

      const createRes = await API.post("/payments/orders/create", orderPayload);
      const { razorpay_order_id, amount, currency, key_id, order_id } = createRes.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: siteSettings?.site_name || "Oliveseeds Customs",
        description: "Secure Order Payment",
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await API.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.success) {
              clearCart();
              navigate(`/order-success?id=${order_id}`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            alert("Verification request failed: " + (verifyErr.response?.data?.error || verifyErr.message));
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: "#d97706"
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Razorpay checkout failed to initialize: " + (err.response?.data?.error || err.message));
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
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="bg-white border border-[#0D1512]/20 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] shrink-0 font-mono"
                >
                  {availableCountries.map(c => (
                    <option key={`${c.name}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98765 43210"
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Street Address *</label>
              <input
                value={form.delivery_street}
                onChange={(e) => setForm({ ...form, delivery_street: e.target.value })}
                placeholder="House No., Street name, Area"
                className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Apartment, suite, unit, floor (Optional)</label>
              <input
                value={form.delivery_apt}
                onChange={(e) => setForm({ ...form, delivery_apt: e.target.value })}
                placeholder="Apt, Suite, Unit, etc."
                className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">City *</label>
                <input
                  value={form.delivery_city}
                  onChange={(e) => setForm({ ...form, delivery_city: e.target.value })}
                  placeholder="City"
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">State *</label>
                <input
                  value={form.delivery_state}
                  onChange={(e) => setForm({ ...form, delivery_state: e.target.value })}
                  placeholder="State"
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">
                  Country * {hasPhysicalItems && <span className="text-amber-700 text-[9px] font-semibold">(18 Physical Shipping Destinations)</span>}
                </label>
                <select
                  value={form.delivery_country}
                  onChange={(e) => setForm({ ...form, delivery_country: e.target.value })}
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                >
                  {availableCountries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5 block">Pincode / Postal Code *</label>
                <input
                  value={form.delivery_pincode}
                  onChange={(e) => setForm({ ...form, delivery_pincode: e.target.value })}
                  placeholder="110001"
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512]"
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t border-stone-150 pt-5 mt-3">
              <h4 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-stone-700 mb-3">Secure Payment Methods Available</h4>
              <div className="p-4 border border-[#0D1512]/15 bg-white rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-black">💳 Online Payments Gateways Enabled</span>
                <span className="text-[11px] text-stone-600 font-semibold leading-relaxed">
                  We securely accept Debit Cards, Credit Cards (Visa, Mastercard, RuPay, etc.), UPI, and Netbanking via <strong>Razorpay</strong> for domestic orders, and international card payments via <strong>PayPal</strong>.
                </span>
              </div>
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
                  <div key={`${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`} className="flex flex-col text-xs font-semibold border-b border-stone-50 pb-1.5 mb-1.5 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between">
                      <span className="truncate flex-1 mr-2 opacity-85">{i.name} × {i.qty}</span>
                      <span className="text-[#0D1512]">{convert(i.price * i.qty)}</span>
                    </div>
                    {i.customizationSummary && (
                      <span className="text-[10px] text-amber-800 font-bold mt-0.5">✒️ {i.customizationSummary}</span>
                    )}
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
                  ℹ️ Transactions are processed securely in your currency: <strong>{convert(total + shipping)}</strong>.
                </div>
              )}

              {/* Payment Method Option Selector */}
              <div className="mt-4 mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-2 block">Choose Payment Gateway</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-3.5 rounded-xl border text-left transition-all ${paymentMethod === "razorpay" ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-stone-200 bg-white hover:bg-stone-50"}`}
                  >
                    <div className="font-bold text-xs text-stone-800">💳 Razorpay</div>
                    <div className="text-[9px] text-stone-500 mt-0.5">Cards, UPI, Netbanking</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-3.5 rounded-xl border text-left transition-all ${paymentMethod === "paypal" ? "border-amber-500 bg-amber-50/50 shadow-sm" : "border-stone-200 bg-white hover:bg-stone-50"}`}
                  >
                    <div className="font-bold text-xs text-stone-800">🅿️ PayPal</div>
                    <div className="text-[9px] text-stone-500 mt-0.5">International Wallet & Cards</div>
                  </button>
                </div>
              </div>

              <div className="mt-2">
                {paymentMethod === "razorpay" ? (
                  <>
                    <button
                      onClick={handleRazorpayPayment}
                      disabled={placing || cart.length === 0}
                      style={{ background: "#d97706", color: "#ffffff" }}
                      className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {placing ? "Processing..." : `Pay ${convert(total + shipping)} via Razorpay`}
                    </button>
                    <p className="text-[9px] text-stone-400 text-center font-bold uppercase tracking-widest mt-1.5">
                      Secure Debit/Credit Card, UPI, Netbanking
                    </p>
                  </>
                ) : (
                  <div className="mt-1">
                    {!paypalLoaded ? (
                      <div className="text-center py-3 text-xs text-stone-400 font-bold">
                        ⏳ Loading PayPal checkout Buttons...
                      </div>
                    ) : null}
                    <div id="paypal-button-container" className="min-h-[50px] w-full"></div>
                    <p className="text-[9px] text-stone-400 text-center font-bold uppercase tracking-widest mt-1.5">
                      Pay via PayPal, Credit/Debit cards
                    </p>
                  </div>
                )}
              </div>
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