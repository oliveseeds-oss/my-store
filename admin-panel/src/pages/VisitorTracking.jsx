import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import API from "../api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

const Stat = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-400 text-sm font-medium">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-black text-gray-800">{value?.toLocaleString() ?? "—"}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function VisitorTracking() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("7d");
  const [live, setLive] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [dash, liveRes] = await Promise.all([
        API.get(`/visitors/admin/dashboard?period=${period}`),
        API.get("/visitors/admin/live"),
      ]);
      setData(dash.data);
      setLive(liveRes.data.active_now || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [period]);

  // Auto-refresh live count every 30s
  useEffect(() => {
    const t = setInterval(() => {
      API.get("/visitors/admin/live").then(r => setLive(r.data.active_now || 0)).catch(() => { });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Visitor Tracking" />
        <main className="flex-1 p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-800">Visitor Analytics</h1>
              <p className="text-gray-500 text-sm mt-1">Geo, device, browser, and page tracking</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-green-700">{live} active now</span>
              </div>
              {/* Period selector */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
                {["1d", "7d", "30d"].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-4 py-2 text-sm font-medium transition ${period === p ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                    {p === "1d" ? "Today" : p === "7d" ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Pageviews" value={data.summary?.total} icon="👁️" sub={`Last ${period}`} />
                <Stat label="Unique Visitors" value={data.summary?.unique_visitors} icon="👤" />
                <Stat label="Unique IPs" value={data.summary?.unique_ips} icon="🌐" />
                <Stat label="Live Now" value={live} icon="🟢" sub="Active last 5 min" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Traffic by day */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Traffic Over Time</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={2} dot={false} name="Pageviews" />
                      <Line type="monotone" dataKey="unique_visitors" stroke="#10b981" strokeWidth={2} dot={false} name="Unique" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Top Pages</h3>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {data.by_page?.map((p, i) => {
                      const max = data.by_page[0]?.visits || 1;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700 truncate max-w-48">{p.page}</span>
                              <span className="font-bold text-gray-800">{p.visits}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(p.visits / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                {/* Device Type */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Device Types</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={data.by_device} dataKey="count" nameKey="device_type" cx="50%" cy="50%" outerRadius={60} label={({ device_type, percent }) => `${device_type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {data.by_device?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Browser */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Browsers</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data.by_browser} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="browser" type="category" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* OS */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Operating Systems</h3>
                  <div className="space-y-2">
                    {data.by_os?.map((os, i) => {
                      const max = data.by_os[0]?.count || 1;
                      const osIcons = { Windows: "🪟", macOS: "🍎", Android: "🤖", iOS: "📱", Linux: "🐧" };
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span>{osIcons[os.os] || "💻"}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{os.os}</span>
                              <span className="font-bold text-gray-800">{os.count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(os.count / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* By Country */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Top Countries</h3>
                  <div className="space-y-2">
                    {data.by_country?.map((c, i) => {
                      const max = data.by_country[0]?.count || 1;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{c.geo_country}</span>
                              <span className="font-bold">{c.count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By City */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">Top Cities</h3>
                  <div className="space-y-2">
                    {data.by_city?.map((c, i) => {
                      const max = data.by_city[0]?.count || 1;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{c.geo_city}, {c.geo_country}</span>
                              <span className="font-bold">{c.count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Visitors Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Recent Visitors</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>{["IP", "Page", "Country", "City", "Device", "Browser", "Time"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {data.recent_visitors?.map((v, i) => (
                        <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.ip}</td>
                          <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{v.page}</td>
                          <td className="px-4 py-3 text-gray-600">{v.geo_country || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{v.geo_city || "—"}</td>
                          <td className="px-4 py-3"><span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{v.device_type}</span></td>
                          <td className="px-4 py-3 text-gray-600">{v.browser || "—"}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(v.visited_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}