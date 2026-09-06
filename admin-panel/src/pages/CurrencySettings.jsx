import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdAdd, MdSync, MdDelete, MdClose, MdCheck, MdPublic } from "react-icons/md";

function CurrencyRow({ r, updateRate, deleteCurrency, saving, deleting }) {
    const [rate, setRate] = useState(r.rate_to_inr);
    const [allowed, setAllowed] = useState(r.shipping_allowed);
    const isBaseInr = r.currency_code === "INR";

    useEffect(() => {
        setRate(r.rate_to_inr);
        setAllowed(r.shipping_allowed);
    }, [r.rate_to_inr, r.shipping_allowed]);

    const numRate = parseFloat(rate);
    const inrValue = numRate && numRate > 0 && !isBaseInr ? (1 / numRate).toFixed(2) : null;

    return (
        <tr className="border-t border-gray-100 hover:bg-stone-50/50 transition">
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="text-xl shadow-xs rounded">{r.flag_emoji || "🌐"}</span>
                    <div>
                        <span className="font-semibold text-gray-900 text-xs block">{r.country_name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{r.country_code}</span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3.5 font-medium">
                <div className="flex items-center gap-1.5">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold font-mono">
                        {r.currency_code}
                    </span>
                    <span className="text-gray-500 text-xs font-bold">({r.currency_symbol})</span>
                </div>
            </td>
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 text-xs font-mono">1 INR =</span>
                        <input
                            type="number" step="0.000001"
                            disabled={isBaseInr}
                            value={rate}
                            onChange={e => setRate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs w-32
                                   focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono disabled:bg-gray-100 disabled:text-gray-400" 
                        />
                        <span className="text-gray-500 text-xs font-mono">{r.currency_code}</span>
                    </div>
                    {inrValue && (
                        <span className="text-[10px] text-indigo-600 font-medium">
                            1 {r.currency_code} ≈ ₹{inrValue} INR
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3.5">
                <label className="inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!allowed}
                        onChange={e => setAllowed(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" 
                    />
                    <span className="ml-2 text-xs text-gray-600">
                        {allowed ? "Allowed" : "Disabled"}
                    </span>
                </label>
            </td>
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateRate(r.id, rate, allowed)}
                        disabled={saving === r.id}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white
                                 px-3 py-1.5 rounded-lg transition disabled:opacity-50 font-medium cursor-pointer shadow-xs">
                        {saving === r.id ? "Saving..." : "Save"}
                    </button>
                    {!isBaseInr && (
                        <button
                            onClick={() => deleteCurrency(r.id, r.currency_code, r.country_name)}
                            disabled={deleting === r.id}
                            title="Remove currency from conversion list"
                            className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50
                                     p-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer">
                            <MdDelete className="text-base" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function CurrencySettings() {
    const [rates, setRates] = useState([]);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const [saving, setSaving] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [fetchingRate, setFetchingRate] = useState(false);
    const [adding, setAdding] = useState(false);
    const [addMsg, setAddMsg] = useState("");
    const [addErr, setAddErr] = useState("");

    const [addForm, setAddForm] = useState({
        country_name: "",
        country_code: "",
        currency_code: "",
        currency_symbol: "",
        flag_emoji: "🌐",
        rate_to_inr: "",
        shipping_allowed: true,
    });

    const loadRates = () => {
        API.get(`/currency?_t=${Date.now()}`).then(r => {
            if (Array.isArray(r.data)) {
                setRates(r.data);
            }
        }).catch(err => console.error("Load currency rates error:", err));
    };

    const loadAvailable = () => {
        API.get("/currency/available").then(r => {
            if (Array.isArray(r.data)) {
                setAvailableCurrencies(r.data);
            }
        }).catch(err => console.error("Load available currencies error:", err));
    };

    useEffect(() => {
        loadRates();
        loadAvailable();
    }, []);

    const updateRate = async (id, rate_to_inr, shipping_allowed) => {
        setSaving(id);
        try {
            await API.put(`/currency/${id}`, { rate_to_inr, shipping_allowed });
            loadRates();
        } catch (error) {
            console.error(error);
            alert("Failed to update currency rate: " + (error.response?.data?.error || error.message));
        } finally {
            setSaving(null);
        }
    };

    const deleteCurrency = async (id, code, name) => {
        if (!window.confirm(`Are you sure you want to remove ${code} (${name}) from the currency conversion list?`)) {
            return;
        }
        setDeleting(id);
        try {
            await API.delete(`/currency/${id}`);
            loadRates();
        } catch (error) {
            console.error(error);
            alert("Failed to remove currency: " + (error.response?.data?.error || error.message));
        } finally {
            setDeleting(null);
        }
    };

    const syncRates = async () => {
        setSyncing(true);
        try {
            const res = await API.post("/currency/sync");
            loadRates();
            alert(res.data?.message || "Success! Real-time exchange rates synced relative to INR for all currencies!");
        } catch (error) {
            console.error(error);
            alert("Failed to synchronize live exchange rates: " + (error.response?.data?.error || error.message));
        } finally {
            setSyncing(false);
        }
    };

    // Quick Select from available world currencies dropdown
    const handleQuickSelect = (code) => {
        if (!code) return;
        const match = availableCurrencies.find(c => c.currency_code === code);
        if (match) {
            setAddForm(prev => ({
                ...prev,
                currency_code: match.currency_code,
                country_name: match.country_name || prev.country_name,
                country_code: match.country_code || prev.country_code,
                currency_symbol: match.currency_symbol || prev.currency_symbol,
                flag_emoji: match.flag_emoji || prev.flag_emoji || "🌐",
                rate_to_inr: match.live_rate ? String(match.live_rate) : prev.rate_to_inr
            }));
            setAddErr("");
        }
    };

    // Fetch live rate for custom entered currency code
    const fetchLiveRateForForm = async () => {
        const code = (addForm.currency_code || "").trim().toUpperCase();
        if (!code) {
            setAddErr("Please enter a currency code first (e.g. JPY, EUR)");
            return;
        }
        setFetchingRate(true);
        setAddErr("");
        try {
            const res = await API.get("/currency/available");
            if (Array.isArray(res.data)) {
                const match = res.data.find(c => c.currency_code === code);
                if (match && match.live_rate) {
                    setAddForm(prev => ({
                        ...prev,
                        rate_to_inr: String(match.live_rate),
                        country_name: prev.country_name || match.country_name,
                        currency_symbol: prev.currency_symbol || match.currency_symbol,
                        flag_emoji: prev.flag_emoji && prev.flag_emoji !== "🌐" ? prev.flag_emoji : match.flag_emoji
                    }));
                    setAddMsg(`Live rate found: 1 INR = ${match.live_rate} ${code} (1 ${code} ≈ ₹${match.inr_equivalent} INR)`);
                } else {
                    setAddErr(`Could not find live rate for ${code}. You can enter a manual rate.`);
                }
            }
        } catch (err) {
            setAddErr("Live rate lookup failed: " + err.message);
        } finally {
            setFetchingRate(false);
        }
    };

    const handleAddCurrency = async (e) => {
        e.preventDefault();
        setAddErr("");
        setAddMsg("");

        if (!addForm.country_name.trim() || !addForm.currency_code.trim()) {
            setAddErr("Country Name and Currency Code are required.");
            return;
        }

        setAdding(true);
        try {
            const res = await API.post("/currency", addForm);
            loadRates();
            loadAvailable();
            setAddMsg(res.data?.message || "Currency added successfully!");
            setTimeout(() => {
                setShowAddModal(false);
                setAddMsg("");
                setAddForm({
                    country_name: "",
                    country_code: "",
                    currency_code: "",
                    currency_symbol: "",
                    flag_emoji: "🌐",
                    rate_to_inr: "",
                    shipping_allowed: true,
                });
            }, 1200);
        } catch (err) {
            setAddErr(err.response?.data?.error || "Failed to add currency");
        } finally {
            setAdding(false);
        }
    };

    const filteredRates = rates.filter(r => 
        (r.country_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.currency_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.country_code || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-stone-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar title="Currency & Multi-Regional Rates" />
                <main className="p-6 flex flex-col gap-5 max-w-7xl w-full mx-auto">
                    
                    {/* Header & Stats Banner */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg"><MdPublic /></span>
                                <h3 className="text-base font-bold text-gray-900">Multi-Currency Live Sync Management</h3>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                Manage international currencies and conversion rates relative to INR. Rates are automatically synchronized with global financial markets so international customers see accurate real-time prices.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Forex Sync Active
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600 font-medium">
                                    <strong>{rates.length}</strong> currencies configured
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600 font-medium">
                                    <strong>{rates.filter(r => r.shipping_allowed).length}</strong> shipping enabled
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                            <button
                                onClick={() => {
                                    setAddErr("");
                                    setAddMsg("");
                                    setShowAddModal(true);
                                }}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer">
                                <MdAdd className="text-base" /> Add Currency
                            </button>
                            <button
                                onClick={syncRates}
                                disabled={syncing}
                                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer">
                                <MdSync className={`text-base ${syncing ? "animate-spin" : ""}`} />
                                {syncing ? "Syncing..." : "Sync Live Rates"}
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search currency code or country..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 text-right w-full sm:w-auto">
                            Showing {filteredRates.length} of {rates.length} currencies
                        </p>
                    </div>

                    {/* Currencies Conversion Table */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-stone-50/80 text-gray-500 text-left border-b border-gray-100 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-4 py-3.5">Country & Region</th>
                                        <th className="px-4 py-3.5">Currency</th>
                                        <th className="px-4 py-3.5">Exchange Rate (1 INR = ? Foreign)</th>
                                        <th className="px-4 py-3.5">Shipping Allowed</th>
                                        <th className="px-4 py-3.5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-xs text-gray-400">
                                                No currencies match "{searchQuery}". Click "Add Currency" to add a new conversion rate.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRates.map(r => (
                                            <CurrencyRow 
                                                key={r.id} 
                                                r={r} 
                                                updateRate={updateRate} 
                                                deleteCurrency={deleteCurrency}
                                                saving={saving} 
                                                deleting={deleting}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal: Add New Currency to Conversion List */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><MdAdd /></span>
                                <h3 className="font-bold text-gray-900 text-sm">Add Currency to Conversion List</h3>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-stone-100 rounded-lg transition cursor-pointer">
                                <MdClose className="text-lg" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCurrency} className="mt-4 flex flex-col gap-4">
                            
                            {/* Preset Quick Select */}
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-900 block mb-1.5">
                                    ⚡ Quick Select from World Currencies
                                </label>
                                <select
                                    onChange={e => handleQuickSelect(e.target.value)}
                                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-800"
                                >
                                    <option value="">-- Choose a world currency to autofill --</option>
                                    {availableCurrencies.map(c => (
                                        <option key={c.currency_code} value={c.currency_code}>
                                            {c.flag_emoji} {c.currency_code} - {c.country_name} ({c.currency_symbol}) {c.live_rate ? `• 1 INR = ${c.live_rate}` : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-indigo-700 mt-1.5">
                                    Selecting a currency automatically imports its standard symbol, flag, country name, and live exchange rate from financial APIs.
                                </p>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                        Currency Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. JPY"
                                        maxLength="5"
                                        value={addForm.currency_code}
                                        onChange={e => setAddForm({ ...addForm, currency_code: e.target.value.toUpperCase() })}
                                        className="w-full uppercase font-mono font-bold bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                        Currency Symbol
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ¥ or $"
                                        value={addForm.currency_symbol}
                                        onChange={e => setAddForm({ ...addForm, currency_symbol: e.target.value })}
                                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                        Country / Region Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Japan"
                                        value={addForm.country_name}
                                        onChange={e => setAddForm({ ...addForm, country_name: e.target.value })}
                                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                        Country ISO
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. JP"
                                        maxLength="2"
                                        value={addForm.country_code}
                                        onChange={e => setAddForm({ ...addForm, country_code: e.target.value.toUpperCase() })}
                                        className="w-full uppercase font-mono bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                        Flag Emoji
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="🇯🇵"
                                        value={addForm.flag_emoji}
                                        onChange={e => setAddForm({ ...addForm, flag_emoji: e.target.value })}
                                        className="w-full text-center text-lg bg-stone-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                                            Rate to INR (1 INR = ?)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={fetchLiveRateForForm}
                                            disabled={fetchingRate}
                                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer">
                                            {fetchingRate ? "Fetching..." : "⚡ Check Live Rate"}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        placeholder="Leave empty to auto-fetch"
                                        value={addForm.rate_to_inr}
                                        onChange={e => setAddForm({ ...addForm, rate_to_inr: e.target.value })}
                                        className="w-full font-mono bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-800"
                                    />
                                </div>
                            </div>

                            {/* Shipping Allowed Toggle */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-gray-200/80 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        checked={addForm.shipping_allowed}
                                        onChange={e => setAddForm({ ...addForm, shipping_allowed: e.target.checked })}
                                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-gray-800 block">Allow Shipping to this Country</span>
                                        <span className="text-[10px] text-gray-500 block">Enable physical order delivery to customers in this region</span>
                                    </div>
                                </label>
                            </div>

                            {addMsg && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                                    <MdCheck className="text-emerald-600 text-base shrink-0" /> {addMsg}
                                </div>
                            )}

                            {addErr && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                                    ⚠️ {addErr}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-stone-100 rounded-xl transition cursor-pointer">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-60 flex items-center gap-1.5 cursor-pointer">
                                    {adding ? "Adding & Connecting..." : "Add & Connect Currency"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}