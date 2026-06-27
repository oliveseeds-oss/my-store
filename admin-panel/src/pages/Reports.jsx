import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdMonetizationOn, MdLocalShipping, MdPercent, MdShoppingCart, MdFileDownload } from "react-icons/md";
import { formatAdminPrice } from "../utils/currency";

export default function Reports() {
  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const r = await API.get(`/analytics/reports?period=${period}`);
      setData(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = [
      ["Metric", "Value"],
      ["Period", period.toUpperCase()],
      ["Gross Sales (INR)", data.summary.gross_sales],
      ["Net Sales (INR)", data.summary.net_sales],
      ["Total Tax Collected (INR)", data.summary.total_tax],
      ["CGST Collected (9% INR)", data.summary.cgst],
      ["SGST Collected (9% INR)", data.summary.sgst],
      ["Shipping Fees Collected (INR)", data.summary.total_shipping],
      ["Total Orders", data.summary.total_orders],
      ["Average Order Value (INR)", data.summary.aov],
      ["Pageviews", data.traffic.pageviews],
      ["Sessions", data.traffic.total_sessions],
      ["Conversion Rate (%)", data.traffic.conversion_rate + "%"]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `store_financial_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="Reports & Analytics" />
          <div className="flex-1 flex items-center justify-center text-gray-400">
            ⌛ Loading report metrics...
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || { gross_sales: 0, net_sales: 0, total_tax: 0, cgst: 0, sgst: 0, total_shipping: 0, total_orders: 0, aov: 0 };
  const traffic = data?.traffic || { total_sessions: 0, pageviews: 0, conversion_rate: 0 };
  const splits = data?.splits || [];
  const categories = data?.categories || [];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Reports & Analytics" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Executive Analytics</p>
              <h2 className="text-xl font-bold text-gray-800">Business Intelligence Suite</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200/80 shadow-sm">
                {[["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]].map(([k, l]) => (
                  <button key={k} onClick={() => setPeriod(k)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all
                      ${period === k ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    {l}
                  </button>
                ))}
              </div>

              <button
                onClick={handleExport}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm transition flex items-center gap-2">
                <MdFileDownload className="text-lg text-indigo-600" /> Export CSV
              </button>
            </div>
          </div>

          {/* Main KPI metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI: Gross Sales */}
            <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Sales</p>
                  <h3 className="text-2xl font-black text-gray-800 mt-2">{formatAdminPrice(summary.gross_sales)}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                  <MdMonetizationOn />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                Total aggregate collection inclusive of tax
              </div>
            </div>

            {/* KPI: Net Sales */}
            <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Sales</p>
                  <h3 className="text-2xl font-black text-gray-800 mt-2">{formatAdminPrice(summary.net_sales)}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                  <MdMonetizationOn />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                Sales value excluding GST and Shipping
              </div>
            </div>

            {/* KPI: CGST & SGST */}
            <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tax Split (18% GST)</p>
                  <h3 className="text-xl font-black text-gray-800 mt-2">{formatAdminPrice(summary.total_tax)}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                  <MdPercent />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-0.5 text-xs text-gray-500">
                <span>CGST (9%): {formatAdminPrice(summary.cgst)}</span>
                <span>SGST (9%): {formatAdminPrice(summary.sgst)}</span>
              </div>
            </div>

            {/* KPI: Shipping Fees */}
            <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Fees</p>
                  <h3 className="text-2xl font-black text-gray-800 mt-2">{formatAdminPrice(summary.total_shipping)}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <MdLocalShipping />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                Fees gathered for physical order logistics
              </div>
            </div>

          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* KPI: Total Orders */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                  <MdShoppingCart />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-lg font-black text-gray-800">{summary.total_orders} Orders</h3>
                </div>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">Volume</span>
            </div>

            {/* KPI: Average Order Value */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                  <MdMonetizationOn />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Order Value</p>
                  <h3 className="text-lg font-black text-gray-800">{formatAdminPrice(summary.aov)}</h3>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">AOV</span>
            </div>

            {/* KPI: Conversion Rate */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
                  <MdPercent />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversion Rate</p>
                  <h3 className="text-lg font-black text-gray-800">{traffic.conversion_rate}%</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700">{traffic.total_sessions} Sessions</p>
                <p className="text-[10px] text-gray-400">{traffic.pageviews} Pageviews</p>
              </div>
            </div>

          </div>

          {/* Performance Splits Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Split: Physical vs Digital */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Operational splits</h3>
              <div className="flex flex-col gap-5">
                {splits.map(s => {
                  const percent = summary.gross_sales ? ((s.revenue / summary.gross_sales) * 100).toFixed(0) : 0;
                  const isPhys = s.type === "physical";
                  return (
                    <div key={s.type} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                        <span className="capitalize">{s.type} Products ({s.count} orders)</span>
                        <span>{formatAdminPrice(s.revenue)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isPhys ? 'bg-indigo-600' : 'bg-sky-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {splits.length === 0 && (
                  <p className="text-center py-6 text-xs text-gray-400">No operational split data for this period.</p>
                )}
              </div>
            </div>

            {/* Split: Category Performance */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Category Revenue Distribution</h3>
              <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
                {categories.map((c, idx) => {
                  const percent = summary.gross_sales ? ((c.revenue / summary.gross_sales) * 100).toFixed(0) : 0;
                  return (
                    <div key={c.category_name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                        <span>{idx + 1}. {c.category_name} ({c.units_sold} units sold)</span>
                        <span>{formatAdminPrice(c.revenue)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-center py-6 text-xs text-gray-400">No category performance data for this period.</p>
                )}
              </div>
            </div>

          </div>

          {/* Timeline Reports Summary */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Periodic Sales Journal</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Interval Label</th>
                    <th className="px-6 py-4">Orders Placed</th>
                    <th className="px-6 py-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {data?.timeline?.map(t => (
                    <tr key={t.label} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{t.label}</td>
                      <td className="px-6 py-4">{t.orders} orders</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">{formatAdminPrice(t.revenue)}</td>
                    </tr>
                  ))}
                  {(!data?.timeline || data.timeline.length === 0) && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No timeline transactions logged for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
