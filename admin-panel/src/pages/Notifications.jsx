import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MdSend, MdNotifications, MdDelete } from "react-icons/md";

export default function Notifications() {
  const [form, setForm] = useState({ title: "", message: "", target: "All members" });
  const [sent, setSent] = useState([
    { id: 1, title: "New arrivals!", message: "Check out our new engraved product collection.", target: "All members", date: "2024-05-28", count: 74 },
    { id: 2, title: "Order shipped", message: "Your order has been shipped and is on the way.", target: "All members", date: "2024-05-20", count: 74 },
  ]);
  const [success, setSuccess] = useState(false);

  const send = () => {
    if (!form.title || !form.message) return;
    const today = new Date().toISOString().split("T")[0];
    setSent([{ ...form, id: Date.now(), date: today, count: 74 }, ...sent]);
    setForm({ title: "", message: "", target: "All members" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const remove = (id) => setSent(sent.filter((s) => s.id !== id));

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Notifications" />
        <main className="p-6 flex gap-6">

          {/* Compose */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <MdNotifications className="text-indigo-500 text-xl" />
                <h3 className="font-semibold text-gray-700 text-sm">Send notification</h3>
              </div>

              {success && (
                <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-lg">
                  Notification sent successfully!
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Send to</label>
                  <select
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    <option>All members</option>
                    <option>Active members</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. New arrivals!"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    placeholder="Write your notification message..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <button onClick={send}
                  className="flex items-center justify-center gap-2 bg-indigo-600
                             hover:bg-indigo-700 text-white rounded-lg py-2.5
                             text-sm font-medium transition">
                  <MdSend /> Send now
                </button>
              </div>
            </div>
          </div>

          {/* Sent history */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-600">Sent history</h3>
            {sent.map((s) => (
              <div key={s.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex
                           items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center
                                  justify-center flex-shrink-0">
                    <MdNotifications className="text-indigo-500 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{s.date}</span>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2
                                       py-0.5 rounded-full">{s.target}</span>
                      <span className="text-xs text-gray-400">
                        Sent to {s.count} members
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(s.id)}
                  className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg
                             hover:bg-red-50 transition flex-shrink-0">
                  <MdDelete />
                </button>
              </div>
            ))}
            {sent.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white
                              rounded-xl border border-gray-100">
                No notifications sent yet
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}