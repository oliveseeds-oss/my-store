import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { formatAdminPrice } from "../utils/currency";
import { MdSearch, MdFilterList, MdFileDownload, MdMonetizationOn, MdCreditCard, MdAccountBalance, MdCheckCircle, MdError, MdHelp } from "react-icons/md";

const MODE_ICONS = {
  COD: "💵",
  Online: "💳",
  Card: "💳",
  UPI: "📱",
  Netbanking: "🏦",
  Wallet: "💼"
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (mode) queryParams.append("mode", mode);
      if (status) queryParams.append("status", status);
      if (fromDate) queryParams.append("from_date", fromDate);
      if (toDate) queryParams.append("to_date", toDate);

      const r = await API.get(`/transactions?${queryParams.toString()}`);
      setTransactions(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, mode, status, fromDate, toDate]);

  const handleExport = () => {
    const csvContent = [
      ["Transaction ID", "Order ID", "Date", "Customer Name", "Customer Email", "Subtotal (INR)", "Tax Collected (INR)", "CGST (INR)", "SGST (INR)", "Shipping Fee (INR)", "Total (INR)", "Payment Mode", "Payment Status", "Type"],
      ...transactions.map(t => [
        t.transaction_id || "N/A",
        t.order_uid,
        new Date(t.created_at).toLocaleString("en-IN"),
        t.customer_name,
        t.customer_email,
        t.subtotal,
        t.tax_amount,
        (t.tax_amount / 2).toFixed(2),
        (t.tax_amount / 2).toFixed(2),
        t.shipping_fee,
        t.total,
        t.payment_mode,
        t.payment_status,
        t.type
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transaction_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Transactions Ledger" />
        <main className="p-6 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          
          {/* Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Financial Audit</p>
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
            </div>
            
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow transition flex items-center gap-2 self-start sm:self-auto">
              <MdFileDownload className="text-lg" /> Export Ledger CSV
            </button>
          </div>

          {/* Advanced Filters Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <MdFilterList className="text-indigo-600 text-lg" />
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Search & Ledger Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* Search input */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ID, AWB, customer..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Payment Mode */}
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white font-medium text-gray-700">
                <option value="">All Payment Modes</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Online">Online Payments</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Netbanking">Net Banking</option>
              </select>

              {/* Payment Status */}
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white font-medium text-gray-700">
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* From Date */}
              <div>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-700 font-medium"
                />
              </div>

              {/* To Date */}
              <div>
                <input 
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-700 font-medium"
                />
              </div>

            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Breakdown (Base + GST + Ship)</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {transactions.map(t => {
                    const isPaid = t.payment_status === "Paid";
                    const isPending = t.payment_status === "Pending";
                    const isFailed = t.payment_status === "Failed";
                    
                    return (
                      <tr key={t.order_uid} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-gray-500">
                          {t.transaction_id || <span className="text-gray-300">N/A</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-indigo-600 font-bold">
                          {t.order_uid}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(t.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{t.customer_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{t.customer_email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            <span>Base: {formatAdminPrice(t.subtotal)}</span>
                            <span>GST (18%): {formatAdminPrice(t.tax_amount)} (C: {formatAdminPrice(t.tax_amount / 2)}, S: {formatAdminPrice(t.tax_amount / 2)})</span>
                            <span>Shipping: {formatAdminPrice(t.shipping_fee)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-800 text-sm">
                          {formatAdminPrice(t.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm mr-1">{MODE_ICONS[t.payment_mode] || "💰"}</span>
                          <span className="font-semibold text-gray-600">{t.payment_mode}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                            ${isPaid ? 'bg-green-50 text-green-700 border border-green-100' :
                              isPending ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'}`}>
                            {isPaid ? "✓ Paid" : isPending ? "⌛ Pending" : "✗ " + t.payment_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {transactions.length === 0 && !loading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-400 text-xs">
                        No transactions found matching the selected filter criteria.
                      </td>
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
