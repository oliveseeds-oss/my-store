import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdSave, MdCheck } from "react-icons/md";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
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

  const Field = ({ label, fieldKey, type = "text", placeholder = "" }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block font-semibold">{label}</label>
      <input
        type={type}
        value={settings[fieldKey]}
        onChange={(e) => update(fieldKey, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Store Settings Manager" />
        <main className="p-6 flex flex-col gap-5 max-w-2xl w-full mx-auto">

          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl shadow-sm">
              <MdCheck className="text-lg" /> Settings saved successfully
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl shadow-sm">
              {errorMsg}
            </div>
          )}

          {/* General settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              General Information
            </h3>
            <Field label="Store Name" fieldKey="site_name" placeholder="My Engraving Store" />
            <Field label="Contact Email" fieldKey="site_email" type="email" placeholder="admin@mystore.com" />
            <Field label="Phone Number" fieldKey="phone" placeholder="+91 98765 43210" />
            <Field label="Business Address" fieldKey="address" placeholder="Street, City, State" />
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-semibold">Default Base Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer">
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
          </div>

          {/* Shipping settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 uppercase tracking-wider text-xs">
              Shipping & Delivery Thresholds
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default Shipping Fee (₹)" fieldKey="shipping_fee" placeholder="60" />
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
              <p className="text-[10px] text-gray-400">
                Enter your Live Rest API Client ID from the{" "}
                <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-indigo-500 underline">
                  PayPal Developer Dashboard
                </a>.
              </p>
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
                className="mt-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 text-xs font-bold py-2 px-4 rounded-lg transition"
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