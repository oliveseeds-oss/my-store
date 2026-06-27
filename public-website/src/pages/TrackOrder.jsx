import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

const STEPS = ["Picked Up", "In Transit", "Out for Delivery", "Delivered"];
const STEP_ICONS = ["📦", "🚛", "🏍️", "✅"];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [tracking, setTracking] = useState(params.get("tracking") || "");
  const [orderId] = useState(params.get("order") || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) fetchByOrder();
    else if (params.get("tracking")) search();
  }, []);

  const fetchByOrder = async () => {
    setLoading(true);
    try {
      const r = await API.get(`/shipping/order/${orderId}`);
      setData(r.data);
    } catch { setError("No tracking info found for this order yet."); }
    setLoading(false);
  };

  const search = async () => {
    if (!tracking.trim()) return;
    setLoading(true); setError("");
    try {
      const r = await API.get(`/shipping/track/${tracking.trim()}`);
      setData(r.data);
    } catch { setError("Tracking number not found. Please check and try again."); setData(null); }
    setLoading(false);
  };

  const currentStep = data ? Math.max(0, STEPS.indexOf(data.status)) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-500">Enter your tracking number to see the latest status</p>
        </div>

        {/* Search Box */}
        <div className="flex gap-3 mb-8">
          <input
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Enter tracking number (e.g. DL1234567890)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
          <button onClick={search} disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {loading ? "..." : "Track"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm mb-6 border border-red-200">
            ❌ {error}
          </div>
        )}

        {data && (
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="text-xl font-mono font-bold text-indigo-600">{data.tracking_number}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold
                  ${data.status === "Delivered" ? "bg-green-100 text-green-700" :
                    data.status === "Out for Delivery" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"}`}>
                  {STEP_ICONS[STEPS.indexOf(data.status)] || "📦"} {data.status}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Courier</p>
                  <p className="font-semibold">{data.partner_name || data.partner}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="font-semibold">#{data.order_id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Est. Delivery</p>
                  <p className="font-semibold">
                    {data.estimated_delivery
                      ? new Date(data.estimated_delivery).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                      : "TBD"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Recipient</p>
                  <p className="font-semibold truncate">{data.recipient || "—"}</p>
                </div>
              </div>
              {data.partner_track_url && (
                <a href={data.partner_track_url} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
                  🔗 Track on {data.partner_name} website →
                </a>
              )}
            </div>

            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-6">Shipment Progress</h3>
              <div className="flex items-center justify-between relative">
                {/* Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0 mx-5">
                  <div className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0}%` }} />
                </div>
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition
                        ${done ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-400"}
                        ${active ? "ring-4 ring-indigo-200" : ""}`}>
                        {done ? (i === currentStep ? STEP_ICONS[i] : "✓") : STEP_ICONS[i]}
                      </div>
                      <p className={`text-xs mt-2 font-semibold text-center leading-tight
                        ${done ? "text-indigo-700" : "text-gray-400"}`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            {data.events?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-5">Tracking History</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                  {data.events.map((event, i) => (
                    <div key={i} className="flex gap-4 mb-5 last:mb-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 shadow-sm
                        ${i === 0 ? "bg-indigo-600 text-white" : "bg-white border-2 border-gray-200 text-gray-500"}`}>
                        {i === 0 ? "●" : "○"}
                      </div>
                      <div className={`flex-1 pb-5 last:pb-0 ${i < data.events.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm font-bold ${i === 0 ? "text-indigo-700" : "text-gray-700"}`}>{event.status}</p>
                            {event.description && <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>}
                            {event.location && <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>}
                          </div>
                          <p className="text-xs text-gray-400 whitespace-nowrap ml-3">
                            {new Date(event.event_time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help */}
        <div className="mt-8 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-1">Having trouble with your shipment?</p>
          <Link to="/contact" className="text-sm text-indigo-600 font-semibold hover:underline">Contact Support →</Link>
        </div>
      </div>
    </div>
  );
}