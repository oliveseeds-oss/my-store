import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { formatAdminPrice } from "../utils/currency";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import {
  MdShoppingBag, MdDownload, MdPeople, MdMail,
  MdNotifications, MdWarning, MdFileDownload,
  MdRefresh, MdCheckCircle, MdTrendingUp
} from "react-icons/md";

function StatCard({ icon, label, value, sub, color, border }) {
  return (
    <div className={`bg-white rounded-2xl border ${border || 'border-stone-100'} p-6 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition duration-300`}>
      <div className="flex justify-between items-center">
        <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-stone-800 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-stone-500 font-medium mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exporting, setExporting] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await API.get("/orders/admin/stats");
      setStats(r.data);
    } catch (err) {
      console.error("Failed to load admin dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markAllRead = async () => {
    await API.put("/notifications/read-all");
    load();
  };

  const exportCSV = async (type) => {
    setExporting(type);
    try {
      const r = await API.get(`/orders/admin/export/${type}`);
      const rows = r.data;
      if (!rows.length) { setExporting(""); return; }
      const headers = Object.keys(rows[0]).join(",");
      const csv = [headers, ...rows.map(row =>
        Object.values(row).map(v =>
          `"${String(v ?? "").replace(/"/g, '""')}"`
        ).join(",")
      )].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting("");
    }
  };

  const exportMembers = async () => {
    try {
      const r = await API.get("/members/admin/all");
      const rows = r.data;
      if (!rows.length) return;
      const headers = Object.keys(rows[0]).join(",");
      const csv = [headers, ...rows.map(row =>
        Object.values(row).map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `members-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-stone-400 text-sm animate-pulse">Loading dashboard...</div>
      </div>
    </div>
  );

  const p = stats?.physical || {};
  const d = stats?.digital || {};
  const unread = stats?.unread_notifications || 0;

  // Merge weekly data
  const allDays = {};
  (stats?.weekly_physical || []).forEach(r => {
    allDays[r.day] = { day: r.day.slice(5), phys_rev: Number(r.revenue), phys_ord: r.orders };
  });
  (stats?.weekly_digital || []).forEach(r => {
    if (allDays[r.day]) {
      allDays[r.day].digi_rev = Number(r.revenue);
      allDays[r.day].digi_ord = r.orders;
    } else {
      allDays[r.day] = { day: r.day.slice(5), digi_rev: Number(r.revenue), digi_ord: r.orders };
    }
  });
  const chartData = Object.values(allDays).sort((a, b) => a.day.localeCompare(b.day));

  // Compute aggregated sales totals
  const totalPhysRevenue = Number(p.total_revenue || 0);
  const totalDigiRevenue = Number(d.total_revenue || 0);
  const totalRevenueCombined = totalPhysRevenue + totalDigiRevenue;

  return (
    <div className="flex min-h-screen bg-stone-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Dashboard" />
        <main className="p-6 flex flex-col gap-6 overflow-auto">

          {/* Top actions bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-200 pb-5">
            <div>
              <h1 className="text-xl font-bold text-stone-800 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Executive Overview
              </h1>
              <p className="text-stone-400 text-xs mt-0.5">Real-time e-commerce operational tracking and diagnostics</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={load}
                className="flex items-center gap-1.5 text-xs font-bold border border-stone-200 bg-white
                           hover:bg-stone-100 px-3.5 py-2 rounded-xl transition text-stone-600 shadow-sm cursor-pointer">
                <MdRefresh /> Refresh
              </button>
              <button onClick={() => exportCSV("physical")} disabled={exporting === "physical"}
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600
                           text-white px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer">
                <MdFileDownload />
                {exporting === "physical" ? "Exporting..." : "Export Physical Orders"}
              </button>
              <button onClick={() => exportCSV("digital")} disabled={exporting === "digital"}
                className="flex items-center gap-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-600
                           text-white px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer">
                <MdFileDownload />
                {exporting === "digital" ? "Exporting..." : "Export Digital Orders"}
              </button>
              <button onClick={exportMembers}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700
                           text-white px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer">
                <MdFileDownload /> Export Members
              </button>
              {/* Notification bell */}
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center gap-1.5 text-xs font-bold border border-stone-200
                           bg-white hover:bg-stone-100 px-3.5 py-2 rounded-xl transition text-stone-600 shadow-sm cursor-pointer">
                <MdNotifications className={unread > 0 ? "text-red-500" : ""} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px]
                                   w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
                Alerts
              </button>
            </div>
          </div>

          {/* Notification panel */}
          {notifOpen && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                <h3 className="text-sm font-bold text-stone-700">
                  Recent System Notifications ({unread} unread)
                </h3>
                <button onClick={markAllRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1">
                  <MdCheckCircle /> Mark all read
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {stats?.recent_notifications?.length > 0 ? (
                  stats.recent_notifications.map(n => (
                    <div key={n.id}
                      className={`flex items-start justify-between gap-4 p-3 rounded-xl text-xs transition
                        ${!n.is_read ? "bg-indigo-50/50 border border-indigo-100" : "bg-stone-50 border border-transparent"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                          ${n.type === "new_order" ? "bg-green-500"
                            : n.type === "new_member" ? "bg-indigo-500"
                              : n.type === "contact_message" ? "bg-amber-500"
                                : "bg-stone-400"}`} />
                        <div>
                          <p className="font-bold text-stone-700">{n.title}</p>
                          <p className="text-stone-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-stone-400 mt-1">
                            {new Date(n.created_at).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      {n.link && (
                        <Link to={n.link} className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline">
                          View →
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-stone-400 text-xs">No alerts active</p>
                )}
              </div>
            </div>
          )}

          {/* Combined Top Summary */}
          <div className="bg-gradient-to-r from-stone-850 to-stone-900 text-white rounded-3xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-stone-300 text-xs font-bold uppercase tracking-wider">Total Combined Platform Revenue</p>
              <h2 className="text-4xl font-black tracking-tight mt-1">
                {formatAdminPrice(totalRevenueCombined)}
              </h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-6 text-xs text-stone-200">
              <div>
                <p className="font-semibold opacity-70">Physical Share</p>
                <p className="font-bold text-sm text-amber-300 mt-0.5">{((totalPhysRevenue / (totalRevenueCombined || 1)) * 100).toFixed(0)}%</p>
              </div>
              <div className="border-l border-white/10" />
              <div>
                <p className="font-semibold opacity-70">Digital Share</p>
                <p className="font-bold text-sm text-sky-300 mt-0.5">{((totalDigiRevenue / (totalRevenueCombined || 1)) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<MdShoppingBag className="text-amber-700" />}
              label="Physical Orders" value={p.total_orders || 0}
              sub={`${formatAdminPrice(p.total_revenue || 0)} Revenue`}
              color="bg-amber-50" />
            <StatCard icon={<MdDownload className="text-sky-700" />}
              label="Digital Orders" value={d.total_orders || 0}
              sub={`${formatAdminPrice(d.total_revenue || 0)} Revenue`}
              color="bg-sky-50" />
            <StatCard icon={<MdPeople className="text-indigo-700" />}
              label="Total Members" value={stats?.members || 0}
              sub="Registered users"
              color="bg-indigo-50" />
            <StatCard icon={<MdMail className="text-rose-700" />}
              label="Unread Messages" value={stats?.unread_messages || 0}
              sub="Inquiries waiting"
              color="bg-rose-50" />
          </div>

          {/* Physical order status row */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">Physical Fulfilment Funnel</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Processing", value: p.processing || 0, color: "text-amber-700 bg-amber-50 border border-amber-100" },
                { label: "Shipped", value: p.shipped || 0, color: "text-blue-700 bg-blue-50 border border-blue-100" },
                { label: "Delivered", value: p.delivered || 0, color: "text-green-700 bg-green-50 border border-green-100" },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-4 text-center shadow-sm`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">{s.label}</p>
                  <p className="text-2xl font-black">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Weekly Revenue Breakdown</h3>
                <span className="flex items-center gap-1.5 text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  <MdTrendingUp /> Last 7 Days
                </span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend />
                  <Bar dataKey="phys_rev" name="Physical Sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="digi_rev" name="Digital Sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Orders count chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-5">Order Quantities Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="phys_ord" name="Physical orders"
                    stroke="#f59e0b" strokeWidth={2.5} dot={true} />
                  <Line type="monotone" dataKey="digi_ord" name="Digital orders"
                    stroke="#0ea5e9" strokeWidth={2.5} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Low stock alert */}
          {stats?.low_stock?.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm bg-red-50/20">
              <div className="flex items-center gap-2 mb-4 border-b border-red-100 pb-2">
                <MdWarning className="text-red-500 text-lg" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Critical Low Stock Diagnostics ({stats.low_stock.length} products)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.low_stock.map(p => (
                  <div key={p.product_uid}
                    className={`flex items-center justify-between text-xs p-3 rounded-xl border
                      ${p.stock === 0 ? "bg-red-50 border-red-200" : "bg-white border-stone-200"}`}>
                    <span className="font-semibold text-stone-700 truncate">
                      {p.name}
                      <span className="font-mono text-[10px] text-stone-400 ml-2">{p.product_uid}</span>
                    </span>
                    <span className={`font-black px-2.5 py-0.5 rounded-full text-[10px]
                      ${p.stock === 0 ? "bg-red-200 text-red-800 animate-pulse" : "bg-amber-100 text-amber-800"}`}>
                      {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} UNITS`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}