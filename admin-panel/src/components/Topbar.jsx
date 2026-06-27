import { useAuth } from "../context/AuthContext";
import { MdLogout, MdPersonOutline } from "react-icons/md";
import { useState, useEffect } from "react";
import API from "../api";
import { getAdminCurrency } from "../utils/currency";

export default function Topbar({ title }) {
  const { admin, logout } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const activeCurr = getAdminCurrency();

  useEffect(() => {
    API.get("/currency?active=1")
      .then((r) => {
        const list = r.data;
        // Always ensure INR (base) is available
        if (!list.find((c) => c.currency_code === "INR")) {
          list.unshift({
            country_name: "India",
            country_code: "IN",
            currency_code: "INR",
            currency_symbol: "₹",
            flag_emoji: "🇮🇳",
            rate_to_inr: 1.0,
          });
        }
        setCurrencies(list);
      })
      .catch(() => {});
  }, []);

  const handleCurrencyChange = (e) => {
    const code = e.target.value;
    const found = currencies.find((c) => c.currency_code === code);
    if (found) {
      localStorage.setItem("admin_currency", JSON.stringify(found));
      window.location.reload();
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* Money Option for Admin */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Display Currency:</span>
          <select 
            value={activeCurr.currency_code}
            onChange={handleCurrencyChange}
            className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer">
            {currencies.map((c) => (
              <option key={c.currency_code} value={c.currency_code}>
                {c.flag_emoji || "🌐"} {c.currency_code} ({c.currency_symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 border-l border-gray-200" />

        <span className="flex items-center gap-1 text-sm text-gray-500">
          <MdPersonOutline className="text-lg" />
          {admin?.username || "Admin"}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
          <MdLogout /> Logout
        </button>
      </div>
    </header>
  );
}