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
    if (existing) existing.remove();
    
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
    address: "",
  });
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
    if (!siteSettings) return;
    const paypalCurrency = selected.currency_code === "INR" ? "USD" : selected.currency_code;
    loadPayPalScript(siteSettings.paypal_client_id, paypalCurrency)
      .then(success => {
        if (success && window.paypal) {
          setPaypalLoaded(true);
        }
      });
  }, [siteSettings, selected.currency_code]);

  useEffect(() => {
    if (paypalLoaded && window.paypal && document.getElementById("paypal-button-container")) {
      document.getElementById("paypal-button-container").innerHTML = "";
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
          alert("PayPal encounter validation or system failures. Please try again.");
        }
      }).render("#paypal-button-container");
    }
  }, [paypalLoaded, total, shipping, selected]);

  const placeOrder = async (gatewayDetails = null) => {
    if (!form.name || !form.email || !form.address) {
      alert("Please fill in delivery details first.");
      return;
    }
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
        guest_phone: form.phone,
        items,
        address_line: form.address,
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
    if (!form.name || !form.email || !form.address) {
      alert("Please fill in delivery details first.");
      return;
    }
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
        guest_phone: form.phone,
        items: cart.map(i => ({
          product_id: i.id,
          product_uid: i.product_uid,
          product_name: i.name,
          price: i.price,
          qty: i.qty,
          type: i.type,
          selected_size: i.selectedSize || null,
          customizations: i.customizations || []
        })),
        address_line: form.address,
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