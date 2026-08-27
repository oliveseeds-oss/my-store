import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdMail, MdDownload, MdDelete, MdCheckCircle } from "react-icons/md";

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSubscribers = async () => {
    try {
      const res = await API.get("/newsletter/admin/all");
      setSubscribers(res.data || []);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const exportCSV = async () => {
    try {
      const response = await API.get("/newsletter/admin/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "newsletter_subscribers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export subscribers CSV");
    }
  };

  const unsubscribeUser = async (id) => {
    if (!window.confirm("Are you sure you want to unsubscribe this email?")) return;
    try {
      await API.delete(`/newsletter/admin/${id}`);
      setToast("Subscriber unsubscribed");
      fetchSubscribers();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Newsletter Subscribers" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdMail className="text-indigo-600 text-2xl" /> Newsletter Subscribers
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {subscribers.filter((s) => s.is_active).length} Active Subscribers
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                View mailing list subscribers and download full list for email campaigns.
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
            >
              <MdDownload className="text-base" /> Export to CSV
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No newsletter subscribers yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Subscriber Email</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Subscribed Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-bold text-gray-900">{s.email}</td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              s.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {s.is_active ? "Subscribed" : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">
                          {new Date(s.subscribed_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          {s.is_active && (
                            <button
                              onClick={() => unsubscribeUser(s.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Unsubscribe"
                            >
                              <MdDelete className="text-base" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
