import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMember } from "../context/MemberContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../api";
import Navbar from "../components/Navbar";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import SmartAddressForm from "../components/SmartAddressForm";
import { Country } from "country-state-city";
import { trackGA4Event } from "../utils/ga4";

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
  
  // Dynamic Shipping Charges Management (Step 5)
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingZoneInfo, setShippingZoneInfo] = useState("");
  const [shippingError, setShippingError] = useState("");

  const shipping = selectedMethod
    ? (selectedMethod.is_free ? 0 : (selectedMethod.shipping_cost_inr !== undefined ? selectedMethod.shipping_cost_inr : selectedMethod.shipping_cost))
    : (total >= 999 ? 0 : 60);

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

  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [enabledCountryCodes, setEnabledCountryCodes] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(selected.currency_code === "INR" ? "razorpay" : "paypal");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponErr, setCouponErr] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMsg("");
    setCouponErr("");
    try {
      const res = await API.post("/coupons/validate", {
        code: couponCode.trim(),
        cart_total: total,
        user_id: member?.id || null
      });
      if (res.data.valid) {
        setCouponDiscount(res.data.discount_amount);
        setCouponMsg(res.data.message);
        setCouponApplied(true);
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponApplied(false);
      setCouponErr(err.response?.data?.error || "Invalid coupon code");
    }
  };

  // Check if cart contains physical items
  const hasPhysicalItems = cart.some(i => i.type === "physical" || !i.type);

  useEffect(() => {
    if (!member) {
      navigate("/login?redirect=/checkout");
      return;
    }
    // Fetch enabled shipping countries list (Update 1 & 3)
    API.get("/shipping-countries/enabled")
      .then((res) => {
        const codes = (res.data || []).map((c) => c.country_code.toUpperCase());
        setEnabledCountryCodes(codes);
      })
      .catch((err) => console.error("Failed to load enabled shipping countries", err));

    API.get("/settings")
      .then((res) => setSiteSettings(res.data))
      .catch((err) => console.error("Failed to load settings keys", err));

    trackGA4Event("begin_checkout", {
      currency: "INR",
      value: total,
      items: cart.map(i => ({ item_id: i.id, item_name: i.name, quantity: i.qty }))
    });
  }, []);

  useEffect(() => {
    if (member) {
      API.get("/members/profile")
        .then((res) => {
          const p = res.data;
          const hasAddr = !!(p.street_address && p.city && p.country);
          setHasSavedAddress(hasAddr);

          setForm((prev) => ({
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
        .catch((err) => console.error("Failed to load member profile info", err));
    }
  }, [member]);

  // Step 5: Automatically calculate shipping rates when delivery country or cart changes
  useEffect(() => {
    if (!hasPhysicalItems) {
      setShippingMethods([]);
      setSelectedMethod(null);
      setShippingZoneInfo("");
      setShippingError("");
      return;
    }

    let isMounted = true;
    const fetchShippingRates = async () => {
      setShippingLoading(true);
      setShippingError("");

      const countryName = form.delivery_country || "India";
      const selectedCountryObj = Country.getAllCountries().find(
        (c) =>
          c.name.toLowerCase() === countryName.toLowerCase() ||
          c.isoCode.toLowerCase() === countryName.toLowerCase()
      );
      const code = selectedCountryObj?.isoCode?.toUpperCase() || (countryName.toLowerCase() === "india" ? "IN" : "IN");

      try {
        const physicalItems = cart.filter((i) => i.type === "physical" || !i.type);
        const weightPromises = physicalItems.map((item) =>
          API.get(`/shipping-rates/product-weights/${item.id}`)
            .then((res) => (parseInt(res.data?.weight_grams, 10) || 500) * (item.qty || 1))
            .catch(() => 500 * (item.qty || 1))
        );
        const weights = await Promise.all(weightPromises);
        const totalWeight = weights.reduce((acc, w) => acc + w, 0) || 500;

        const res = await API.post("/shipping-rates/calculate", {
          country_code: code,
          total_weight_grams: totalWeight,
          order_value: total,
          currency_code: selected.currency_code || "INR"
        });

        if (!isMounted) return;

        if (res.data && res.data.methods && res.data.methods.length > 0) {
          setShippingMethods(res.data.methods);
          setShippingZoneInfo(res.data.zone || "");
          setSelectedMethod((prev) => {
            const match = res.data.methods.find((m) => m.method_id === prev?.method_id);
            return match || res.data.methods[0];
          });
        } else {
          setShippingMethods([]);
          setSelectedMethod(null);
          setShippingZoneInfo("");
          setShippingError("Shipping to your country is not available. Please contact us.");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Shipping calculate error:", err);
        setShippingError("Shipping calculation unavailable for this location.");
      } finally {
        if (isMounted) setShippingLoading(false);
      }
    };

    fetchShippingRates();
    return () => {
      isMounted = false;
    };
  }, [form.delivery_country, cart, total, selected.currency_code, hasPhysicalItems]);

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

  const checkShippingEligibility = () => {
    if (!form.name || !form.email || !form.delivery_street || !form.delivery_city || !form.delivery_state) {
      alert("Please fill in all required delivery details first.");
      return false;
    }

    if (hasPhysicalItems && enabledCountryCodes.length > 0) {
      const selectedCountryObj = Country.getAllCountries().find(
        (c) =>
          c.name.toLowerCase() === (form.delivery_country || "").toLowerCase() ||
          c.isoCode.toLowerCase() === (form.delivery_country || "").toLowerCase()
      );
      const iso = selectedCountryObj?.isoCode?.toUpperCase();
      if (iso && !enabledCountryCodes.includes(iso)) {
        alert("We currently do not ship physical products to your country.");
        return false;
      }
    }
    return true;
  };

  const placeOrder = async (gatewayDetails = null) => {
    if (!checkShippingEligibility()) return;

    const formattedAddressLine = [
      form.delivery_street,
      form.delivery_apt,
      form.delivery_city,
      form.delivery_state,
      form.delivery_country,
      form.delivery_pincode
    ].filter(Boolean).join(", ");

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
        address_line: formattedAddressLine,
        delivery_street: form.delivery_street,
        delivery_apt: form.delivery_apt,
        delivery_city: form.delivery_city,
        delivery_state: form.delivery_state,
        delivery_country: form.delivery_country,
        delivery_pincode: form.delivery_pincode,
        shipping_fee: shipping,
        shipping_method_id: selectedMethod?.method_id || null,
        shipping_method_name: selectedMethod?.method_name || null,
        shipping_cost: shipping,
        shipping_zone: shippingZoneInfo || null,
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
    if (!checkShippingEligibility()) return;

    const formattedAddressLine = [
      form.delivery_street,
      form.delivery_apt,
      form.delivery_city,
      form.delivery_state,
      form.delivery_country,
      form.delivery_pincode
    ].filter(Boolean).join(", ");

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
        shipping_fee: shipping,
        shipping_method_id: selectedMethod?.method_id || null,
        shipping_method_name: selectedMethod?.method_name || null,
        shipping_cost: shipping,
        shipping_zone: shippingZoneInfo || null
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
            
            {hasSavedAddress ? (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs text-[#0D1512] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-stone-500">Saved Member Address</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Default Shipping</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0D1512]">{form.name}</p>
                  <p className="text-stone-600 mt-0.5">{form.email} • {form.phone}</p>
                  <p className="text-stone-700 font-medium mt-2">
                    {[form.delivery_street, form.delivery_apt, form.delivery_city, form.delivery_state, form.delivery_country, form.delivery_pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-200">
                  <Link to="/profile?tab=addresses" className="text-amber-700 hover:text-amber-800 text-xs font-bold underline inline-flex items-center gap-1">
                    Wrong address? Update in Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <SmartAddressForm
                form={{
                  name: form.name,
                  phone: form.phone,
                  delivery_street: form.delivery_street,
                  delivery_apt: form.delivery_apt,
                  delivery_city: form.delivery_city,
                  delivery_state: form.delivery_state,
                  country: form.delivery_country,
                  delivery_pincode: form.delivery_pincode
                }}
                onChange={(updated) => {
                  setForm({
                    ...form,
                    name: updated.name || form.name,
                    phone: updated.phone,
                    delivery_street: updated.delivery_street,
                    delivery_apt: updated.delivery_apt,
                    delivery_city: updated.delivery_city,
                    delivery_state: updated.delivery_state,
                    delivery_country: updated.country,
                    delivery_pincode: updated.delivery_pincode
                  });
                }}
                enabledCountryCodes={enabledCountryCodes}
                isPhysical={hasPhysicalItems}
              />
            )}

            {/* Shipping Method Selection Section (Step 5) */}
            {hasPhysicalItems && (
              <div className="border-t border-stone-150 pt-5 mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <span>🚚</span> Select Shipping Method
                  </h4>
                  {shippingZoneInfo && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {shippingZoneInfo}
                    </span>
                  )}
                </div>

                {shippingLoading ? (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500 font-medium flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Calculating best shipping options for {form.delivery_country}...
                  </div>
                ) : shippingError ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-bold">
                    ⚠️ {shippingError}
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-700 font-bold">
                    Shipping to your country is not available. Please contact us.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {/* Free shipping banner if applicable */}
                    {selectedMethod?.is_free || shippingMethods.every(m => m.is_free) ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span>🎉</span> Free shipping on your order!
                      </div>
                    ) : selectedMethod?.free_shipping_above ? (
                      <div className="bg-stone-50 border border-stone-200 text-stone-600 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                        <span>✅</span> Free shipping on orders above {convert(selectedMethod.free_shipping_above)}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 gap-2.5">
                      {shippingMethods.map((m) => {
                        const isSelected = selectedMethod?.method_id === m.method_id;
                        return (
                          <label
                            key={m.method_id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-300"
                                : "border-stone-200 bg-white hover:bg-stone-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethod(m)}
                                className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-xs text-stone-900 block">{m.method_name}</span>
                                <span className="text-[10px] text-stone-500 font-medium">{m.estimated_days}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              {m.is_free ? (
                                <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                  FREE
                                </span>
                              ) : (
                                <span className="text-xs font-black text-stone-900 font-mono">
                                  {convert(m.shipping_cost_inr)}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

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

              {/* Coupon Code Section (Feature 3) */}
              <div className="border-t border-stone-100 pt-3 flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-75">Discount Coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    disabled={couponApplied}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500 disabled:bg-stone-100"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition shrink-0"
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {couponMsg && <p className="text-[11px] text-emerald-600 font-bold">{couponMsg}</p>}
                {couponErr && <p className="text-[11px] text-rose-500 font-bold">{couponErr}</p>}
              </div>

              <div className="border-t border-stone-100 pt-4 flex flex-col gap-2.5">
                <div className="flex justify-between text-xs font-semibold opacity-75">
                  <span>Shipping Fee {selectedMethod ? `(${selectedMethod.method_name})` : ""}</span>
                  <span>{shipping === 0 ? "Free" : convert(shipping)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>- {convert(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-lg text-[#0D1512] pt-1">
                  <span>Total</span>
                  <span>{convert(Math.max(0, total + shipping - couponDiscount))}</span>
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