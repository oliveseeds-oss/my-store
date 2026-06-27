import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdSearch, MdBlock, MdCheckCircle, MdPerson,
         MdShoppingBag, MdDownload, MdClose, MdOpenInNew } from "react-icons/md";

const STATUS_COLOR = {
  Active:  "bg-green-100 text-green-700",
  Blocked: "bg-red-100 text-red-600",
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    const r = await API.get(`/members/admin/all?${params}`);
    setMembers(r.data);
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const openDetail = async (m) => {
    setSelected(m);
    setLoadingDetail(true);
    try {
      const r = await API.get(`/members/admin/${m.member_id}`);
      setDetail(r.data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleStatus = async (member_id, current) => {
    const next = current === "Active" ? "Blocked" : "Active";
    await API.put(`/members/admin/${member_id}/status`, { status: next });
    load();
    if (detail && detail.member.member_id === member_id) {
      setDetail(d => ({ ...d, member: { ...d.member, status: next } }));
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Members" />
        <main className="p-6 flex gap-4 min-h-0">

          {/* ── Member list ── */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                <input value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, ID..."
                  className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full" />
              </div>
              {["", "Active", "Blocked"].map(s => (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition
                    ${filterStatus === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                  {s || "All"}
                  {s && ` (${members.filter(m => m.status === s).length})`}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-400 text-left text-xs">
                  <tr>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.member_id}
                      onClick={() => openDetail(m)}
                      className={`border-t border-gray-50 hover:bg-indigo-50/30 cursor-pointer
                        ${selected?.member_id === m.member_id ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50
                                         px-2 py-0.5 rounded">
                          {m.member_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{m.full_name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.email}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {[m.city, m.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${STATUS_COLOR[m.status]}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(m.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); toggleStatus(m.member_id, m.status); }}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                                      border transition
                            ${m.status === "Active"
                              ? "text-red-500 border-red-100 hover:bg-red-50"
                              : "text-green-600 border-green-100 hover:bg-green-50"}`}>
                          {m.status === "Active"
                            ? <><MdBlock className="text-sm" />Block</>
                            : <><MdCheckCircle className="text-sm" />Unblock</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Detail panel ── */}
          {selected && (
            <div className="w-80 flex-shrink-0 flex flex-col gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center
                                    justify-center">
                      <MdPerson className="text-indigo-500 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">
                        {detail?.member.full_name || selected.full_name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${STATUS_COLOR[detail?.member.status || selected.status]}`}>
                        {detail?.member.status || selected.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setDetail(null); }}
                    className="text-gray-300 hover:text-gray-500">
                    <MdClose />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-indigo-50 rounded-lg px-3 py-2">
                    <p className="text-indigo-400 mb-0.5">Member ID</p>
                    <p className="font-mono font-bold text-indigo-700">
                      {detail?.member.member_id || selected.member_id}
                    </p>
                  </div>
                  {[
                    { label: "Email",   value: detail?.member.email },
                    { label: "Phone",   value: detail?.member.phone },
                    { label: "Street",  value: detail?.member.street },
                    { label: "Apt/Suite", value: detail?.member.apt_suite },
                    { label: "City",    value: detail?.member.city },
                    { label: "State",   value: detail?.member.state },
                    { label: "Country", value: detail?.member.country },
                    { label: "Pincode", value: detail?.member.pincode },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="flex gap-2">
                      <p className="text-gray-400 w-20 flex-shrink-0">{label}</p>
                      <p className="text-gray-700 flex-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {detail?.stats && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Order summary</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <MdShoppingBag className="text-amber-500 text-lg mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-700">
                        {detail.stats.env_orders || 0}
                      </p>
                      <p className="text-xs text-amber-600">Engraved orders</p>
                      <p className="text-xs text-amber-500 mt-0.5">
                        ₹{Number(detail.stats.env_spend || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-3 text-center">
                      <MdDownload className="text-sky-500 text-lg mx-auto mb-1" />
                      <p className="text-lg font-bold text-sky-700">
                        {detail.stats.dig_orders || 0}
                      </p>
                      <p className="text-xs text-sky-600">Digital orders</p>
                      <p className="text-xs text-sky-500 mt-0.5">
                        ₹{Number(detail.stats.dig_spend || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Engraved orders */}
              {detail?.engraved_orders?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Physical Orders Tracking ({detail.engraved_orders.length})
                  </p>
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                    {detail.engraved_orders.map(o => {
                      const isPlaced = true;
                      const isShipped = o.delivery_status === "Shipped" || o.delivery_status === "Delivered" || o.delivery_status === "Out for Delivery";
                      const isDelivered = o.delivery_status === "Delivered";
                      const isCancelled = o.delivery_status === "Cancelled";
                      
                      return (
                        <div key={o.order_id}
                          className="border border-gray-100 rounded-xl p-3 text-xs bg-gray-50/20 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-mono text-indigo-600 font-bold">{o.order_id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                              ${o.delivery_status === "Delivered"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : o.delivery_status === "Shipped"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : o.delivery_status === "Cancelled"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                              {o.delivery_status}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 font-semibold truncate">{o.product_name}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">{o.invoice_no} · ₹{o.total_amount}</p>
                          
                          {o.tracking_number && (
                            <a 
                              href={`https://www.delhivery.com/track/package/${o.tracking_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline font-bold mt-2 bg-indigo-50/50 px-2 py-1 rounded-lg">
                              🚚 AWB: {o.tracking_number} ↗
                            </a>
                          )}
                          
                          {/* Mini Stepper */}
                          {!isCancelled ? (
                            <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-gray-100 text-[9px] font-bold text-gray-400">
                              <span className={isPlaced ? "text-indigo-600" : "text-gray-300"}>Placed</span>
                              <span className={`flex-1 h-0.5 ${isShipped ? "bg-indigo-600" : "bg-gray-200"}`} />
                              <span className={isShipped ? "text-blue-600" : "text-gray-300"}>Shipped</span>
                              <span className={`flex-1 h-0.5 ${isDelivered ? "bg-green-500" : "bg-gray-200"}`} />
                              <span className={isDelivered ? "text-green-600" : "text-gray-300"}>Delivered</span>
                            </div>
                          ) : (
                            <div className="text-[10px] font-bold text-red-500 mt-2 text-center bg-red-50/40 py-1 rounded-lg">
                              Order Cancelled/Returned
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Digital orders */}
              {detail?.digital_orders?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Digital orders ({detail.digital_orders.length})
                  </p>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {detail.digital_orders.map(o => (
                      <div key={o.order_id}
                        className="border border-gray-50 rounded-lg p-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-mono text-sky-600">{o.order_id}</span>
                          <span className={`px-1.5 rounded text-xs
                            ${o.payment_status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"}`}>
                            {o.payment_status}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-0.5 truncate">{o.product_name}</p>
                        <p className="text-gray-400">
                          {o.invoice_no} · ₹{o.total_amount} ·
                          {o.download_count}/{o.max_downloads} downloads
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loadingDetail && (
                <div className="text-center py-4 text-gray-400 text-xs animate-pulse">
                  Loading member details...
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}