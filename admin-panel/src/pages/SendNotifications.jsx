import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdNotificationsActive, MdSend, MdCheckCircle } from "react-icons/md";

export default function SendNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("new_arrival");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  const fetchBroadcasts = async () => {
    try {
      const res = await API.get("/admin/notifications/broadcasts");
      setBroadcasts(res.data || []);
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Please fill out both title and message.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const res = await API.post("/admin/notifications/broadcast", {
        title,
        message,
        type
      });

      const count = res.data?.sent_to || 0;
      setToast(`Notification sent to ${count} users`);
      setTitle("");
      setMessage("");
      setType("new_arrival");
      fetchBroadcasts();

      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error("Broadcast failed:", err);
      setError(err.response?.data?.error || "Failed to send broadcast notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Send Notifications" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdNotificationsActive className="text-emerald-600 text-2xl" /> Broadcast Notifications
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Send push notifications directly to all registered members' notification feeds.
              </p>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* Section 1: Send Broadcast Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Section 1 — Send Broadcast</h3>
            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Arrivals This Week 📦"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="new_arrival">New Arrival</option>
                    <option value="promotion">Promotion</option>
                    <option value="general">General Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write message details for your customers..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-sm"
                >
                  <MdSend className="text-base" /> {sending ? "Sending..." : "Send to All Users"}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Past Broadcasts Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Section 2 — Past Broadcasts</h3>
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading past broadcasts...</div>
            ) : broadcasts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No past broadcast notifications sent yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Sent To</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {broadcasts.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-bold text-gray-900">{b.title}</td>
                        <td className="p-4 text-gray-600 max-w-xs truncate">{b.message}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {b.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-800">{b.sent_count} users</td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">
                          {new Date(b.created_at).toLocaleString()}
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
