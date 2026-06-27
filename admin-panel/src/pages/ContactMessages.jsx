import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { MdMail, MdMailOutline, MdClose } from "react-icons/md";

const SAMPLE = [
  { id: 1, name: "Sundar K", email: "sundar@gmail.com", phone: "9876500001", subject: "Custom engraving inquiry", message: "Hi, I want to engrave my company logo on 50 mugs. Can you give me a bulk quote?", date: "2024-06-01", read: false },
  { id: 2, name: "Lakshmi V", email: "lakshmi@gmail.com", phone: "9876500002", subject: "Order delay", message: "My order #1019 was supposed to arrive 3 days ago. Please update me on the status.", date: "2024-05-31", read: false },
  { id: 3, name: "Bala P", email: "bala@gmail.com", phone: "9876500003", subject: "Return request", message: "The product I received has a spelling mistake in the engraving. I need a replacement.", date: "2024-05-30", read: true },
  { id: 4, name: "Deepa M", email: "deepa@gmail.com", phone: "9876500004", subject: "Wedding gift enquiry", message: "Looking for personalised gifts for 20 guests at a wedding. What are my options?", date: "2024-05-28", read: true },
];

export default function ContactMessages() {
  const [messages, setMessages] = useState(SAMPLE);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const openMessage = (m) => {
    setMessages(messages.map((msg) => msg.id === m.id ? { ...msg, read: true } : msg));
    setSelected({ ...m, read: true });
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = messages.filter((m) => {
    if (filter === "Unread") return !m.read;
    if (filter === "Read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar title="Contact messages" />
        <main className="p-6 flex gap-4 h-[calc(100vh-56px)]">

          {/* Message list */}
          <div className="w-80 flex flex-col gap-3 flex-shrink-0">
            <div className="flex gap-2">
              {["All", "Unread", "Read"].map((f) => (
                <button key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition
                    ${filter === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                  {f} {f === "Unread" && unreadCount > 0 && `(${unreadCount})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
              {filtered.map((m) => (
                <div key={m.id}
                  onClick={() => openMessage(m)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition
                    ${selected?.id === m.id
                      ? "border-indigo-300 ring-1 ring-indigo-200"
                      : "border-gray-100 hover:border-gray-200"}
                    ${!m.read ? "bg-indigo-50/50" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!m.read
                        ? <MdMail className="text-indigo-500 flex-shrink-0" />
                        : <MdMailOutline className="text-gray-300 flex-shrink-0" />}
                      <div>
                        <p className={`text-sm ${!m.read ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-400">{m.date}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-2 truncate">
                    {m.subject}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{m.message}</p>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No messages</p>
              )}
            </div>
          </div>

          {/* Message detail */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col">
            {selected ? (
              <div className="p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{selected.subject}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      From <span className="text-gray-600 font-medium">{selected.name}</span>
                      {" "}· {selected.email} · {selected.phone}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{selected.date}</p>
                  </div>
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition">
                    <MdClose className="text-lg" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex-1 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
                
                {/* Fixed the missing <a> tag here */}
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600
                             hover:bg-indigo-700 text-white text-sm px-4 py-2.5
                             rounded-lg transition w-full"
                >
                  Reply via email
                </a>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MdMailOutline className="text-5xl text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}