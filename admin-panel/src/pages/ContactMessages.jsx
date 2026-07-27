import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdMail, MdMailOutline, MdClose } from "react-icons/md";

const TABS = [
  { key: "contact", label: "General Contacts", endpoint: "/contact" },
  { key: "bulk", label: "Bulk Engravings", endpoint: "/bulk-orders" },
  { key: "design", label: "Design Inquiries", endpoint: "/design-inquiries" }
];

const STATUSES = ["Pending", "Reviewed", "Processed", "Rejected"];

export default function ContactMessages() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadMessages = async (tab = activeTab) => {
    setLoading(true);
    try {
      const res = await API.get(`${tab.endpoint}/admin/all`);
      setMessages(res.data || []);
      setSelected(null);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilter("All");
  };

  const openMessage = async (m) => {
    setSelected(m);
    if (!m.is_read) {
      try {
        await API.put(`${activeTab.endpoint}/${m.id}/read`);
        setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, is_read: 1 } : msg));
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`${activeTab.endpoint}/${id}/status`, { status });
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status } : msg));
      if (selected?.id === id) {
        setSelected(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await API.delete(`${activeTab.endpoint}/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "Unread") return !m.is_read;
    if (filter === "Read") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Contact & Inquiries Control" />
        
        {/* Tab Selection */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex gap-2.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all
                ${activeTab.key === tab.key 
                  ? "bg-indigo-600 text-white shadow" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="p-6 flex gap-4 h-[calc(100vh-108px)]">
          {/* Message list */}
          <div className="w-80 flex flex-col gap-3 flex-shrink-0">
            <div className="flex gap-2">
              {["All", "Unread", "Read"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition
                    ${filter === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}
                >
                  {f} {f === "Unread" && unreadCount > 0 && `(${unreadCount})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
              {loading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
              ) : filtered.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition
                    ${selected?.id === m.id
                      ? "border-indigo-300 ring-1 ring-indigo-200"
                      : "border-gray-100 hover:border-gray-200"}
                    ${!m.is_read ? "bg-indigo-50/40 font-semibold" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!m.is_read
                        ? <MdMail className="text-indigo-500 flex-shrink-0" />
                        : <MdMailOutline className="text-gray-300 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{m.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(m.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full
                      ${m.status === "Processed" ? "bg-green-150 text-green-700" :
                        m.status === "Rejected" ? "bg-red-150 text-red-700" :
                        m.status === "Reviewed" ? "bg-blue-150 text-blue-700" : "bg-amber-150 text-amber-700"}`}
                    >
                      {m.status || "Pending"}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-2 truncate">
                    {activeTab.key === "bulk" ? `Bulk Order: ${m.product_type}` : 
                     activeTab.key === "design" ? `Design Project: ${m.project_type}` : (m.subject || "No Subject")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{m.message}</p>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No enquiries found</p>
              )}
            </div>
          </div>

          {/* Message detail */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
            {selected ? (
              <div className="p-6 flex flex-col gap-4 h-full overflow-y-auto">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate">
                      {activeTab.key === "bulk" ? `Bulk Order proposal: ${selected.product_type}` : 
                       activeTab.key === "design" ? `Design Agency proposal: ${selected.project_type}` : (selected.subject || "No Subject")}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                      From <strong className="text-gray-700">{selected.name}</strong>
                      {selected.company && ` · Company: ${selected.company}`}
                      <br />
                      Email: {selected.email} {selected.phone && ` · Phone: ${selected.phone}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Received: {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Additional form fields (quantities, budgets, timelines) */}
                {(activeTab.key === "bulk" || activeTab.key === "design") && (
                  <div className="bg-amber-50/50 border border-amber-900/10 rounded-xl p-4 grid grid-cols-2 gap-4">
                    {activeTab.key === "bulk" && (
                      <>
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Quantity Required</span>
                          <span className="text-sm font-semibold text-stone-800">{selected.quantity} units</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Material Type</span>
                          <span className="text-sm font-semibold text-stone-800">{selected.product_type}</span>
                        </div>
                      </>
                    )}
                    {activeTab.key === "design" && (
                      <>
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Estimated Budget</span>
                          <span className="text-sm font-semibold text-stone-800">{selected.budget_range || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Ideal Timeline</span>
                          <span className="text-sm font-semibold text-stone-800">{selected.timeline || "Not specified"}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 flex-1 overflow-y-auto min-h-[150px]">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                {/* Status Selection & Reply */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status Update:</label>
                    <select
                      value={selected.status || "Pending"}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-150"
                    >
                      {STATUSES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Olive Seeds Enquiry"}`}
                    className="inline-flex items-center justify-center bg-indigo-600
                               hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-3
                               rounded-lg transition"
                  >
                    Reply via email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MdMailOutline className="text-5xl text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Select an enquiry to read</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}