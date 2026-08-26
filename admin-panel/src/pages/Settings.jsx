import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdSave, MdCheck } from "react-icons/md";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [testingPayPal, setTestingPayPal] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [settings, setSettings] = useState({
    site_name: "",
    site_email: "",
    phone: "",
    address: "",
    currency: "INR",
    shipping_fee: "60",
    free_shipping_above: "999",
    razorpay_key: "",
    razorpay_secret: "",
    paypal_client_id: "",
    paypal_client_secret: "",
    shiprocket_email: "",
    shiprocket_password: "",
    admin_password: "",
    new_password: "",
  });

  const loadSettings = () => {
    API.get("/settings")
      .then((res) => {
        setSettings({
          site_name: res.data.site_name || "",
          site_email: res.data.site_email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          currency: res.data.currency || "INR",
          shipping_fee: String(res.data.shipping_fee || "0"),
          free_shipping_above: String(res.data.free_shipping_above || "0"),
          razorpay_key: res.data.razorpay_key || "",
          razorpay_secret: res.data.razorpay_secret || "",
          paypal_client_id: res.data.paypal_client_id || "",
          paypal_client_secret: res.data.paypal_client_secret || "",
          shiprocket_email: res.data.shiprocket_email || "",
          shiprocket_password: res.data.shiprocket_password || "",
          admin_password: "",
          new_password: "",
        });
      })
      .catch((err) => console.error("Failed to load settings", err));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setErrorMsg("");
    setSaved(false);
    try {
      const payload = {
        site_name: settings.site_name,
        site_email: settings.site_email,
        phone: settings.phone,
        address: settings.address,
        currency: settings.currency,
        shipping_fee: parseFloat(settings.shipping_fee) || 0,
        free_shipping_above: parseFloat(settings.free_shipping_above) || 0,
        razorpay_key: settings.razorpay_key,
        razorpay_secret: settings.razorpay_secret,
        paypal_client_id: settings.paypal_client_id,
        paypal_client_secret: settings.paypal_client_secret,
        shiprocket_email: settings.shiprocket_email,
        shiprocket_password: settings.shiprocket_password,
      };

      if (settings.new_password) {
        if (!settings.admin_password) {
          setErrorMsg("Please enter current admin password to update password.");
          return;
        }
        payload.admin_password = settings.new_password;
      }

      await API.put("/settings", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setSettings(prev => ({ ...prev, admin_password: "", new_password: "" }));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save settings. Please verify authorization.");
    }
  };

  const handleTestShiprocket = async () => {
    setTestingConnection(true);
    try {
      const res = await API.post("/settings/test-shiprocket", {
        shiprocket_email: settings.shiprocket_email,
        shiprocket_password: settings.shiprocket_password
      });
      if (res.data.success) {
        alert("✅ " + res.data.message);
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (e) {
      alert("❌ Request failed: " + (e.response?.data?.error || e.message));
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestRazorpay = async () => {
    setTestingRazorpay(true);
    try {
      const res = await API.post("/settings/test-razorpay", {
        razorpay_key: settings.razorpay_key,
        razorpay_secret: settings.razorpay_secret
      });
      if (res.data.success) {
        alert("✅ " + res.data.message);
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (e) {
      alert("❌ Request failed: " + (e.response?.data?.error || e.message));
    } finally {
      setTestingRazorpay(false);
    }
  };

  const handleTestPayPal = async () => {
    setTestingPayPal(true);
    try {
      const res = await API.post("/settings/test-paypal", {
        paypal_client_id: settings.paypal_client_id,
        paypal_client_secret: settings.paypal_client_secret
      });
      if (res.data.success) {
        alert("✅ " + res.data.message);
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (e) {
      alert("❌ Request failed: " + (e.response?.data?.error || e.message));
    } finally {
      setTestingPayPal(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(label);
    setTimeout(() => setCopiedWebhook(""), 2500);
  };

  const currentOrigin = window.location.origin.includes("localhost")
    ? "https://apiosspanel.oliveseedsdesignstudio.com"
    : window.location.origin.replace("admin.", "");

  const webhooks = [
    { label: "Razorpay Payment Webhook", url: `${currentOrigin}/api/payments/razorpay/webhook`, id: "razorpay" },
    { label: "PayPal Webhook", url: `${currentOrigin}/api/payments/paypal/webhook`, id: "paypal" },
    { label: "Shiprocket Logistics Webhook", url: `${currentOrigin}/api/shipping/webhook/shiprocket`, id: "shiprocket" },
  ];

  const Field = ({ label, fieldKey, type = "text", placeholder = "" }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-semibold">{label}</label>
      <input
        type={type}
        value={settings[fieldKey]}
        onChange={(e) => update(fieldKey, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 transition font-mono"
      />
    </div>
  );

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Store Configuration & Settings" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl">

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-fade-in">
              <MdCheck className="text-base text-emerald-600" />
              Settings updated successfully!
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* General info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Store / Company Name" fieldKey="site_name" placeholder="Olive Seeds" />
              <Field label="Contact Email" fieldKey="site_email" type="email" placeholder="hello@oliveseeds.com" />
              <Field label="Contact Phone" fieldKey="phone" placeholder="+91 98765 43210" />
              <Field label="Physical Address" fieldKey="address" placeholder="123 Studio Street..." />
            </div>
          </div>

          {/* Financials & Shipping */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              Shipping & Currency Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Default Currency" fieldKey="currency" placeholder="INR" />
              <Field label="Flat Shipping Fee (₹)" fieldKey="shipping_fee" placeholder="60" />
              <Field label="Free Shipping Above Threshold (₹)" fieldKey="free_shipping_above" placeholder="999" />
            </div>
          </div>

          {/* Payment settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              Payment Gateway Credentials
            </h3>
            
            {/* Razorpay connection */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Razorpay Connection</h4>
              <Field
                label="Razorpay API Key (Key ID)"
                fieldKey="razorpay_key"
                placeholder="rzp_live_xxxxxxxxxx"
              />
              <Field
                label="Razorpay API Key Secret"
                fieldKey="razorpay_secret"
                type="password"
                placeholder="••••••••••••••••••••••••"
              />
              <button
                type="button"
                onClick={handleTestRazorpay}
                disabled={testingRazorpay}
                className="mt-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition self-start cursor-pointer"
              >
                {testingRazorpay ? "Testing Connection..." : "🔌 Test Razorpay Connection"}
              </button>
              <p className="text-[10px] text-gray-400">
                Enter your live key API token and secret from the{" "}
                <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-indigo-500 underline">
                  Razorpay Dashboard
                </a>.
              </p>
            </div>

            <div className="border-t border-gray-100 my-2" />

            {/* Paypal connection */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">PayPal Connection</h4>
              <Field
                label="PayPal Client ID"
                fieldKey="paypal_client_id"
                placeholder="AbcDe123... (Standard Live Client ID)"
              />
              <Field
                label="PayPal Client Secret Key"
                fieldKey="paypal_client_secret"
                type="password"
                placeholder="••••••••••••••••••••••••"
              />
              <button
                type="button"
                onClick={handleTestPayPal}
                disabled={testingPayPal}
                className="mt-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition self-start cursor-pointer"
              >
                {testingPayPal ? "Testing Connection..." : "🔌 Test PayPal Connection"}
              </button>
              <p className="text-[10px] text-gray-400">
                Enter your Live REST API Client ID & Client Secret from the{" "}
                <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-indigo-500 underline">
                  PayPal Developer Dashboard
                </a>.
              </p>
            </div>
          </div>

          {/* Webhook Management Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider text-xs">
                ⚡ Webhook Endpoints Management
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-md">
                Easy Copy & Paste
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Copy these production webhook listener URLs to paste into your Razorpay, PayPal, or Shiprocket Developer Dashboards for automated real-time status updates:
            </p>
            <div className="flex flex-col gap-3 mt-1">
              {webhooks.map((item) => (
                <div key={item.id} className="bg-stone-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-stone-700">{item.label}</span>
                    <span className="text-[11px] font-mono text-stone-500 truncate">{item.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] font-bold py-1.5 px-3 rounded-lg transition self-start sm:self-center shrink-0 cursor-pointer"
                  >
                    {copiedWebhook === item.id ? "✅ Copied!" : "📋 Copy Webhook URL"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Shiprocket settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              Shipping Partner Credentials
            </h3>
            
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">Shiprocket Connection</h4>
              <Field
                label="Shiprocket Registered Email"
                fieldKey="shiprocket_email"
                type="email"
                placeholder="user@example.com"
              />
              <Field
                label="Shiprocket Password"
                fieldKey="shiprocket_password"
                type="password"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={handleTestShiprocket}
                disabled={testingConnection}
                className="mt-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition self-start cursor-pointer"
              >
                {testingConnection ? "Testing Connection..." : "🔌 Test Shiprocket Connection"}
              </button>
              <p className="text-[10px] text-gray-400">
                Enter your registered Shiprocket credentials to automatically book and assign shipments.
              </p>
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              Change Security Password
            </h3>
            <Field label="Current Admin Password" fieldKey="admin_password" type="password" placeholder="••••••••" />
            <Field label="New Secure Password" fieldKey="new_password" type="password" placeholder="••••••••" />
          </div>

          <button onClick={save}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold transition shadow-md cursor-pointer">
            <MdSave className="text-lg" /> Save Configuration Settings
          </button>
        </main>
      </div>
    </div>
  );
}