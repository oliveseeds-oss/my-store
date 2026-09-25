import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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

import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
  usePayPal,
  INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";

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

const PAYPAL_SUPPORTED_CURRENCIES = new Set([
  "AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS",
  "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD",
  "SEK", "CHF", "THB", "USD"
]);

function PayPalButtonSection({
  total,
  shipping,
  couponDiscount,
  selected,
  currencies,
  form,
  placeOrder,
  setPaymentMethod,
  checkShippingEligibility
}) {
  const { loadingStatus, error } = usePayPal();
  const isSupported = PAYPAL_SUPPORTED_CURRENCIES.has(selected?.currency_code);
  const activePaypalCurrency = isSupported ? selected.currency_code : "USD";

  const cleanTotal = Number(total) || 0;
  const cleanShipping = Number(shipping) || 0;
  const cleanDiscount = Number(couponDiscount) || 0;
  const payableInINR = Math.max(1, cleanTotal + cleanShipping - cleanDiscount);

  let rateMultiplier = 0.012;
  if (isSupported && selected?.rate_to_inr && selected.currency_code !== "INR") {
    rateMultiplier = parseFloat(selected.rate_to_inr) || 0.012;
  } else if (Array.isArray(currencies) && currencies.length > 0) {
    const usdMatch = currencies.find((c) => c.currency_code === "USD");
    if (usdMatch?.rate_to_inr) {
      rateMultiplier = parseFloat(usdMatch.rate_to_inr) || 0.012;
    }
  }

  const rawConverted = payableInINR * rateMultiplier;
  const convertedVal = (!rawConverted || isNaN(rawConverted) || rawConverted < 0.5)
    ? "0.50"
    : rawConverted.toFixed(2);

  if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
    return (
      <div className="text-center py-4 text-xs text-stone-500 font-bold flex items-center justify-center gap-2 animate-pulse">
        <span>⏳</span> Initializing PayPal secure payment...
      </div>
    );
  }

  if (loadingStatus === INSTANCE_LOADING_STATE.REJECTED) {
    return (
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold text-center">
        Failed to load PayPal: {error?.message || "Please refresh or try Razorpay"}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full">
        <PayPalOneTimePaymentButton
          createOrder={async () => {
            if (!checkShippingEligibility()) {
              throw new Error("Please complete required shipping details first.");
            }
            try {
              const res = await API.post("/payments/paypal/create-order", {
                currency_code: activePaypalCurrency,
                amount: convertedVal
              });
              if (!res.data?.orderId) {
                throw new Error(res.data?.error || "Failed to create PayPal order.");
              }
              return { orderId: res.data.orderId };
            } catch (createErr) {
              const msg = createErr.response?.data?.error || createErr.message || "PayPal checkout failed.";
              console.error("PayPal createOrder error:", msg);
              if (msg.includes("DOMESTIC_TRANSACTION_NOT_ALLOWED") || msg.includes("domestic")) {
                alert("PayPal India cannot process domestic transactions between Indian accounts under RBI regulations. Please choose Razorpay (Cards, UPI, Netbanking).");
                setPaymentMethod("razorpay");
              } else if (msg.includes("PAYEE_ACCOUNT_RESTRICTED") || msg.includes("restricted")) {
                alert("PayPal merchant account is currently restricted. Please use Razorpay or contact store support.");
              } else {
                alert(`PayPal error: ${msg}`);
              }
              throw createErr;
            }
          }}
          onApprove={async (data) => {
            try {
              const orderId = data?.orderId || data?.orderID;
              if (!orderId) {
                throw new Error("No PayPal order confirmation ID returned from PayPal.");
              }
              await API.post("/payments/paypal/capture-order", {
                orderId
              });
              await placeOrder({
                mode: "PayPal",
                transactionId: orderId
              });
            } catch (captureErr) {
              console.error("PayPal capture error:", captureErr);
              alert("PayPal payment capture failed: " + (captureErr.response?.data?.error || captureErr.message));
            }
          }}
          onError={(err) => {
            console.error("PayPal processing error:", err);
            const errStr = String(err?.message || err || "");
            if (
              errStr.includes("Please complete required shipping details") ||
              errStr.includes("do not ship") ||
              errStr.includes("PayPal error:")
            ) {
              return;
            }
            if (errStr.includes("DOMESTIC_TRANSACTION_NOT_ALLOWED") || errStr.includes("domestic")) {
              alert("PayPal India cannot process domestic transactions between Indian accounts under RBI regulations. Please choose Razorpay (Cards, UPI, Netbanking) for domestic orders.");
              setPaymentMethod("razorpay");
            } else {
              alert("PayPal encountered a processing error. If paying from India, please select Razorpay for instant checkout.");
            }
          }}
          presentationMode="auto"
        />
      </div>
      <p className="text-[9px] text-stone-400 text-center font-bold uppercase tracking-widest mt-2">
        Pay via PayPal, Credit/Debit cards
      </p>
      {form.delivery_country === "India" && (
        <div className="w-full mt-2.5 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 leading-relaxed text-left">
          ℹ️ <strong>Notice for India:</strong> PayPal does not allow domestic transactions within India under RBI regulations. If paying from India, please select <strong>Razorpay</strong> (Cards, UPI, Netbanking) above.
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { member } = useMember();
  const { convert, selected, currencies } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  // Comprehensive digital product detection
  const isDigitalItem = (i) => {
    if (i.type === "digital" || i.is_digital || i.product_type === "digital") return true;
    if (i.file_url || i.file_format || i.file_size) return true;
    if (String(i.id || "").startsWith("DPD-") || String(i.product_uid || "").startsWith("DPD-")) return true;
    return false;
  };
  const hasPhysicalItems = cart.some(i => !isDigitalItem(i));

  // Dynamic Shipping Charges Management (Step 5)
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingZoneInfo, setShippingZoneInfo] = useState("");
  const [shippingError, setShippingError] = useState("");

  const shipping = hasPhysicalItems
    ? (selectedMethod
      ? (selectedMethod.is_free ? 0 : (selectedMethod.shipping_cost_inr !== undefined ? Number(selectedMethod.shipping_cost_inr) : Number(selectedMethod.shipping_cost)))
      : (parseFloat(siteSettings?.shipping_fee) || 60))
    : 0;

  const [siteSettings, setSiteSettings] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponErr, setCouponErr] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const payableTotal = Math.max(0, total + shipping - couponDiscount);
  const isFreeOrder = payableTotal === 0;

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
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("method") || params.get("gateway");
    if (m === "paypal" || m === "razorpay") return m;
    return selected.currency_code === "INR" ? "razorpay" : "paypal";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("method") || params.get("gateway");
    if (m === "paypal" || m === "razorpay") {
      setPaymentMethod(m);
    }
  }, [location.search]);

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
    const memberData = JSON.parse(localStorage.getItem("member") || "null");
    const token = memberData?.token || memberData?.member?.token;
    if (member && token) {
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
        .catch(() => {
          // Token expired or invalid, fail silently without flooding console
        });
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



  const checkShippingEligibility = () => {
    if (!form.name || !form.email) {
      alert("Please provide your name and email address for order processing.");
      return false;
    }

    if (hasPhysicalItems) {
      if (!form.delivery_street || !form.delivery_city || !form.delivery_state) {
        alert("Please fill in all required delivery details first.");
        return false;
      }

      if (enabledCountryCodes.length > 0) {
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
      const items = cart.map((i) => {
        const isDigital = isDigitalItem(i);
        return {
          product_id: isDigital ? null : i.id,
          digital_product_id: isDigital ? i.id : null,
          product_uid: i.product_uid,
          product_name: i.name,
          price: Number(i.price) || 0,
          qty: Number(i.qty) || 1,
          type: isDigital ? "digital" : (i.type || "physical"),
          selected_size: i.selectedSize || null,
          customizations: i.customizations || []
        };
      });
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
        items: cart.map(i => {
          const isDigital = isDigitalItem(i);
          return {
            product_id: isDigital ? null : i.id,
            digital_product_id: isDigital ? i.id : null,
            product_uid: i.product_uid,
            product_name: i.name,
            price: Number(i.price) || 0,
            qty: Number(i.qty) || 1,
            type: isDigital ? "digital" : (i.type || "physical"),
            selected_size: i.selectedSize || null,
            customizations: i.customizations || []
          };
        }),
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
      if (createRes.data.is_free) {
        clearCart();
        navigate(`/order-success?id=${createRes.data.order_id}`);
        return;
      }
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
    <div style={{ background: "#FFFFFF", color: "#181A18", fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen">
      <SEO 
        title="Secure Checkout" 
        description="Complete your order securely and verify your details for bespoke design objects and digital assets." 
        keywords="checkout, payment, order verification"
      />
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl sm:text-3xl font-normal text-[#181A18] mb-6 sm:mb-8 tracking-tight"
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Delivery Details Form */}
          <div 
            className="lg:col-span-2 rounded-[4px] border border-[#E7E7E2] bg-white p-4 sm:p-6 md:p-8 flex flex-col gap-5"
          >
            <h3 className="text-xl font-medium text-[#181A18] tracking-tight">
              {hasPhysicalItems ? "Delivery Details" : "Contact & Digital Delivery Details"}
            </h3>
            
            {hasSavedAddress ? (
              <div className="bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] p-5 text-xs text-[#181A18] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D6]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#676A65]">Saved Member Address</span>
                  <span className="bg-[#23483D]/10 text-[#23483D] text-[10px] font-bold px-2 py-0.5 rounded-[2px]">Default Shipping</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#181A18]">{form.name}</p>
                  <p className="text-[#676A65] mt-0.5">{form.email} • {form.phone}</p>
                  <p className="text-stone-700 font-medium mt-2">
                    {[form.delivery_street, form.delivery_apt, form.delivery_city, form.delivery_state, form.delivery_country, form.delivery_pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#EAE4D6]">
                  <Link to="/profile?tab=addresses" className="text-[#23483D] hover:underline text-xs font-bold inline-flex items-center gap-1">
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
              <div className="border-t border-[#EAE4D6] pt-5 mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#181A18] flex items-center gap-2">
                    <span>🚚</span> Select Shipping Method
                  </h4>
                  {shippingZoneInfo && (
                    <span className="text-[10px] font-semibold text-[#23483D] bg-[#FAF6EE] border border-[#EAE4D6] px-2.5 py-0.5 rounded-[4px]">
                      {shippingZoneInfo}
                    </span>
                  )}
                </div>

                {shippingLoading ? (
                  <div className="p-4 bg-[#FAF6EE] rounded-[4px] border border-[#EAE4D6] text-xs text-[#676A65] font-medium flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Calculating best shipping options for {form.delivery_country}...
                  </div>
                ) : shippingError ? (
                  <div className="p-4 bg-amber-50 rounded-[4px] border border-amber-200 text-xs text-amber-800 font-bold">
                    ⚠️ {shippingError}
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <div className="p-4 bg-rose-50 rounded-[4px] border border-rose-200 text-xs text-rose-700 font-bold">
                    Shipping to your country is not available. Please contact us.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">

                    <div className="grid grid-cols-1 gap-2.5">
                      {shippingMethods.map((m) => {
                        const isSelected = selectedMethod?.method_id === m.method_id;
                        return (
                          <label
                            key={m.method_id}
                            className={`p-3.5 rounded-[4px] border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#23483D] bg-[#FAF6EE]"
                                : "border-[#EAE4D6] bg-white hover:bg-[#FAF6EE]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shippingMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethod(m)}
                                className="text-[#23483D] focus:ring-[#23483D] cursor-pointer"
                              />
                              <div>
                                <span className="font-semibold text-xs text-[#181A18] block">{m.method_name}</span>
                                <span className="text-[10px] text-[#676A65] font-medium">{m.estimated_days}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              {m.is_free ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-[2px]">
                                  FREE
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-[#181A18] font-mono">
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
            <div className="border-t border-[#EAE4D6] pt-5 mt-3">
              <h4 className="text-sm font-semibold text-[#181A18] mb-3">Secure Payment Methods Available</h4>
              <div className="p-4 border border-[#EAE4D6] bg-[#FAF6EE] rounded-[4px] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#181A18]">💳 Online Payments Gateways Enabled</span>
                <span className="text-[11px] text-[#676A65] font-normal leading-relaxed">
                  We securely accept Debit Cards, Credit Cards (Visa, Mastercard, RuPay, etc.), UPI, and Netbanking via <strong>Razorpay</strong> for domestic orders, and international card payments via <strong>PayPal</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="w-full flex flex-col gap-6">
            <div 
              className="rounded-[4px] border border-[#E7E7E2] bg-white p-5 sm:p-6 flex flex-col gap-4"
            >
              <h3 className="text-lg font-medium text-[#181A18] tracking-tight mb-2">Order summary</h3>
              
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                {cart.map((i) => (
                  <div key={`${i.id}-${i.type}-${i.selectedSize || ""}-${i.customizationSummary || ""}`} className="flex flex-col text-xs font-medium border-b border-[#E7E7E2] pb-1.5 mb-1.5 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="truncate flex-1 mr-2 text-[#181A18]">{i.name} × {i.qty}</span>
                      <div className="text-right shrink-0">
                        {i.original_price && Number(i.original_price) > Number(i.price) && (
                          <span className="line-through text-stone-400 text-[10px] mr-1.5 font-normal">
                            {convert(i.original_price * i.qty)}
                          </span>
                        )}
                        <span className="text-[#181A18] font-semibold">{convert(i.price * i.qty)}</span>
                      </div>
                    </div>
                    {i.customizationSummary && (
                      <span className="text-[10px] text-[#23483D] font-medium mt-0.5">✒️ {i.customizationSummary}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Coupon Code Section (Feature 3) */}
              <div className="border-t border-[#E7E7E2] pt-3 flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#676A65]">Discount Coupon</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    disabled={couponApplied}
                    className="flex-1 bg-white border border-[#DADCD7] rounded-[4px] px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#23483D] disabled:bg-stone-100"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                    className="bg-[#23483D] hover:bg-[#16352D] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-[4px] transition shrink-0"
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {couponMsg && <p className="text-[11px] text-emerald-600 font-bold">{couponMsg}</p>}
                {couponErr && <p className="text-[11px] text-rose-500 font-bold">{couponErr}</p>}
              </div>

              <div className="border-t border-[#E7E7E2] pt-4 flex flex-col gap-2.5">
                {hasPhysicalItems ? (
                  <div className="flex justify-between text-xs font-medium text-[#676A65]">
                    <span>Shipping Fee {selectedMethod ? `(${selectedMethod.method_name})` : ""}</span>
                    <span>{shipping === 0 ? "Free" : convert(shipping)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-[4px] border border-emerald-100">
                    <span className="flex items-center gap-1.5">⚡ Digital Delivery</span>
                    <span className="font-bold">Instant Download (Free)</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>- {convert(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg text-[#181A18] pt-1">
                  <span>Total</span>
                  <span>{convert(Math.max(0, total + shipping - couponDiscount))}</span>
                </div>
              </div>

              {selected.currency_code !== "INR" && (
                <div className="bg-[#FAF6EE] border border-[#EAE4D6] rounded-[4px] p-3 text-[10px] leading-relaxed text-[#676A65]">
                  ℹ️ Transactions are processed securely in your currency: <strong>{convert(Math.max(0, total + shipping - couponDiscount))}</strong>.
                </div>
              )}

              {/* Payment Method Option Selector */}
              {isFreeOrder ? (
                <div className="mt-4 mb-2 flex flex-col gap-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Complimentary Commission</p>
                      <p className="text-[11px] text-emerald-700">No payment card required. Direct file download upon completion.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => placeOrder({ mode: "Free", transactionId: `FREE-${Date.now()}` })}
                    disabled={placing || cart.length === 0}
                    className="w-full py-3.5 rounded-[4px] font-semibold text-xs uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {placing ? "Processing Order..." : "⚡ Complete Free Order & Download"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-4 mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#676A65] mb-2 block">Choose Payment Gateway</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`p-3.5 rounded-[4px] border text-left transition-all ${paymentMethod === "razorpay" ? "border-[#23483D] bg-[#FAF6EE]" : "border-[#EAE4D6] bg-white hover:bg-[#FAF6EE]"}`}
                      >
                        <div className="font-bold text-xs text-[#181A18]">💳 Razorpay</div>
                        <div className="text-[9px] text-[#676A65] mt-0.5">Cards, UPI, Netbanking</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`p-3.5 rounded-[4px] border text-left transition-all ${paymentMethod === "paypal" ? "border-[#23483D] bg-[#FAF6EE]" : "border-[#EAE4D6] bg-white hover:bg-[#FAF6EE]"}`}
                      >
                        <div className="font-bold text-xs text-[#181A18]">🅿️ PayPal</div>
                        <div className="text-[9px] text-[#676A65] mt-0.5">International Wallet & Cards</div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    {paymentMethod === "razorpay" ? (
                      <>
                        <button
                          onClick={handleRazorpayPayment}
                          disabled={placing || cart.length === 0}
                          style={{ background: "#23483D", color: "#ffffff" }}
                          className="w-full py-4 rounded-[4px] font-semibold text-xs uppercase tracking-wider hover:bg-[#16352D] transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {placing ? "Processing..." : `Pay ${convert(payableTotal)} via Razorpay`}
                        </button>
                        <p className="text-[9px] text-stone-400 text-center font-bold uppercase tracking-widest mt-1.5">
                          Secure Debit/Credit Card, UPI, Netbanking
                        </p>
                      </>
                    ) : (
                  <div className="mt-1 w-full">
                    {!siteSettings ? (
                      <div className="text-center py-4 text-xs text-stone-400 font-bold animate-pulse">
                        ⏳ Loading PayPal configuration...
                      </div>
                    ) : siteSettings.paypal_client_id && !siteSettings.paypal_client_id.includes("your_paypal") ? (
                      <PayPalProvider
                        clientId={siteSettings.paypal_client_id}
                        environment={siteSettings.paypal_mode || (siteSettings.paypal_client_id.startsWith("sb") || siteSettings.paypal_client_id.includes("sandbox") ? "sandbox" : "production")}
                        components={["paypal-payments"]}
                        pageType="checkout"
                      >
                        <PayPalButtonSection
                          total={total}
                          shipping={shipping}
                          couponDiscount={couponDiscount}
                          selected={selected}
                          currencies={currencies}
                          form={form}
                          placeOrder={placeOrder}
                          setPaymentMethod={setPaymentMethod}
                          checkShippingEligibility={checkShippingEligibility}
                        />
                      </PayPalProvider>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-[4px] text-xs text-amber-800 font-semibold text-center">
                        PayPal gateway is currently unavailable or disabled in store settings.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

            {/* High-attention Square Brand Ad */}
            <div className="w-full flex justify-center">
              <AdBanner placement="Square Tile" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}