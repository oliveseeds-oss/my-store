import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { formatAdminPrice } from "../utils/currency";
import { MdSearch, MdExpandMore, MdFilterList, MdLocalShipping, MdBookmark, MdHelp, MdOpenInNew, MdAddCircleOutline } from "react-icons/md";

const ENV_STATUS = ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];
const DIG_PAYMENT = ["Pending", "Paid", "Failed", "Refunded"];
const DIG_STATUS  = ["Processing", "Ready", "Delivered", "Refunded"];
const PARTNERS = ["delhivery", "shiprocket", "dtdc", "bluedart", "india_post", "ekart", "xpressbees"];

const BADGE = {
  Processing: "bg-amber-100 text-amber-700",
  Packed: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-sky-100 text-sky-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
  Returned: "bg-orange-100 text-orange-700",
  Pending: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
  Ready: "bg-sky-100 text-sky-700",
  Refunded: "bg-gray-100 text-gray-600",
};

export default function Orders() {
  const [tab, setTab] = useState("engraved");
  const [engOrders, setEngOrders] = useState([]);
  const [digOrders, setDigOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  // Editable fields per order to avoid input lag
  const [editShipping, setEditShipping] = useState({});
  const [demoLoading, setDemoLoading] = useState(false);

  const loadEngraved = async () => {
    try {
      const r = await API.get(`/orders/admin/engraved?search=${search}`);
      setEngOrders(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDigital = async () => {
    try {
      const r = await API.get(`/orders/admin/digital?search=${search}`);
      setDigOrders(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEngraved();
    loadDigital();
  }, [search]);

  const updateEngravedStatus = async (id, delivery_status, tracking_number, courier_name) => {
    try {
      await API.put(`/orders/admin/engraved/${id}/status`, {
        delivery_status,
        tracking_number,
        courier_name
      });
      loadEngraved();
    } catch (e) {
      alert("Failed to update status: " + (e.response?.data?.error || e.message));
    }
  };

  const handleUpdateShippingInfo = async (orderId, trackingNumber, courierName, deliveryStatus) => {
    try {
      await API.put(`/orders/admin/engraved/${orderId}/status`, {
        delivery_status: deliveryStatus,
        tracking_number: trackingNumber,
        courier_name: courierName
      });
      alert("✅ Shipping information updated successfully!");
      loadEngraved();
    } catch (e) {
      alert("❌ Failed to update shipping details: " + (e.response?.data?.error || e.message));
    }
  };

  const updateDigitalStatus = async (id, payment_status, delivery_status) => {
    try {
      await API.put(`/orders/admin/digital/${id}/status`, {
        payment_status,
        delivery_status
      });
      loadDigital();
    } catch (e) {
      alert("Failed to update digital status: " + (e.response?.data?.error || e.message));
    }
  };

  const handleCreateDemoOrder = async () => {
    setDemoLoading(true);
    try {
      const isPhys = tab === "engraved";
      const demoPayload = {
        guest_name: isPhys ? "Demo Customer (Physical)" : "Demo Customer (Digital)",
        guest_email: `demo_${Date.now()}@example.com`,
        guest_phone: "9876543210",
        address_line: "123 Innovation Street, Technopark, Chennai, Tamil Nadu, India, 600001",
        shipping_fee: isPhys ? 60 : 0,
        items: [
          {
            type: isPhys ? "physical" : "digital",
            product_id: 1,
            product_uid: isPhys ? "PRD-MOCK-101" : "DPD-MOCK-202",
            product_name: isPhys ? "Premium Engraved Wood Frame" : "Abstract Artwork High-Res PDF",
            selected_size: isPhys ? "A4 Size" : null,
            price: isPhys ? 1299.00 : 499.00,
            qty: 1
          }
        ]
      };
      
      const r = await API.post("/orders", demoPayload);
      alert(`🎉 Demo Order Placed! ID: ${r.data.order_id}`);
      
      // Auto-set search or refresh
      setSearch("");
      loadEngraved();
      loadDigital();
    } catch (e) {
      alert("❌ Failed to place demo order: " + (e.response?.data?.error || e.message));
    }
    setDemoLoading(false);
  };

  const allOrders = tab === "engraved" ? engOrders : digOrders;

  // Perform status filtering in memory for instant UX updates
  const filteredOrders = allOrders.filter(o => {
    if (!statusFilter) return true;
    const currentStatus = o.delivery_status || o.payment_status || "";
    return currentStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Orders Management" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">

          {/* Header Dashboard Stats */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Fulfillment Desk</p>
              <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
            </div>
            
            <button
              onClick={handleCreateDemoOrder}
              disabled={demoLoading}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg hover:shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50">
              <MdAddCircleOutline className="text-lg" />
              {demoLoading ? "Creating Demo..." : "✨ Create Demo Order"}
            </button>
          </div>

          {/* Search, Filter & Tab Controls */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-full sm:w-fit">
              {[["engraved", "📦 Engraved Orders"], ["digital", "⚡ Digital Orders"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setStatusFilter(""); }}
                  className={`flex-1 sm:flex-none px-4 py-2.5 text-xs rounded-lg font-bold transition flex items-center justify-center gap-2
                    ${tab === key ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}>
                  {label}
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-500">
                    {key === "engraved" ? engOrders.length : digOrders.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <MdSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${tab === "engraved" ? "engraved" : "digital"} orders...`}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white font-semibold text-gray-600 appearance-none pr-8">
                  <option value="">All Statuses</option>
                  {tab === "engraved"
                    ? ENV_STATUS.map(s => <option key={s} value={s}>{s}</option>)
                    : [...new Set([...DIG_PAYMENT, ...DIG_STATUS])].map(s => <option key={s} value={s}>{s}</option>)
                  }
                </select>
                <MdFilterList className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>

            </div>
          </div>

          {/* List of Orders */}
          <div className="flex flex-col gap-3">
            {filteredOrders.map(o => {
              const trackingVal = editShipping[o.order_id]?.tracking_number ?? o.tracking_number ?? "";
              const courierVal = editShipping[o.order_id]?.courier_name ?? "delhivery";

              return (
                <div key={o.order_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md/50 transition duration-200">
                  
                  {/* Header Row */}
                  <div
                    onClick={() => setExpanded(expanded === o.order_id ? null : o.order_id)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`font-mono text-xs px-2.5 py-1 rounded font-black
                        ${tab === "engraved" ? "text-indigo-600 bg-indigo-50 border border-indigo-100/50" : "text-sky-600 bg-sky-50 border border-sky-100/50"}`}>
                        {o.order_id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {o.ship_full_name || o.member_name || o.guest_name || "Guest Checkout"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{o.product_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm font-black text-gray-800">{formatAdminPrice(o.total_amount)}</span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                        ${BADGE[o.delivery_status] || BADGE[o.payment_status] || "bg-gray-100 text-gray-600"}`}>
                        {o.delivery_status || o.payment_status}
                      </span>
                      <MdExpandMore className={`text-gray-400 text-xl transition-transform duration-300
                        ${expanded === o.order_id ? "rotate-180 text-indigo-600" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expanded === o.order_id && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30 flex flex-col gap-6">
                      
                      {/* Grid with Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Invoice Number</p>
                          <p className="font-mono text-gray-700 font-bold">{o.invoice_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Customer Member ID</p>
                          <p className="font-mono text-indigo-600 font-black">{o.member_id || "Guest Checkout"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Order Timestamp</p>
                          <p className="text-gray-700 font-semibold">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Payment Mode</p>
                          <p className="text-gray-700 font-semibold">{o.payment_mode || "COD"}</p>
                        </div>

                        {tab === "engraved" && (
                          <>
                            <div className="col-span-2">
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Shipping Destination Address</p>
                              <p className="text-gray-700 font-medium leading-relaxed">
                                {[o.ship_street, o.ship_city, o.ship_state, o.ship_pincode].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Engraved Size / Qty</p>
                              <p className="text-gray-700 font-semibold">{o.selected_size || "Standard"} × {o.quantity || 1}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Delhivery Tracking Link</p>
                              {o.tracking_number ? (
                                <a
                                  href={`https://www.delhivery.com/track/package/${o.tracking_number}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition">
                                  {o.tracking_number} <MdOpenInNew />
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">No tracking set yet</span>
                              )}
                            </div>
                          </>
                        )}

                        {tab === "digital" && (
                          <>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Product format</p>
                              <p className="text-gray-700 font-semibold uppercase">{o.file_format || "ZIP / PDF"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Fulfillment status</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[o.delivery_status] || "bg-gray-100"}`}>
                                {o.delivery_status || "Completed"}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Link downloads count</p>
                              <p className="text-gray-700 font-semibold">{o.download_count ?? 0} / {o.max_downloads || 5}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Link expiry date</p>
                              <p className="text-gray-700 font-semibold">
                                {o.download_expires ? new Date(o.download_expires).toLocaleDateString("en-IN") : "Never Expires"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Shipping information entry (PHYSICAL ONLY) */}
                      {tab === "engraved" && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row items-end gap-3 shadow-sm">
                          <div className="flex-1 w-full">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Shipping Partner / Courier</label>
                            <select
                              value={courierVal}
                              onChange={e => setEditShipping(prev => ({
                                ...prev,
                                [o.order_id]: { ...prev[o.order_id], courier_name: e.target.value }
                              }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-medium">
                              {PARTNERS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                          </div>
                          
                          <div className="flex-1 w-full col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Delhivery Tracking / AWB Number</label>
                            <input
                              value={trackingVal}
                              onChange={e => setEditShipping(prev => ({
                                ...prev,
                                [o.order_id]: { ...prev[o.order_id], tracking_number: e.target.value }
                              }))}
                              placeholder="e.g. DL1234567890IN"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>

                          <button
                            onClick={() => handleUpdateShippingInfo(o.order_id, trackingVal, courierVal, o.delivery_status)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition whitespace-nowrap w-full md:w-auto">
                            Update Shipping
                          </button>
                        </div>
                      )}

                      {/* Status updates sections */}
                      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        {tab === "engraved" ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                              <MdLocalShipping className="text-indigo-600 text-base" /> Change Status:
                            </p>
                            {ENV_STATUS.map(s => (
                              <button
                                key={s}
                                onClick={() => updateEngravedStatus(o.order_id, s, o.tracking_number, o.courier_name)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                  ${o.delivery_status === s
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {/* Digital Payment Status */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                                💳 Payment Status:
                              </p>
                              {DIG_PAYMENT.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateDigitalStatus(o.order_id, s, o.delivery_status)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                    ${o.payment_status === s
                                      ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-100"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-sky-300 hover:bg-sky-50/30"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                            
                            {/* Digital Delivery Status */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                                ⚡ Delivery Status:
                              </p>
                              {DIG_STATUS.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateDigitalStatus(o.order_id, o.payment_status, s)}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition duration-200
                                    ${o.delivery_status === s
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">📭</span>
                <p className="font-semibold">No orders found matching the filter criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}