import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";

function CurrencyRow({ r, updateRate, saving }) {
    const [rate, setRate] = useState(r.rate_to_inr);
    const [allowed, setAllowed] = useState(r.shipping_allowed);

    return (
        <tr className="border-t border-gray-50">
            <td className="px-4 py-3">
                <span className="mr-2">{r.flag_emoji}</span>
                {r.country_name}
            </td>
            <td className="px-4 py-3 font-medium">
                {r.currency_code} ({r.currency_symbol})
            </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">1 INR =</span>
                            <input
                                type="number" step="0.0001"
                                value={rate}
                                onChange={e => setRate(e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-28
                                       focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                            <span className="text-gray-400 text-xs">{r.currency_code}</span>
                        </div>
                    </td>
            <td className="px-4 py-3">
                <input type="checkbox" checked={!!allowed}
                    onChange={e => setAllowed(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600" />
            </td>
            <td className="px-4 py-3">
                <button
                    onClick={() => updateRate(r.id, rate, allowed)}
                    disabled={saving === r.id}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white
                             px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                    {saving === r.id ? "Saving..." : "Save"}
                </button>
            </td>
        </tr>
    );
}

export default function CurrencySettings() {
    const [rates, setRates] = useState([]);
    const [saving, setSaving] = useState(null);
    const [syncing, setSyncing] = useState(false);

    const loadRates = () => {
        API.get("/currency").then(r => setRates(r.data));
    };

    useEffect(() => {
        loadRates();
    }, []);

    const updateRate = async (id, rate_to_inr, shipping_allowed) => {
        setSaving(id);
        try {
            await API.put(`/currency/${id}`, { rate_to_inr, shipping_allowed });
            loadRates();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    const syncRates = async () => {
        setSyncing(true);
        try {
            await API.post("/currency/sync");
            loadRates();
            alert("Success! Real-time exchange rates synced relative to INR!");
        } catch (error) {
            console.error(error);
            alert("Failed to synchronize live exchange rates.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar title="Currency & shipping countries" />
                <main className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100">
                        <div className="max-w-xl">
                            <h3 className="text-sm font-semibold text-gray-800">Multi-Currency & Regional Rates</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Set exchange rates relative to INR. These rates are used to show prices in the customer's
                                local currency on the website. You are currently shipping to <span className="font-bold text-indigo-600">{rates.filter(r => r.shipping_allowed).length}</span> countries.
                            </p>
                        </div>
                        <button
                            onClick={syncRates}
                            disabled={syncing}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition shadow flex items-center justify-center gap-2 self-start md:self-auto">
                            {syncing ? "⌛ Syncing..." : "🔄 Sync Live Rates"}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-400 text-left">
                                <tr>
                                    <th className="px-4 py-3">Country</th>
                                    <th className="px-4 py-3">Currency</th>
                                    <th className="px-4 py-3">Rate (1 INR = ? Foreign)</th>
                                    <th className="px-4 py-3">Shipping enabled</th>
                                    <th className="px-4 py-3">Save</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map(r => (
                                    <CurrencyRow 
                                        key={r.id} 
                                        r={r} 
                                        updateRate={updateRate} 
                                        saving={saving} 
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}