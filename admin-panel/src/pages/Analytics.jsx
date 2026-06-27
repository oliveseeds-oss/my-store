import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import API from "../api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MdFileDownload, MdTrendingUp, MdPieChart, MdFilterList, MdWarning } from "react-icons/md";

const Stat = ({ label, value, sub, icon, color = "indigo", growth }) => {
  const colors = { 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    green: "bg-green-50 text-green-600 border-green-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
    rose: "bg-rose-50 text-rose-600 border-rose-100" 
  };
  return (
    <div className={`bg-white rounded-2xl border ${colors[color].split(" ")[2]} p-5 shadow-sm hover:shadow-md transition duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <span className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg ${colors[color].split(" ").slice(0,2).join(" ")}`}>{icon}</span>
      </div>
      <p className="text-2xl font-black text-stone-850 tracking-tight">{value ?? "—"}</p>
      {growth !== undefined && (
        <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${parseFloat(growth) >= 0 ? "text-green-650" : "text-red-500"}`}>
          {parseFloat(growth) >= 0 ? "▲" : "▼"} {Math.abs(growth)}% {sub || "vs prev period"}
        </p>
      )}
      {!growth && sub && <p className="text-[10px] text-stone-400 font-semibold mt-1">{sub}</p>}
    </div>
  );
};

export default function Analytics() {
  const [revenue, setRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [period, setPeriod] = useState("30d");
  const [groupBy, setGroupBy] = useState("day");
  const [tab, setTab] = useState("revenue");
  
  // E-commerce Slicing Filter
  const [sliceFilter, setSliceFilter] = useState("all"); // 'all', 'physical', 'digital'

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rev, top, mem, inv] = await Promise.all([
        API.get(`/analytics/revenue?period=${period}&group_by=${groupBy}`),
        API.get(`/analytics/top-products?period=${period}`),
        API.get("/analytics/members"),
        API.get("/analytics/inventory"),
      ]);
      setRevenue(rev.data);
      setTopProducts(top.data);
      setMemberStats(mem.data);
      setInventory(inv.data);
    } catch (e) { 
      console.error("Failed to load analytics details:", e); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [period, groupBy]);

  const exportCSV = async (type) => {
    setExporting(true);
    try {
      const r = await API.get(`/analytics/export?type=${type}&period=${parseInt(period)}`);
      const data = r.data.data;
      if (!data.length) return alert("No data to export");
      const keys = Object.keys(data[0]);
      const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${row[k] ?? ""}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${type}_report_${period}.csv`; a.click();
    } catch { 
      alert("Export failed"); 
    }
    setExporting(false);
  };

  const fmtCurrency = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  return (
    <div className="flex min-h-screen bg-stone-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <Sidebar />
      <div className="flex-grow flex flex-col min-w-0">
        <Topbar title="Analytics & Reports" />
        <main className="flex-grow p-6 flex flex-col gap-6 overflow-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h1 className="text-xl font-bold text-stone-850 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Corporate Analytics
              </h1>
              <p className="text-stone-400 text-xs mt-0.5">Sift e-commerce analytics records and generate PDF / CSV exports</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Period Group */}
              <div className="flex rounded-xl border border-stone-200 overflow-hidden bg-white text-xs shadow-sm">
                {[["7d","7 Days"],["30d","30 Days"],["90d","90 Days"]].map(([v,l]) => (
                  <button key={v} onClick={() => setPeriod(v)}
                    className={`px-3.5 py-2 font-bold transition cursor-pointer ${period===v?"bg-stone-800 text-white":"text-stone-600 hover:bg-stone-50"}`}>{l}</button>
                ))}
              </div>
              
              {/* Export Selector dropdown */}
              <div className="relative group">
                <button disabled={exporting} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm cursor-pointer">
                  <MdFileDownload /> {exporting ? "Exporting..." : "Export Corporate Report"}
                </button>
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg z-20 hidden group-hover:block min-w-36 overflow-hidden">
                  {["orders","products","members"].map(t => (
                    <button key={t} onClick={() => exportCSV(t)}
                      className="block w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 font-bold capitalize transition">
                      {t} report (.csv)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1 shadow-sm w-fit">
              {[["revenue","💰 Revenue Overview"],["products","📦 Product Sales"],["members","👥 Member Portfolios"],["inventory","🏷 Inventory Auditing"]].map(([id,label]) => (
                <button key={id} onClick={() => { setTab(id); setSliceFilter("all"); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${tab===id?"bg-amber-500 text-white shadow-sm":"text-stone-600 hover:bg-stone-50"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Group By Selector (Only Revenue tab) */}
            {tab === "revenue" && (
              <div className="flex items-center gap-2">
                <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Group:</span>
                <div className="flex rounded-xl border border-stone-200 overflow-hidden bg-white text-xs shadow-sm">
                  {[["day","Day"],["week","Week"],["month","Month"]].map(([v,l]) => (
                    <button key={v} onClick={() => setGroupBy(v)}
                      className={`px-3 py-1.5 font-bold transition cursor-pointer ${groupBy===v?"bg-stone-700 text-white":"text-stone-600 hover:bg-stone-50"}`}>{l}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="animate-fadeIn">
              
              {/* ─── REVENUE TAB ─── */}
              {tab === "revenue" && revenue && (
                <div className="space-y-6">
                  {/* Revenue Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat label="Total Corporate Revenue" icon="💰" color="indigo"
                      value={fmtCurrency(revenue.totals?.total_revenue)}
                      growth={revenue.growth?.revenue} />
                    <Stat label="Total Volume (Orders)" icon="🛒" color="green"
                      value={revenue.totals?.total_orders?.toLocaleString()}
                      sub={`Orders processed`} />
                    <Stat label="Avg Transaction (AOV)" icon="📊" color="amber"
                      value={fmtCurrency(revenue.totals?.avg_order_value)}
                      sub={`Ticket size`} />
                    <Stat label="Total Shipping Surcharges" icon="🚚" color="rose"
                      value={fmtCurrency(revenue.totals?.total_shipping)}
                      sub={`Courier collections`} />
                  </div>

                  {/* Revenue Over Time Chart */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold text-stone-800 text-sm leading-snug">Sales Analytics Timeline</h3>
                        <p className="text-stone-400 text-xs mt-0.5">Vibrant revenue stream audit vs order volume curves</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                        <MdTrendingUp /> Performance
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={revenue.chart}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tickFormatter={d => groupBy==="day"?fmtDate(d):d} tick={{ fontSize: 10, fontWeight: "bold" }} />
                        <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v, n) => [fmtCurrency(v), n==="revenue"?"Gross Revenue":"Total Orders"]} />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2.5} name="revenue" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Table */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <h3 className="font-bold text-stone-850 text-sm mb-1">Periodic Auditing Ledgers</h3>
                    <p className="text-xs text-stone-400 mb-4">Detailed transactional logs split by group labels</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-400">
                            {["Period Label","Orders processed","Gross Revenue","Average Ticket"].map(h => (
                              <th key={h} className="text-left pb-3 font-bold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium">
                          {revenue.chart?.slice().reverse().slice(0,10).map((row,i) => (
                            <tr key={i} className="hover:bg-stone-50 transition">
                              <td className="py-3 text-stone-700 font-semibold">{groupBy==="day"?fmtDate(row.label):row.label}</td>
                              <td className="py-3 text-stone-600">{row.orders}</td>
                              <td className="py-3 font-bold text-indigo-600">{fmtCurrency(row.revenue)}</td>
                              <td className="py-3 text-stone-600">{fmtCurrency(row.avg_order_value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PRODUCTS TAB ─── */}
              {tab === "products" && topProducts && (
                <div className="space-y-6">
                  {/* Category Slicer Filter Header */}
                  <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between flex-wrap gap-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <MdFilterList className="text-stone-500 text-lg" />
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Product Categories Slice:</span>
                    </div>
                    <div className="flex rounded-lg border border-stone-200 overflow-hidden bg-white text-xs">
                      {[["all","Combined All"],["physical","🪵 Physical Only"],["digital","💿 Digital Only"]].map(([v,l]) => (
                        <button key={v} onClick={() => setSliceFilter(v)}
                          className={`px-3 py-1.5 font-bold transition cursor-pointer ${sliceFilter===v?"bg-indigo-600 text-white":"text-stone-600 hover:bg-stone-50"}`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Physical Products Top Sellers */}
                    {(sliceFilter === "all" || sliceFilter === "physical") && (
                      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h3 className="font-bold text-stone-800 text-sm mb-4 flex items-center gap-1.5">
                          <span>🪵</span> Physical Crafted Products — Top Sellers
                        </h3>
                        {topProducts.physical?.length ? (
                          <div className="space-y-3">
                            <ResponsiveContainer width="100%" height={160}>
                              <BarChart data={topProducts.physical.slice(0,5)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="product_name" tick={{ fontSize: 9 }} tickFormatter={n => n.length>10?n.slice(0,10)+"…":n} />
                                <YAxis tick={{ fontSize: 9 }} />
                                <Tooltip formatter={(v) => fmtCurrency(v)} />
                                <Bar dataKey="revenue" fill="#f59e0b" radius={[4,4,0,0]} />
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-4">
                              {topProducts.physical.slice(0,5).map((p,i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-transparent hover:border-stone-150 transition">
                                  <span className="w-5.5 h-5.5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-black">{i+1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-stone-800 truncate">{p.product_name}</p>
                                    <p className="text-[10px] text-stone-400 font-semibold mt-0.5">{p.units_sold} units · {p.orders} orders</p>
                                  </div>
                                  <p className="font-bold text-amber-700 text-xs">{fmtCurrency(p.revenue)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : <p className="text-center py-12 text-stone-400 text-xs">No physical sales data</p>}
                      </div>
                    )}

                    {/* Digital Products Top Sellers */}
                    {(sliceFilter === "all" || sliceFilter === "digital") && (
                      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                        <h3 className="font-bold text-stone-800 text-sm mb-4 flex items-center gap-1.5">
                          <span>💿</span> Digital Graphic Products — Top Sellers
                        </h3>
                        {topProducts.digital?.length ? (
                          <div className="space-y-3">
                            <ResponsiveContainer width="100%" height={160}>
                              <BarChart data={topProducts.digital.slice(0,5)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="product_name" tick={{ fontSize: 9 }} tickFormatter={n => n.length>10?n.slice(0,10)+"…":n} />
                                <YAxis tick={{ fontSize: 9 }} />
                                <Tooltip formatter={(v) => fmtCurrency(v)} />
                                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4,4,0,0]} />
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-4">
                              {topProducts.digital.slice(0,5).map((p,i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-transparent hover:border-stone-150 transition">
                                  <span className="w-5.5 h-5.5 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-black">{i+1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-stone-800 truncate">{p.product_name}</p>
                                    <p className="text-[10px] text-stone-400 font-semibold mt-0.5">{p.units_sold} units · {p.orders} orders</p>
                                  </div>
                                  <p className="font-bold text-sky-700 text-xs">{fmtCurrency(p.revenue)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : <p className="text-center py-12 text-stone-400 text-xs">No digital sales data</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── MEMBERS TAB ─── */}
              {tab === "members" && memberStats && (
                <div className="space-y-6">
                  {/* Member Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Total Portfolio Registrations" icon="👥" color="indigo" value={memberStats.totals?.total?.toLocaleString()} />
                    <Stat label="Active Members (Verified)" icon="✅" color="green" value={memberStats.totals?.active?.toLocaleString()} />
                    <Stat label="New Accounts (Last 30 Days)" icon="🆕" color="amber" value={memberStats.totals?.new_this_month?.toLocaleString()} />
                    <Stat label="Suspended / Blocked Accounts" icon="🚫" color="rose" value={memberStats.totals?.blocked?.toLocaleString()} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Registrations graph */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                      <h3 className="font-bold text-stone-800 text-sm mb-4">Member Growth Vector (Last 30 Days)</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={memberStats.registration}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 10, fontWeight: "bold" }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip labelFormatter={fmtDate} />
                          <Bar dataKey="new_members" fill="#10b981" radius={[4,4,0,0]} name="New Accounts" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Spenders List */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                      <h3 className="font-bold text-stone-800 text-sm mb-1">🏆 Top Spenders Leaderboard</h3>
                      <p className="text-stone-400 text-xs mb-4">Registered members with highest billing contributions</p>
                      <div className="space-y-2.5">
                        {memberStats.top_spenders?.slice(0,6).map((m,i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50/50 transition">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white 
                              ${i===0?"bg-amber-500":i===1?"bg-stone-400":i===2?"bg-orange-400":"bg-indigo-400"}`}>
                              {i+1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate">{m.name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">{m.orders} total orders · UID: {m.member_uid}</p>
                            </div>
                            <p className="font-black text-stone-800 text-xs">{fmtCurrency(m.total_spent)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── INVENTORY TAB ─── */}
              {tab === "inventory" && inventory && (
                <div className="space-y-6">
                  {/* Inventory auditing summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Stat label="Total SKU Catalogue" icon="📦" color="indigo" value={inventory.totals?.total?.toLocaleString()} />
                    <Stat label="Gross Warehouse Units" icon="🏷" color="green" value={inventory.totals?.total_units?.toLocaleString()} />
                    <Stat label="Average Unit Catalogue Price" icon="💲" color="amber" value={fmtCurrency(inventory.totals?.avg_price)} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Low Stock Warners */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <MdWarning className="text-amber-500 text-lg" />
                        <h3 className="font-bold text-stone-850 text-sm">Low Stock warnings (≤10 units)</h3>
                      </div>
                      <p className="text-stone-400 text-xs mb-4">Stock level thresholds critical for inventory replenishment</p>
                      {inventory.low_stock?.length ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {inventory.low_stock.map((p,i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition
                              ${p.stock===0?"border-red-200 bg-red-50/55 text-red-800":"border-stone-150 bg-white"}`}>
                              <div>
                                <p className="text-xs font-bold text-stone-800">{p.name}</p>
                                <p className="text-[10px] text-stone-400 font-mono mt-0.5">UID: {p.product_uid}</p>
                              </div>
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full
                                ${p.stock===0?"bg-red-200 text-red-800 animate-pulse":"bg-amber-100 text-amber-800"}`}>
                                {p.stock===0?"OUT OF STOCK" : `${p.stock} LEFT`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-center py-12 text-stone-400 text-xs">All catalogue well stocked</p>}
                    </div>

                    {/* Out of Stock immediately */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                      <h3 className="font-bold text-stone-850 text-sm mb-1">🚫 Out of Stock SKUs</h3>
                      <p className="text-stone-400 text-xs mb-4">Zero units currently located in physical databases</p>
                      {inventory.out_of_stock?.length ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {inventory.out_of_stock.map((p,i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50/30">
                              <div>
                                <p className="text-xs font-bold text-stone-800">{p.name}</p>
                                <p className="text-[10px] text-stone-400 font-mono mt-0.5">UID: {p.product_uid}</p>
                              </div>
                              <span className="text-[9px] bg-red-200 text-red-800 font-black px-2.5 py-0.5 rounded-full">RESTOCK NOW</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-center py-12 text-stone-400 text-xs">No active out of stock products</p>}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}