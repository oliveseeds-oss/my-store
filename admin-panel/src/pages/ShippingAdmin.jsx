import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const STATUS_STYLES = {
  "Picked Up":        "bg-blue-100 text-blue-700",
  "In Transit":       "bg-indigo-100 text-indigo-700",
  "Out for Delivery": "bg-amber-100 text-amber-700",
  "Delivered":        "bg-green-100 text-green-700",
  "Failed":           "bg-red-100 text-red-700",
  "Returned":         "bg-gray-100 text-gray-600",
};

const PARTNERS = ["delhivery","shiprocket","dtdc","bluedart","india_post","ekart","xpressbees"];

export default function ShippingAdmin() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [tab, setTab] = useState("shipments");  // shipments | create | tracking
  const [selected, setSelected] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [trackNum, setTrackNum] = useState("");

  // Create shipment form
  const [createForm, setCreateForm] = useState({
    order_id: "", partner: "delhivery", tracking_number: "",
    estimated_delivery: "", notes: ""
  });
  const [createMsg, setCreateMsg] = useState("");
  const [creating, setCreating] = useState(false);

  // Update status form
  const [updateForm, setUpdateForm] = useState({ status: "", location: "", description: "" });
  const [updating, setUpdating] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (statusFilter) params.append("status", statusFilter);
    if (partnerFilter) params.append("partner", partnerFilter);
    try {
      const r = await API.get(`/shipping/admin/all?${params}`);
      setShipments(r.data);
    } catch { console.error("Failed to load shipments"); }
    setLoading(false);
  };

  useEffect(() => { fetchShipments(); }, [search, statusFilter, partnerFilter]);

  const createShipment = async () => {
    if (!createForm.order_id || !createForm.tracking_number) {
      setCreateMsg("❌ Order ID and tracking number are required"); return;
    }
    setCreating(true);
    try {
      await API.post("/shipping/create", createForm);
      setCreateMsg("✅ Shipment created successfully!");
      setCreateForm({ order_id:"", partner:"delhivery", tracking_number:"", estimated_delivery:"", notes:"" });
      fetchShipments();
    } catch (e) {
      setCreateMsg("❌ " + (e.response?.data?.error || "Failed to create shipment"));
    }
    setCreating(false);
    setTimeout(() => setCreateMsg(""), 4000);
  };

  const updateStatus = async (shipmentId) => {
    if (!updateForm.status) { alert("Select a status"); return; }
    setUpdating(true);
    try {
      await API.put(`/shipping/${shipmentId}/status`, updateForm);
      setSelected(null);
      fetchShipments();
    } catch { alert("Update failed"); }
    setUpdating(false);
  };

  const trackShipment = async () => {
    if (!trackNum.trim()) return;
    try {
      const r = await API.get(`/shipping/track/${trackNum.trim()}`);
      setTrackData(r.data);
    } catch { setTrackData({ error: "Tracking number not found" }); }
  };

  const STEPS = ["Picked Up","In Transit","Out for Delivery","Delivered"];
  const STEP_ICONS = ["📦","🚛","🏍️","✅"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Shipping & Tracking" />
        <main className="flex-1 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">Shipping & Tracking</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage shipments · Connect partners · Track orders</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit shadow-sm">
            {[["shipments","📋 Shipments"],["create","➕ Create Shipment"],["tracking","🔍 Track Package"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===id?"bg-indigo-600 text-white shadow":"text-gray-600 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── SHIPMENTS LIST ── */}
          {tab === "shipments" && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-5">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search order, tracking, customer..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white w-64" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">All Statuses</option>
                  {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">All Partners</option>
                  {PARTNERS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {!shipments.length ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-4xl mb-3">🚚</div>
                      <p>No shipments found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>{["Order","Tracking #","Customer","Partner","Status","Est. Delivery","Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody>
                          {shipments.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                              <td className="px-4 py-3 font-bold text-indigo-600">#{s.order_id}</td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-700">{s.tracking_number}</td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-800">{s.guest_name}</p>
                                <p className="text-xs text-gray-400">{s.guest_email}</p>
                              </td>
                              <td className="px-4 py-3 capitalize text-gray-600">{s.partner}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[s.status] || "bg-gray-100 text-gray-600"}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "TBD"}
                              </td>
                              <td className="px-4 py-3">
                                <button onClick={() => { setSelected(s); setUpdateForm({ status:s.status, location:"", description:"" }); }}
                                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition mr-2">
                                  Update
                                </button>
                                <button onClick={() => { setTrackNum(s.tracking_number); setTab("tracking"); setTimeout(trackShipment,100); }}
                                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                                  Track
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Update Status Modal */}
              {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-black text-gray-800">Update Shipment Status</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Order #{selected.order_id} · {selected.tracking_number}</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">New Status</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(STATUS_STYLES).map(s => (
                            <button key={s} onClick={() => setUpdateForm(f => ({...f, status:s}))}
                              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${updateForm.status===s?"border-indigo-400 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Location</label>
                        <input value={updateForm.location} onChange={e => setUpdateForm(f=>({...f,location:e.target.value}))}
                          placeholder="e.g. Chennai Hub, Tamil Nadu"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Description (optional)</label>
                        <input value={updateForm.description} onChange={e => setUpdateForm(f=>({...f,description:e.target.value}))}
                          placeholder="e.g. Package arrived at sorting facility"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => updateStatus(selected.id)} disabled={updating}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-60">
                        {updating ? "Updating..." : "Update Status"}
                      </button>
                      <button onClick={() => setSelected(null)}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CREATE SHIPMENT ── */}
          {tab === "create" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-800 mb-1">Create New Shipment</h3>
                <p className="text-sm text-gray-500 mb-6">Assign a tracking number to an order and notify the customer</p>

                {createMsg && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${createMsg.startsWith("✅")?"bg-green-50 text-green-700 border border-green-200":"bg-red-50 text-red-700 border border-red-200"}`}>
                    {createMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Order ID *</label>
                    <input value={createForm.order_id} onChange={e => setCreateForm(f=>({...f,order_id:e.target.value}))}
                      placeholder="e.g. 42" type="number"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Shipping Partner *</label>
                    <select value={createForm.partner} onChange={e => setCreateForm(f=>({...f,partner:e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {PARTNERS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1).replace("_"," ")}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tracking / AWB Number *</label>
                    <input value={createForm.tracking_number} onChange={e => setCreateForm(f=>({...f,tracking_number:e.target.value}))}
                      placeholder="e.g. DL1234567890IN"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Estimated Delivery</label>
                    <input type="date" value={createForm.estimated_delivery} onChange={e => setCreateForm(f=>({...f,estimated_delivery:e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Internal Notes</label>
                    <input value={createForm.notes} onChange={e => setCreateForm(f=>({...f,notes:e.target.value}))}
                      placeholder="Optional notes for admin reference"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                  <strong>💡 Auto-actions on creation:</strong> Order status → Shipped · Member notified via notification center · Admin log created
                </div>

                <button onClick={createShipment} disabled={creating}
                  className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition disabled:opacity-60">
                  {creating ? "Creating..." : "🚀 Create Shipment & Notify Customer"}
                </button>
              </div>

              {/* Partner Integration Info */}
              <div className="mt-5 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">🔗 Shipping Partner Integration</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name:"Delhivery", status:"Ready", color:"green", url:"https://www.delhivery.com" },
                    { name:"Shiprocket", status:"Ready", color:"green", url:"https://app.shiprocket.in" },
                    { name:"DTDC", status:"Ready", color:"green", url:"https://www.dtdc.in" },
                    { name:"Blue Dart", status:"Ready", color:"green", url:"https://www.bluedart.com" },
                    { name:"India Post", status:"Ready", color:"green", url:"https://www.indiapost.gov.in" },
                    { name:"Ekart", status:"Ready", color:"green", url:"https://ekartlogistics.com" },
                  ].map(p => (
                    <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div>
                        <p className="text-sm font-bold text-gray-700">{p.name}</p>
                        <span className="text-xs text-green-600 font-medium">● {p.status}</span>
                      </div>
                      <a href={p.url} target="_blank" rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline">Manage →</a>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  To enable live tracking API sync, add partner API keys in Settings → Shipping Partners. 
                  Currently using manual AWB entry mode.
                </p>
              </div>
            </div>
          )}

          {/* ── TRACK PACKAGE ── */}
          {tab === "tracking" && (
            <div className="max-w-2xl">
              <div className="flex gap-3 mb-6">
                <input value={trackNum} onChange={e => setTrackNum(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && trackShipment()}
                  placeholder="Enter tracking / AWB number"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                <button onClick={trackShipment}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
                  Track
                </button>
              </div>

              {trackData && (
                trackData.error ? (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">❌ {trackData.error}</div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tracking Number</p>
                          <p className="text-xl font-mono font-black text-indigo-600">{trackData.tracking_number}</p>
                        </div>
                        <span className={`text-sm px-3 py-1.5 rounded-full font-bold ${STATUS_STYLES[trackData.status]||"bg-gray-100 text-gray-600"}`}>
                          {trackData.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Courier</p>
                          <p className="font-bold capitalize">{trackData.partner}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Order</p>
                          <p className="font-bold">#{trackData.order_id}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400">Est. Delivery</p>
                          <p className="font-bold">{trackData.estimated_delivery ? new Date(trackData.estimated_delivery).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "TBD"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <h3 className="font-bold text-gray-800 mb-5">Progress</h3>
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-5">
                          <div className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${Math.max(0,STEPS.indexOf(trackData.status)) / (STEPS.length-1) * 100}%` }} />
                        </div>
                        {STEPS.map((step, i) => {
                          const done = i <= STEPS.indexOf(trackData.status);
                          return (
                            <div key={step} className="flex flex-col items-center z-10 flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${done?"bg-indigo-600 border-indigo-600 text-white":"bg-white border-gray-300 text-gray-300"}`}>
                                {done ? (i===STEPS.indexOf(trackData.status)?STEP_ICONS[i]:"✓") : STEP_ICONS[i]}
                              </div>
                              <p className={`text-xs mt-2 text-center font-semibold ${done?"text-indigo-600":"text-gray-400"}`}>{step}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Events */}
                    {trackData.events?.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-5">Tracking Timeline</h3>
                        <div className="space-y-4">
                          {trackData.events.map((e,i) => (
                            <div key={i} className={`flex gap-4 p-3 rounded-lg ${i===0?"bg-indigo-50 border border-indigo-100":""}`}>
                              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i===0?"bg-indigo-600":"bg-gray-300"}`} />
                              <div>
                                <p className="text-sm font-bold text-gray-800">{e.status}</p>
                                {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                                {e.location && <p className="text-xs text-gray-400">📍 {e.location}</p>}
                                <p className="text-xs text-gray-400 mt-1">{new Date(e.event_time).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}