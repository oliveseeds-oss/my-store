import { useState, useEffect, useId } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import {
  MdLocalShipping, MdAdd, MdEdit, MdDelete, MdSearch,
  MdCheckCircle, MdError, MdCalculate, MdScale,
  MdPercent, MdHistory, MdFileDownload, MdFileUpload,
  MdClose, MdTune, MdSave, MdRefresh
} from "react-icons/md";

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function ShippingRates() {
  const [activeTab, setActiveTab] = useState("zones"); // 'zones' | 'methods' | 'overrides' | 'weights' | 'calculator'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Common datasets
  const [enabledCountries, setEnabledCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // Tab 1: Zones & Rates state
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneRates, setZoneRates] = useState([]);
  const [zoneModal, setZoneModal] = useState({ open: false, isEdit: false, zone: null });
  const [countriesModal, setCountriesModal] = useState({ open: false, zone: null, search: "", selectedCodes: {} });
  const [rateModal, setRateModal] = useState({ open: false, rate: null, method: null });
  const [rateHistory, setRateHistory] = useState([]);
  const [bulkModal, setBulkModal] = useState({ open: false, percentage: 10, zone_id: "all", preview: null, loading: false });

  // Tab 2: Shipping Methods state
  const [methods, setMethods] = useState([]);
  const [methodModal, setMethodModal] = useState({ open: false, isEdit: false, method: null });

  // Tab 3: Country Overrides state
  const [overrides, setOverrides] = useState([]);
  const [overrideModal, setOverrideModal] = useState({ open: false, isEdit: false, override: null });

  // Tab 4: Product Weights state
  const [products, setProducts] = useState([]);
  const [weightsSummary, setWeightsSummary] = useState({ total_products: 0, set_count: 0, missing_count: 0 });
  const [weightSearch, setWeightSearch] = useState("");
  const [weightFilterMissing, setWeightFilterMissing] = useState(false);
  const [weightSavingStatus, setWeightSavingStatus] = useState({}); // { [productId]: 'saving' | 'saved' | 'error' }
  const [importModal, setImportModal] = useState({ open: false, text: "", loading: false });

  // Tab 5: Rate Calculator state
  const [calcForm, setCalcForm] = useState({
    country_code: "IN",
    order_value: 1299,
    total_weight_grams: 750,
    currency_code: "INR"
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch enabled countries
      const cRes = await API.get("/shipping-countries/enabled").catch(() => ({ data: [] }));
      setEnabledCountries(cRes.data || []);

      // 2. Fetch currencies
      const currRes = await API.get("/currency").catch(() => ({ data: [] }));
      setCurrencies(currRes.data || []);

      // 3. Fetch zones
      await fetchZones();

      // 4. Fetch methods
      await fetchMethods();

      // 5. Fetch overrides
      await fetchOverrides();

      // 6. Fetch rate history
      await fetchRateHistory();
    } catch (err) {
      console.error("Failed to load initial shipping data:", err);
      showToast("Error loading shipping configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await API.get("/admin/shipping-rates/zones");
      setZones(res.data);
      if (res.data.length > 0 && !selectedZone) {
        setSelectedZone(res.data[0]);
        fetchZoneRates(res.data[0].id);
      } else if (selectedZone) {
        const fresh = res.data.find((z) => z.id === selectedZone.id) || res.data[0];
        setSelectedZone(fresh);
        if (fresh) fetchZoneRates(fresh.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchZoneRates = async (zoneId) => {
    try {
      const res = await API.get(`/admin/shipping-rates/rates?zone_id=${zoneId}`);
      setZoneRates(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMethods = async () => {
    try {
      const res = await API.get("/admin/shipping-rates/methods");
      setMethods(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOverrides = async () => {
    try {
      const res = await API.get("/admin/shipping-rates/overrides");
      setOverrides(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRateHistory = async () => {
    try {
      const res = await API.get("/admin/shipping-rates/history");
      setRateHistory(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWeights = async () => {
    try {
      const params = new URLSearchParams();
      if (weightSearch) params.append("search", weightSearch);
      if (weightFilterMissing) params.append("missing_only", "1");
      const res = await API.get(`/admin/shipping-rates/weights?${params.toString()}`);
      setProducts(res.data.products || []);
      setWeightsSummary(res.data.summary || { total_products: 0, set_count: 0, missing_count: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === "weights") {
      fetchWeights();
    }
  }, [activeTab, weightFilterMissing]);

  // ─────────────────────────────────────────────────────────────
  // TAB 1: ZONES & RATES ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleToggleZoneActive = async (zone, e) => {
    e.stopPropagation();
    try {
      await API.put(`/admin/shipping-rates/zones/${zone.id}`, {
        is_active: !zone.is_active
      });
      showToast(`Zone "${zone.zone_name}" ${!zone.is_active ? "activated" : "deactivated"}`);
      fetchZones();
    } catch (err) {
      showToast("Failed to toggle zone status", "error");
    }
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    const f = zoneModal.zone;
    try {
      if (zoneModal.isEdit) {
        await API.put(`/admin/shipping-rates/zones/${f.id}`, f);
        showToast("Zone updated successfully");
      } else {
        await API.post("/admin/shipping-rates/zones", f);
        showToast("New zone added successfully");
      }
      setZoneModal({ open: false, isEdit: false, zone: null });
      fetchZones();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save zone", "error");
    }
  };

  const handleDeleteZone = async (zone, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete zone "${zone.zone_name}"? All country assignments and rates for this zone will be deleted.`)) return;
    try {
      await API.delete(`/admin/shipping-rates/zones/${zone.id}`);
      showToast("Zone deleted");
      if (selectedZone?.id === zone.id) setSelectedZone(null);
      fetchZones();
    } catch (err) {
      showToast("Failed to delete zone", "error");
    }
  };

  const openManageCountries = (zone, e) => {
    e.stopPropagation();
    const map = {};
    (zone.countries || []).forEach((c) => {
      map[c.country_code.toUpperCase()] = true;
    });
    setCountriesModal({
      open: true,
      zone,
      search: "",
      selectedCodes: map
    });
  };

  const handleSaveCountriesAssignment = async () => {
    const zoneId = countriesModal.zone.id;
    const selectedList = Object.keys(countriesModal.selectedCodes)
      .filter((k) => countriesModal.selectedCodes[k])
      .map((code) => {
        const found = enabledCountries.find((c) => c.country_code.toUpperCase() === code);
        return {
          country_code: code,
          country_name: found ? found.country_name : code
        };
      });

    try {
      await API.post(`/admin/shipping-rates/zones/${zoneId}/countries`, {
        countries: selectedList
      });
      showToast("Countries assigned successfully");
      setCountriesModal({ open: false, zone: null, search: "", selectedCodes: {} });
      fetchZones();
    } catch (err) {
      showToast("Failed to assign countries", "error");
    }
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    const r = rateModal.rate;
    try {
      if (r.id) {
        await API.put(`/admin/shipping-rates/rates/${r.id}`, r);
      } else {
        await API.post("/admin/shipping-rates/rates", {
          ...r,
          zone_id: selectedZone.id,
          method_id: rateModal.method.id
        });
      }
      showToast("Rate saved successfully");
      setRateModal({ open: false, rate: null, method: null });
      fetchZoneRates(selectedZone.id);
      fetchRateHistory();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save rate", "error");
    }
  };

  const handlePreviewBulkUpdate = async () => {
    setBulkModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await API.post("/admin/shipping-rates/bulk-update-percent", {
        percentage: bulkModal.percentage,
        zone_id: bulkModal.zone_id,
        preview_only: true
      });
      setBulkModal((prev) => ({ ...prev, preview: res.data.changes, loading: false }));
    } catch (err) {
      setBulkModal((prev) => ({ ...prev, loading: false }));
      showToast("Failed to generate bulk preview", "error");
    }
  };

  const handleApplyBulkUpdate = async () => {
    setBulkModal((prev) => ({ ...prev, loading: true }));
    try {
      await API.post("/admin/shipping-rates/bulk-update-percent", {
        percentage: bulkModal.percentage,
        zone_id: bulkModal.zone_id,
        preview_only: false
      });
      showToast(`Successfully updated rates by ${bulkModal.percentage}%`);
      setBulkModal({ open: false, percentage: 10, zone_id: "all", preview: null, loading: false });
      if (selectedZone) fetchZoneRates(selectedZone.id);
      fetchRateHistory();
    } catch (err) {
      setBulkModal((prev) => ({ ...prev, loading: false }));
      showToast("Failed to apply bulk update", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 2: SHIPPING METHODS ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    const m = methodModal.method;
    try {
      if (methodModal.isEdit) {
        await API.put(`/admin/shipping-rates/methods/${m.id}`, m);
        showToast("Shipping method updated");
      } else {
        await API.post("/admin/shipping-rates/methods", m);
        showToast("Shipping method added");
      }
      setMethodModal({ open: false, isEdit: false, method: null });
      fetchMethods();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save method", "error");
    }
  };

  const handleDeleteMethod = async (m) => {
    if (!window.confirm("This will remove all rates using this method across all zones. Are you sure?")) return;
    try {
      await API.delete(`/admin/shipping-rates/methods/${m.id}`);
      showToast("Method removed");
      fetchMethods();
      if (selectedZone) fetchZoneRates(selectedZone.id);
    } catch (err) {
      showToast("Failed to delete method", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 3: COUNTRY OVERRIDES ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    const ov = overrideModal.override;
    try {
      if (overrideModal.isEdit) {
        await API.put(`/admin/shipping-rates/overrides/${ov.id}`, ov);
        showToast("Country override updated");
      } else {
        await API.post("/admin/shipping-rates/overrides", ov);
        showToast("Country override created");
      }
      setOverrideModal({ open: false, isEdit: false, override: null });
      fetchOverrides();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save override", "error");
    }
  };

  const handleDeleteOverride = async (ov) => {
    if (!window.confirm(`Delete override rate for ${ov.country_name}?`)) return;
    try {
      await API.delete(`/admin/shipping-rates/overrides/${ov.id}`);
      showToast("Override deleted");
      fetchOverrides();
    } catch (err) {
      showToast("Failed to delete override", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 4: PRODUCT WEIGHTS ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleInlineWeightChange = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
    );
  };

  const handleWeightBlur = async (p) => {
    setWeightSavingStatus((prev) => ({ ...prev, [p.id]: "saving" }));
    try {
      await API.put(`/admin/shipping-rates/weights/${p.id}`, {
        weight_grams: p.weight_grams,
        length_cm: p.length_cm,
        width_cm: p.width_cm,
        height_cm: p.height_cm
      });
      setWeightSavingStatus((prev) => ({ ...prev, [p.id]: "saved" }));
      setTimeout(() => {
        setWeightSavingStatus((prev) => {
          const c = { ...prev };
          delete c[p.id];
          return c;
        });
      }, 2500);
    } catch (err) {
      setWeightSavingStatus((prev) => ({ ...prev, [p.id]: "error" }));
    }
  };

  const handleSetDefaultWeights = async () => {
    if (!window.confirm("Set 500g default weight for all products that currently have no weight configured?")) return;
    try {
      const res = await API.post("/admin/shipping-rates/weights/set-default");
      showToast(res.data.message);
      fetchWeights();
    } catch (err) {
      showToast("Failed to set default weights", "error");
    }
  };

  const handleExportWeightsCSV = () => {
    window.open(`${API.defaults.baseURL}/admin/shipping-rates/weights/export-csv`, "_blank");
  };

  const handleImportCSVText = async () => {
    const raw = importModal.text.trim();
    if (!raw) return alert("Please paste CSV data first");

    setImportModal((prev) => ({ ...prev, loading: true }));
    try {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) throw new Error("CSV has no data rows");

      const items = [];
      const startIndex = lines[0].toLowerCase().includes("product_id") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((s) => s.replace(/^"|"$/g, "").trim());
        if (parts.length >= 3) {
          items.push({
            product_id: parseInt(parts[0], 10),
            weight_grams: parseInt(parts[2], 10) || 500,
            length_cm: parts[3] ? parseFloat(parts[3]) : null,
            width_cm: parts[4] ? parseFloat(parts[4]) : null,
            height_cm: parts[5] ? parseFloat(parts[5]) : null
          });
        }
      }

      const res = await API.post("/admin/shipping-rates/weights/import-csv", { items });
      showToast(res.data.message);
      setImportModal({ open: false, text: "", loading: false });
      fetchWeights();
    } catch (err) {
      setImportModal((prev) => ({ ...prev, loading: false }));
      showToast(err.message || "Failed to parse or import CSV", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // TAB 5: RATE CALCULATOR ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleRunCalculation = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await API.post("/admin/shipping-rates/preview", calcForm);
      setCalcResult(res.data);
    } catch (err) {
      showToast("Calculation failed. Verify inputs.", "error");
    } finally {
      setCalcLoading(false);
    }
  };

  // Helper: Find which zone an enabled country is currently in
  const getAssignedZoneName = (countryCode) => {
    for (const z of zones) {
      if ((z.countries || []).some((c) => c.country_code.toUpperCase() === countryCode.toUpperCase())) {
        return z.zone_name;
      }
    }
    return null;
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Shipping Rates Manager" />

        {/* Global Toast Message */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-fade-in ${
            toast.type === "error" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {toast.type === "error" ? <MdError className="text-base" /> : <MdCheckCircle className="text-base" />}
            <span>{toast.msg}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <MdLocalShipping className="text-amber-600 text-2xl" />
                  Shipping Rates Manager
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  Step 4 Live
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Configure international shipping zones, weight tiers, fast/economy methods, and per-product weights.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkModal({ open: true, percentage: 10, zone_id: "all", preview: null, loading: false })}
                className="px-3 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl flex items-center gap-1.5 transition border border-stone-300"
              >
                <MdPercent className="text-sm text-amber-600" />
                Update Rates by %
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-px">
            {[
              { id: "zones", label: "🌏 Zones & Rates", icon: <MdTune /> },
              { id: "methods", label: "⚡ Shipping Methods", icon: <MdLocalShipping /> },
              { id: "overrides", label: "🎯 Country Overrides", icon: <MdTune /> },
              { id: "weights", label: "📦 Product Weights", icon: <MdScale /> },
              { id: "calculator", label: "🧮 Rate Calculator", icon: <MdCalculate /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-xl"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-stone-100/60 rounded-t-xl"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ────────────────────────────────────────────────────── */}
          {/* TAB 1: ZONES & RATES */}
          {/* ────────────────────────────────────────────────────── */}
          {activeTab === "zones" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Zones List */}
                <div className="lg:col-span-5 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                      Shipping Zones ({zones.length})
                    </h2>
                    <button
                      onClick={() => setZoneModal({ open: true, isEdit: false, zone: { zone_name: "", zone_description: "", is_active: true } })}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition"
                    >
                      <MdAdd /> Add Zone
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {zones.map((z) => {
                      const isSelected = selectedZone?.id === z.id;
                      return (
                        <div
                          key={z.id}
                          onClick={() => {
                            setSelectedZone(z);
                            fetchZoneRates(z.id);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                            isSelected
                              ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-100"
                              : "bg-white border-gray-200 hover:border-amber-300 shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">{z.zone_name}</span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                                  {z.country_count || 0} countries
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{z.zone_description || "No description provided."}</p>
                            </div>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleZoneActive(z, e)}
                              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                                z.is_active ? "bg-emerald-500" : "bg-stone-300"
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-sm ${
                                  z.is_active ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Country badges preview */}
                          <div className="flex flex-wrap gap-1">
                            {(z.countries || []).slice(0, 6).map((c) => (
                              <span key={c.country_code} className="text-[10px] font-semibold bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded text-stone-700 flex items-center gap-1">
                                <span>{getFlagEmoji(c.country_code)}</span>
                                {c.country_code}
                              </span>
                            ))}
                            {(z.countries || []).length > 6 && (
                              <span className="text-[10px] text-stone-400 font-bold px-1.5 py-0.5">
                                +{(z.countries || []).length - 6} more
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoneModal({ open: true, isEdit: true, zone: { ...z } });
                                }}
                                className="text-stone-600 hover:text-stone-900 font-bold px-2 py-1 rounded hover:bg-stone-100 flex items-center gap-1"
                              >
                                <MdEdit /> Edit
                              </button>
                              <button
                                onClick={(e) => openManageCountries(z, e)}
                                className="text-amber-700 hover:text-amber-800 font-bold px-2 py-1 rounded hover:bg-amber-50 flex items-center gap-1"
                              >
                                <MdTune /> Manage Countries
                              </button>
                            </div>
                            <button
                              onClick={(e) => handleDeleteZone(z, e)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                              title="Delete zone"
                            >
                              <MdDelete className="text-base" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Rates for Selected Zone */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {selectedZone ? (
                    <>
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Active Rate Sheet</span>
                            <h3 className="text-base font-black text-gray-900">Zone: {selectedZone.zone_name}</h3>
                          </div>
                          <button
                            onClick={() => {
                              fetchZoneRates(selectedZone.id);
                              showToast("Rates refreshed");
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
                            title="Refresh rates"
                          >
                            <MdRefresh className="text-lg" />
                          </button>
                        </div>

                        {/* Rate table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                                <th className="pb-2">Method</th>
                                <th className="pb-2">Base Rate</th>
                                <th className="pb-2">First Slab</th>
                                <th className="pb-2">Extra Slab</th>
                                <th className="pb-2">Free Above</th>
                                <th className="pb-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {methods.map((m) => {
                                const rate = zoneRates.find((r) => r.method_id === m.id);
                                return (
                                  <tr key={m.id} className="hover:bg-stone-50/50">
                                    <td className="py-3 font-bold text-stone-800">
                                      <div className="flex items-center gap-1.5">
                                        <span>{m.method_name}</span>
                                        {rate && !rate.is_active && (
                                          <span className="text-[9px] bg-stone-100 text-stone-500 font-bold px-1.5 py-0.2 rounded">
                                            Inactive
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-stone-400 font-normal">
                                        {m.estimated_days_min}-{m.estimated_days_max} days
                                      </span>
                                    </td>
                                    <td className="py-3 font-semibold text-stone-900">
                                      ₹{rate?.base_rate ?? 0}
                                    </td>
                                    <td className="py-3 text-stone-700">
                                      ₹{rate?.first_weight_rate ?? 0} <span className="text-stone-400 text-[10px]">/ {rate?.first_weight_grams ?? 500}g</span>
                                    </td>
                                    <td className="py-3 text-stone-700">
                                      ₹{rate?.additional_weight_rate ?? 0} <span className="text-stone-400 text-[10px]">/ {rate?.additional_weight_grams ?? 500}g</span>
                                    </td>
                                    <td className="py-3">
                                      {rate?.free_shipping_above ? (
                                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                          ₹{rate.free_shipping_above}
                                        </span>
                                      ) : (
                                        <span className="text-stone-400 text-[10px]">None</span>
                                      )}
                                    </td>
                                    <td className="py-3 text-right">
                                      <button
                                        onClick={() =>
                                          setRateModal({
                                            open: true,
                                            method: m,
                                            rate: rate
                                              ? { ...rate }
                                              : {
                                                  base_rate: 600,
                                                  first_weight_grams: 500,
                                                  first_weight_rate: 150,
                                                  additional_weight_grams: 500,
                                                  additional_weight_rate: 100,
                                                  free_shipping_above: 5000,
                                                  minimum_order_value: 0,
                                                  is_active: true
                                                }
                                          })
                                        }
                                        className="text-amber-700 hover:text-amber-800 font-bold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-xs transition"
                                      >
                                        Edit Rate
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Rate Calculation Live Preview */}
                        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex flex-col gap-2">
                          <div className="flex items-center justify-between text-stone-600 font-bold">
                            <span>💡 Dynamic Rate Example: 750g order worth ₹2,000</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                              1 extra 250g unit
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                            {methods.map((m) => {
                              const r = zoneRates.find((rate) => rate.method_id === m.id);
                              const base = parseFloat(r?.base_rate) || 0;
                              const f1 = parseFloat(r?.first_weight_rate) || 0;
                              const extra = parseFloat(r?.additional_weight_rate) || 0;
                              const total = base + f1 + extra;
                              return (
                                <div key={m.id} className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                                  <p className="font-bold text-[11px] text-stone-800 truncate">{m.method_name}</p>
                                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                    ₹{base} + ₹{f1} + ₹{extra}
                                  </p>
                                  <p className="text-xs font-black text-amber-700 mt-1">= ₹{total}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Recent Rate Changes (Step 7) */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                            <MdHistory className="text-amber-600 text-base" />
                            Recent Rate Changes Log
                          </h4>
                          <span className="text-[10px] text-stone-400">Last 10 updates</span>
                        </div>

                        {rateHistory.length === 0 ? (
                          <p className="text-xs text-stone-400 py-3 text-center">No rate changes logged yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-stone-150 text-stone-400 uppercase text-[9px] font-bold">
                                  <th className="pb-1.5">Zone</th>
                                  <th className="pb-1.5">Method</th>
                                  <th className="pb-1.5">Change</th>
                                  <th className="pb-1.5">Admin</th>
                                  <th className="pb-1.5 text-right">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {rateHistory.map((h) => (
                                  <tr key={h.id} className="text-stone-700 text-[11px]">
                                    <td className="py-2 font-semibold">{h.zone_name || `Zone #${h.zone_id}`}</td>
                                    <td className="py-2 text-stone-600">{h.method_name || `Method #${h.method_id}`}</td>
                                    <td className="py-2 font-mono font-bold text-amber-700">
                                      ₹{h.old_base_rate} → ₹{h.new_base_rate}
                                    </td>
                                    <td className="py-2 text-stone-500 text-[10px] truncate max-w-[120px]">{h.changed_by}</td>
                                    <td className="py-2 text-stone-400 text-right text-[10px]">
                                      {new Date(h.changed_at).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
                      <MdTune className="text-3xl text-stone-300" />
                      Select a zone on the left to inspect and set its shipping rates.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────── */}
          {/* TAB 2: SHIPPING METHODS */}
          {/* ────────────────────────────────────────────────────── */}
          {activeTab === "methods" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Shipping Speed Methods ({methods.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define speed tiers offered to customers (e.g. Standard, Priority Express, Economy).
                  </p>
                </div>
                <button
                  onClick={() =>
                    setMethodModal({
                      open: true,
                      isEdit: false,
                      method: { method_name: "", method_code: "", description: "", estimated_days_min: 3, estimated_days_max: 7, is_active: true }
                    })
                  }
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <MdAdd /> Add New Method
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                      <th className="pb-3">Method Name</th>
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Estimated Days</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Active</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {methods.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50/60">
                        <td className="py-3.5 font-bold text-stone-900">{m.method_name}</td>
                        <td className="py-3.5 font-mono text-[11px] text-stone-600">{m.method_code}</td>
                        <td className="py-3.5 font-semibold text-amber-700">
                          {m.estimated_days_min}-{m.estimated_days_max} days
                        </td>
                        <td className="py-3.5 text-stone-500 text-xs max-w-xs truncate">{m.description || "—"}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-500"
                          }`}>
                            {m.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setMethodModal({ open: true, isEdit: true, method: { ...m } })}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                              title="Edit method"
                            >
                              <MdEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteMethod(m)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                              title="Delete method"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────── */}
          {/* TAB 3: COUNTRY OVERRIDES */}
          {/* ────────────────────────────────────────────────────── */}
          {activeTab === "overrides" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Country Specific Overrides ({overrides.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Country overrides take absolute priority over zone rates. Use these for special pricing agreements.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setOverrideModal({
                      open: true,
                      isEdit: false,
                      override: {
                        country_code: enabledCountries[0]?.country_code || "US",
                        country_name: enabledCountries[0]?.country_name || "United States",
                        method_id: methods[0]?.id || 1,
                        base_rate: 900,
                        first_weight_grams: 500,
                        first_weight_rate: 200,
                        additional_weight_grams: 500,
                        additional_weight_rate: 150,
                        free_shipping_above: 6000,
                        is_active: true
                      }
                    })
                  }
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                >
                  <MdAdd /> Add Country Override
                </button>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                ℹ️ <strong>Priority Order:</strong> Country Override → Zone Rate → Fallback Rest of World Rate.
              </div>

              {overrides.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                  <MdTune className="text-3xl text-stone-300" />
                  No country overrides created yet. Zone rates apply to all active countries.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                        <th className="pb-3">Country</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Base Rate</th>
                        <th className="pb-3">First Slab</th>
                        <th className="pb-3">Extra Slab</th>
                        <th className="pb-3">Free Above</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150">
                      {overrides.map((ov) => (
                        <tr key={ov.id} className="hover:bg-stone-50/60">
                          <td className="py-3 font-bold text-stone-900">
                            <div className="flex items-center gap-1.5">
                              <span>{getFlagEmoji(ov.country_code)}</span>
                              <span>{ov.country_name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">({ov.country_code})</span>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-stone-800">{ov.method_name}</td>
                          <td className="py-3 font-bold text-stone-900">₹{ov.base_rate}</td>
                          <td className="py-3 text-stone-700">₹{ov.first_weight_rate} / {ov.first_weight_grams}g</td>
                          <td className="py-3 text-stone-700">₹{ov.additional_weight_rate} / {ov.additional_weight_grams}g</td>
                          <td className="py-3">
                            {ov.free_shipping_above ? (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                ₹{ov.free_shipping_above}
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[10px]">None</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ov.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-500"
                            }`}>
                              {ov.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setOverrideModal({ open: true, isEdit: true, override: { ...ov } })}
                                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                                title="Edit override"
                              >
                                <MdEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteOverride(ov)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                title="Delete override"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ────────────────────────────────────────────────────── */}
          {/* TAB 4: PRODUCT WEIGHTS */}
          {/* ────────────────────────────────────────────────────── */}
          {activeTab === "weights" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Product Weights & Dimensions Manager
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Shipping costs are calculated from total cart weight. Set specific grams per product or rely on the 500g fallback.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSetDefaultWeights}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition"
                  >
                    <MdTune className="text-amber-600" /> Set Default 500g for All
                  </button>
                  <button
                    onClick={handleExportWeightsCSV}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition"
                  >
                    <MdFileDownload /> Export CSV
                  </button>
                  <button
                    onClick={() => setImportModal({ open: true, text: "", loading: false })}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <MdFileUpload /> Import CSV
                  </button>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">Total Products</span>
                  <span className="text-sm font-black text-stone-900">{weightsSummary.total_products}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-medium">Weights Configured</span>
                  <span className="text-sm font-black text-emerald-800">{weightsSummary.set_count}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-amber-700 font-medium">Missing (Using default 500g)</span>
                  <span className="text-sm font-black text-amber-800">{weightsSummary.missing_count}</span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
                  <input
                    type="text"
                    value={weightSearch}
                    onChange={(e) => setWeightSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchWeights()}
                    placeholder="Search product name or UID..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 bg-stone-50"
                  />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <label className="text-xs font-bold text-stone-600 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weightFilterMissing}
                      onChange={(e) => setWeightFilterMissing(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Show missing weight only</span>
                  </label>
                  <button
                    onClick={fetchWeights}
                    className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Products Weight Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3">Weight (grams)</th>
                      <th className="pb-3">Dimensions L × W × H (cm)</th>
                      <th className="pb-3 text-right">Auto-Save Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {products.map((p) => {
                      const status = weightSavingStatus[p.id];
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/60">
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              {p.image_url ? (
                                <img src={p.image_url} alt="" className="w-9 h-9 object-cover rounded-lg border bg-stone-100" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-base">🪵</div>
                              )}
                              <div>
                                <p className="font-bold text-stone-900 leading-tight line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-stone-400 font-mono">{p.product_uid || `PROD-${p.id}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={p.weight_grams ?? 500}
                                onChange={(e) => handleInlineWeightChange(p.id, "weight_grams", e.target.value)}
                                onBlur={() => handleWeightBlur(p)}
                                className="w-24 px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono font-bold"
                              />
                              <span className="text-[11px] text-stone-400 font-bold">g</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="L"
                                value={p.length_cm ?? ""}
                                onChange={(e) => handleInlineWeightChange(p.id, "length_cm", e.target.value)}
                                onBlur={() => handleWeightBlur(p)}
                                className="w-14 px-2 py-1.5 text-xs border border-stone-200 rounded-lg text-center font-mono"
                              />
                              <span className="text-stone-400">×</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="W"
                                value={p.width_cm ?? ""}
                                onChange={(e) => handleInlineWeightChange(p.id, "width_cm", e.target.value)}
                                onBlur={() => handleWeightBlur(p)}
                                className="w-14 px-2 py-1.5 text-xs border border-stone-200 rounded-lg text-center font-mono"
                              />
                              <span className="text-stone-400">×</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="H"
                                value={p.height_cm ?? ""}
                                onChange={(e) => handleInlineWeightChange(p.id, "height_cm", e.target.value)}
                                onBlur={() => handleWeightBlur(p)}
                                className="w-14 px-2 py-1.5 text-xs border border-stone-200 rounded-lg text-center font-mono"
                              />
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {status === "saving" && <span className="text-[10px] text-amber-600 font-bold">Saving...</span>}
                            {status === "saved" && <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1"><MdCheckCircle /> Saved</span>}
                            {status === "error" && <span className="text-[10px] text-rose-600 font-bold flex items-center justify-end gap-1"><MdError /> Error</span>}
                            {!status && <span className="text-[10px] text-stone-300">Auto-saves on blur</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────── */}
          {/* TAB 5: RATE CALCULATOR (TEST TOOL) */}
          {/* ────────────────────────────────────────────────────── */}
          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Box */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <MdCalculate className="text-amber-600 text-lg" />
                    Shipping Rate Test Calculator
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Simulate real customer checkout conditions to verify rates, weight steps, and currency conversions.
                  </p>
                </div>

                <form onSubmit={handleRunCalculation} className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Destination Country</label>
                    <select
                      value={calcForm.country_code}
                      onChange={(e) => setCalcForm({ ...calcForm, country_code: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 font-bold focus:outline-none focus:border-amber-500"
                    >
                      {enabledCountries.map((c) => (
                        <option key={c.country_code} value={c.country_code}>
                          {getFlagEmoji(c.country_code)} {c.country_name} ({c.country_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Order Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={calcForm.order_value}
                      onChange={(e) => setCalcForm({ ...calcForm, order_value: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Total Weight (grams)</label>
                    <input
                      type="number"
                      min="1"
                      value={calcForm.total_weight_grams}
                      onChange={(e) => setCalcForm({ ...calcForm, total_weight_grams: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">e.g. 350g mug + 200g t-shirt + 200g packaging = 750g</span>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Display Currency</label>
                    <select
                      value={calcForm.currency_code}
                      onChange={(e) => setCalcForm({ ...calcForm, currency_code: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="INR">₹ INR (Indian Rupee)</option>
                      {currencies.map((cur) => (
                        <option key={cur.currency_code} value={cur.currency_code}>
                          {cur.flag_emoji || "🌐"} {cur.currency_code} — {cur.country_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={calcLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition mt-2"
                  >
                    {calcLoading ? "Calculating..." : "Calculate Shipping"}
                  </button>
                </form>
              </div>

              {/* Results Box */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {calcResult ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Calculated Output</span>
                        <h3 className="text-base font-black text-gray-900">
                          {getFlagEmoji(calcResult.country_code)} {calcResult.country_name}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border">
                        {calcResult.currency} @ {calcResult.exchange_rate}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Zone Applied</p>
                        <p className="font-bold text-stone-900 truncate">{calcResult.zone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Total Weight</p>
                        <p className="font-bold text-stone-900">{calcResult.total_weight_grams} g</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Source</p>
                        <p className="font-bold text-emerald-700 capitalize">{calcResult.source} Rate</p>
                      </div>
                    </div>

                    {/* Methods breakdown */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Available Options:</h4>
                      {calcResult.methods.map((m) => (
                        <div key={m.method_id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-stone-900">{m.method_name}</span>
                              <span className="text-xs text-stone-500 ml-2">({m.estimated_days})</span>
                            </div>
                            <div className="text-right">
                              {m.is_free ? (
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  FREE SHIPPING
                                </span>
                              ) : (
                                <span className="text-sm font-black text-amber-700">
                                  {calcResult.currency} {m.shipping_cost}
                                  {calcResult.currency !== "INR" && (
                                    <span className="text-[10px] text-stone-400 font-normal ml-1">(₹{m.shipping_cost_inr})</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Breakdown breakdown item */}
                          {m.breakdown && (
                            <div className="text-[11px] text-stone-600 font-mono bg-white p-2.5 rounded-lg border border-stone-200/80 leading-relaxed">
                              {m.is_free ? (
                                <span className="text-emerald-700 font-bold">🎉 {m.breakdown.reason || "Free shipping threshold unlocked"}</span>
                              ) : (
                                <span>
                                  Base Rate ₹{m.breakdown.baseRate} + First Slab ₹{m.breakdown.firstWeightCost}
                                  {m.breakdown.extraUnits > 0 && ` + Extra (${m.breakdown.extraUnits} × ₹${m.breakdown.extraUnitRate} = ₹${m.breakdown.extraWeightCost})`}
                                  {" = "}
                                  <strong>₹{m.shipping_cost_inr}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
                    <MdCalculate className="text-4xl text-stone-300" />
                    Enter parameters on the left and click "Calculate Shipping" to view real rate outputs.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT ZONE */}
      {/* ──────────────────────────────────────────────────────── */}
      {zoneModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {zoneModal.isEdit ? "Edit Shipping Zone" : "Create New Shipping Zone"}
              </h3>
              <button onClick={() => setZoneModal({ open: false, isEdit: false, zone: null })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={zoneModal.zone?.zone_name || ""}
                  onChange={(e) => setZoneModal({ ...zoneModal, zone: { ...zoneModal.zone, zone_name: e.target.value } })}
                  placeholder="e.g. Middle East"
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={zoneModal.zone?.zone_description || ""}
                  onChange={(e) => setZoneModal({ ...zoneModal, zone: { ...zoneModal.zone, zone_description: e.target.value } })}
                  placeholder="e.g. UAE, Saudi Arabia, Kuwait, Qatar"
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="zoneActive"
                  checked={zoneModal.zone?.is_active !== false}
                  onChange={(e) => setZoneModal({ ...zoneModal, zone: { ...zoneModal.zone, is_active: e.target.checked } })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="zoneActive" className="font-bold text-stone-700 cursor-pointer">
                  Zone is active
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setZoneModal({ open: false, isEdit: false, zone: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: MANAGE COUNTRIES FOR ZONE */}
      {/* ──────────────────────────────────────────────────────── */}
      {countriesModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  Assign Countries — {countriesModal.zone?.zone_name}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select which enabled shipping countries belong to this zone.
                </p>
              </div>
              <button onClick={() => setCountriesModal({ open: false, zone: null, search: "", selectedCodes: {} })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
              <input
                type="text"
                value={countriesModal.search}
                onChange={(e) => setCountriesModal({ ...countriesModal, search: e.target.value })}
                placeholder="Search enabled countries..."
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-stone-50 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Countries Checkbox List */}
            <div className="overflow-y-auto flex-1 divide-y divide-stone-100 pr-1 text-xs max-h-96">
              {enabledCountries
                .filter((c) =>
                  c.country_name.toLowerCase().includes(countriesModal.search.toLowerCase()) ||
                  c.country_code.toLowerCase().includes(countriesModal.search.toLowerCase())
                )
                .map((c) => {
                  const code = c.country_code.toUpperCase();
                  const isChecked = !!countriesModal.selectedCodes[code];
                  const currentZone = getAssignedZoneName(code);
                  const isOtherZone = currentZone && currentZone !== countriesModal.zone?.zone_name;

                  return (
                    <label key={code} className="py-2.5 px-2 flex items-center justify-between hover:bg-stone-50 rounded-lg cursor-pointer transition">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setCountriesModal({
                              ...countriesModal,
                              selectedCodes: {
                                ...countriesModal.selectedCodes,
                                [code]: e.target.checked
                              }
                            });
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-base">{getFlagEmoji(code)}</span>
                        <div>
                          <span className="font-bold text-stone-800">{c.country_name}</span>
                          <span className="text-[10px] text-stone-400 font-mono ml-1.5">({code})</span>
                        </div>
                      </div>

                      {isOtherZone && !isChecked && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Currently in: {currentZone}
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t text-xs">
              <span className="text-stone-400 text-[11px]">
                {Object.values(countriesModal.selectedCodes).filter(Boolean).length} countries selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCountriesModal({ open: false, zone: null, search: "", selectedCodes: {} })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCountriesAssignment}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: EDIT RATE FOR METHOD */}
      {/* ──────────────────────────────────────────────────────── */}
      {rateModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  Edit Rate: {rateModal.method?.method_name}
                </h3>
                <p className="text-[11px] text-amber-700 font-bold">Zone: {selectedZone?.zone_name}</p>
              </div>
              <button onClick={() => setRateModal({ open: false, rate: null, method: null })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Base Rate (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rateModal.rate?.base_rate ?? 0}
                  onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, base_rate: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">Applied to every order using this method</span>
              </div>

              {/* First Weight Slab */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">First Weight Slab</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-500 block mb-1">Up to (grams)</label>
                    <input
                      type="number"
                      value={rateModal.rate?.first_weight_grams ?? 500}
                      onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, first_weight_grams: e.target.value } })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rateModal.rate?.first_weight_rate ?? 0}
                      onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, first_weight_rate: e.target.value } })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Weight Slab */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col gap-2">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider">Additional Weight Slabs</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-500 block mb-1">Every (grams) after</label>
                    <input
                      type="number"
                      value={rateModal.rate?.additional_weight_grams ?? 500}
                      onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, additional_weight_grams: e.target.value } })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-1">Additional Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rateModal.rate?.additional_weight_rate ?? 0}
                      onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, additional_weight_rate: e.target.value } })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-amber-700"
                    />
                  </div>
                </div>
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Free Shipping Above (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave blank for none"
                    value={rateModal.rate?.free_shipping_above ?? ""}
                    onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, free_shipping_above: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rateModal.rate?.minimum_order_value ?? 0}
                    onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, minimum_order_value: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rateActive"
                  checked={rateModal.rate?.is_active !== false}
                  onChange={(e) => setRateModal({ ...rateModal, rate: { ...rateModal.rate, is_active: e.target.checked } })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="rateActive" className="font-bold text-stone-700 cursor-pointer">
                  Rate is enabled for this zone
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setRateModal({ open: false, rate: null, method: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: BULK UPDATE RATES BY PERCENTAGE (Step 7) */}
      {/* ──────────────────────────────────────────────────────── */}
      {bulkModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Update Shipping Rates by Percentage</h3>
                <p className="text-[11px] text-gray-500">Apply seasonal inflation or cost adjustments across zones.</p>
              </div>
              <button onClick={() => setBulkModal({ open: false, percentage: 10, zone_id: "all", preview: null, loading: false })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Percentage Change (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={bulkModal.percentage}
                    onChange={(e) => setBulkModal({ ...bulkModal, percentage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono font-bold"
                  />
                  <span className="text-[10px] text-stone-400">e.g. 10 for +10% increase, -5 for 5% discount</span>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Zone</label>
                  <select
                    value={bulkModal.zone_id}
                    onChange={(e) => setBulkModal({ ...bulkModal, zone_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-bold"
                  >
                    <option value="all">All Zones</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.zone_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handlePreviewBulkUpdate}
                  disabled={bulkModal.loading}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold transition border"
                >
                  {bulkModal.loading ? "Calculating..." : "Preview Changes Before Applying"}
                </button>
              </div>

              {/* Preview Table */}
              {bulkModal.preview && (
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-col gap-2 max-h-56 overflow-y-auto">
                  <span className="font-bold text-[11px] text-stone-700">Preview: {bulkModal.preview.length} rates will be updated</span>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-stone-400 uppercase text-[9px] border-b pb-1">
                        <th>Zone</th>
                        <th>Method</th>
                        <th>Old Base</th>
                        <th>New Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/50">
                      {bulkModal.preview.map((p) => (
                        <tr key={p.rate_id}>
                          <td className="py-1">{p.zone_name}</td>
                          <td className="py-1">{p.method_name}</td>
                          <td className="py-1 font-mono text-stone-500">₹{p.old_base_rate}</td>
                          <td className="py-1 font-mono font-bold text-amber-700">₹{p.new_base_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setBulkModal({ open: false, percentage: 10, zone_id: "all", preview: null, loading: false })}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkUpdate}
                disabled={bulkModal.loading || !bulkModal.preview}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm"
              >
                Apply Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT METHOD */}
      {/* ──────────────────────────────────────────────────────── */}
      {methodModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {methodModal.isEdit ? "Edit Shipping Method" : "Add New Shipping Method"}
              </h3>
              <button onClick={() => setMethodModal({ open: false, isEdit: false, method: null })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Method Name *</label>
                <input
                  type="text"
                  required
                  value={methodModal.method?.method_name || ""}
                  onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, method_name: e.target.value } })}
                  placeholder="e.g. Express Shipping"
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Method Code *</label>
                <input
                  type="text"
                  required
                  value={methodModal.method?.method_code || ""}
                  onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, method_code: e.target.value } })}
                  placeholder="e.g. express"
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Est. Days Min</label>
                  <input
                    type="number"
                    min="1"
                    value={methodModal.method?.estimated_days_min || 1}
                    onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, estimated_days_min: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Est. Days Max</label>
                  <input
                    type="number"
                    min="1"
                    value={methodModal.method?.estimated_days_max || 7}
                    onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, estimated_days_max: e.target.value } })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={methodModal.method?.description || ""}
                  onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, description: e.target.value } })}
                  placeholder="e.g. Faster priority courier delivery"
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="methodActive"
                  checked={methodModal.method?.is_active !== false}
                  onChange={(e) => setMethodModal({ ...methodModal, method: { ...methodModal.method, is_active: e.target.checked } })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="methodActive" className="font-bold text-stone-700 cursor-pointer">
                  Method is active
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setMethodModal({ open: false, isEdit: false, method: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT OVERRIDE */}
      {/* ──────────────────────────────────────────────────────── */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {overrideModal.isEdit ? "Edit Country Override" : "Add Country Specific Rate"}
              </h3>
              <button onClick={() => setOverrideModal({ open: false, isEdit: false, override: null })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Country *</label>
                  <select
                    disabled={overrideModal.isEdit}
                    value={overrideModal.override?.country_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const cObj = enabledCountries.find((c) => c.country_code === code);
                      setOverrideModal({
                        ...overrideModal,
                        override: {
                          ...overrideModal.override,
                          country_code: code,
                          country_name: cObj ? cObj.country_name : code
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-bold"
                  >
                    {enabledCountries.map((c) => (
                      <option key={c.country_code} value={c.country_code}>
                        {getFlagEmoji(c.country_code)} {c.country_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Shipping Method *</label>
                  <select
                    value={overrideModal.override?.method_id}
                    onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, method_id: parseInt(e.target.value, 10) } })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-bold"
                  >
                    {methods.map((m) => (
                      <option key={m.id} value={m.id}>{m.method_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Base Rate (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overrideModal.override?.base_rate ?? 0}
                  onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, base_rate: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border">
                <div>
                  <label className="text-stone-500 block mb-1">First Slab (grams)</label>
                  <input
                    type="number"
                    value={overrideModal.override?.first_weight_grams ?? 500}
                    onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, first_weight_grams: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">First Slab Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={overrideModal.override?.first_weight_rate ?? 0}
                    onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, first_weight_rate: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border">
                <div>
                  <label className="text-stone-500 block mb-1">Extra Slab (grams)</label>
                  <input
                    type="number"
                    value={overrideModal.override?.additional_weight_grams ?? 500}
                    onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, additional_weight_grams: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Extra Slab Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={overrideModal.override?.additional_weight_rate ?? 0}
                    onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, additional_weight_rate: e.target.value } })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty for no free shipping"
                  value={overrideModal.override?.free_shipping_above ?? ""}
                  onChange={(e) => setOverrideModal({ ...overrideModal, override: { ...overrideModal.override, free_shipping_above: e.target.value } })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ open: false, isEdit: false, override: null })}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MODAL: BULK IMPORT WEIGHTS CSV */}
      {/* ──────────────────────────────────────────────────────── */}
      {importModal.open && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Bulk Import Product Weights CSV</h3>
              <button onClick={() => setImportModal({ open: false, text: "", loading: false })} className="text-stone-400 hover:text-stone-600">
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <p className="text-stone-500">
                Paste your CSV data below. Format expected:
                <br />
                <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono font-bold text-stone-800 text-[10px] mt-1 inline-block">
                  product_id,product_name,weight_grams,length_cm,width_cm,height_cm
                </code>
              </p>

              <textarea
                rows={8}
                value={importModal.text}
                onChange={(e) => setImportModal({ ...importModal, text: e.target.value })}
                placeholder={`1,"Custom Printed Mug",350,10,8,10\n2,"Personalised T-Shirt",200,30,25,2`}
                className="w-full p-3 border rounded-xl bg-stone-50 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setImportModal({ open: false, text: "", loading: false })}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCSVText}
                disabled={importModal.loading || !importModal.text.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm"
              >
                {importModal.loading ? "Importing..." : "Process Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
