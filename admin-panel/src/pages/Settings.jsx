import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MdSave, MdCheck } from "react-icons/md";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "My Engraving Store",
    siteEmail: "admin@mystore.com",
    phone: "+91 98765 43210",
    address: "12, Main Street, Coimbatore, Tamil Nadu",
    currency: "INR",
    shippingFee: "60",
    freeShippingAbove: "999",
    razorpayKey: "",
    adminPassword: "",
    newPassword: "",
  });

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, fieldKey, type = "text", placeholder = "" }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={settings[fieldKey]}
        onChange={(e) => update(fieldKey, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Settings" />
        <main className="p-6 flex flex-col gap-5 max-w-2xl">

          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200
                            text-green-700 text-sm px-4 py-3 rounded-xl">
              <MdCheck className="text-lg" /> Settings saved successfully
            </div>
          )}

          {/* General settings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-50">
              General info
            </h3>
            <Field label="Store name" fieldKey="siteName" placeholder="My Engraving Store" />
            <Field label="Contact email" fieldKey="siteEmail" type="email" placeholder="admin@mystore.com" />
            <Field label="Phone number" fieldKey="phone" placeholder="+91 98765 43210" />
            <Field label="Business address" fieldKey="address" placeholder="Street, City, State" />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
          </div>

          {/* Shipping settings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-50">
              Shipping
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default shipping fee (₹)" fieldKey="shippingFee" placeholder="60" />
              <Field label="Free shipping above (₹)" fieldKey="freeShippingAbove" placeholder="999" />
            </div>
          </div>

          {/* Payment settings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-50">
              Payment (Razorpay)
            </h3>
            <Field
              label="Razorpay API key"
              fieldKey="razorpayKey"
              placeholder="rzp_live_xxxxxxxxxx"
            />
            <p className="text-xs text-gray-400">
              Get your key from{" "}
              <a href="https://dashboard.razorpay.com"
                target="_blank" rel="noreferrer"
                className="text-indigo-500 underline">
                Razorpay dashboard
              </a>
            </p>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-50">
              Change admin password
            </h3>
            <Field label="Current password" fieldKey="adminPassword" type="password" placeholder="••••••••" />
            <Field label="New password" fieldKey="newPassword" type="password" placeholder="••••••••" />
          </div>

          <button onClick={save}
            className="flex items-center justify-center gap-2 bg-indigo-600
                       hover:bg-indigo-700 text-white rounded-xl py-3 text-sm
                       font-medium transition">
            <MdSave /> Save all settings
          </button>
        </main>
      </div>
    </div>
  );
}