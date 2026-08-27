import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdCorporateFare, MdCheckCircle, MdClose } from "react-icons/md";

export default function BulkInquiriesManager() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchInquiries = async () => {
    try {
      const res = await API.get("/bulk-inquiry/admin/all");
      setInquiries(res.data || []);
    } catch (err) {
      console.error("Failed to load bulk inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/bulk-inquiry/admin/${id}/status`, { status: newStatus });
      setToast(`Status updated to "${newStatus}"`);
      fetchInquiries();
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Bulk Inquiries" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdCorporateFare className="text-indigo-600 text-2xl" /> Bulk Order Inquiries
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {inquiries.length} Requests Received
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage wholesale and corporate custom order quote requests.
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

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No bulk inquiries received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Contact Email</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                      <tr
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className="hover:bg-stone-50/70 transition cursor-pointer"
                      >
                        <td className="p-4 font-bold text-gray-900">{inq.full_name}</td>
                        <td className="p-4 text-gray-600">{inq.email}</td>
                        <td className="p-4 text-gray-600">{inq.company_name || "—"}</td>
                        <td className="p-4 font-bold text-indigo-700">{inq.quantity || "N/A"}</td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={inq.status}
                            onChange={(e) => updateStatus(inq.id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                              inq.status === "new"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : inq.status === "contacted"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-[11px] font-bold text-indigo-600 hover:underline">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Details */}
          {selectedInquiry && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <MdCorporateFare className="text-indigo-600" /> Inquiry #{selectedInquiry.id}
                  </h3>
                  <button onClick={() => setSelectedInquiry(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <MdClose className="text-xl" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl">
                    <div>
                      <span className="text-gray-400 font-medium block">Name</span>
                      <span className="font-bold text-gray-900">{selectedInquiry.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Email</span>
                      <a href={`mailto:${selectedInquiry.email}`} className="font-bold text-indigo-600 underline">
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Phone</span>
                      <span className="font-bold text-gray-900">{selectedInquiry.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Company</span>
                      <span className="font-bold text-gray-900">{selectedInquiry.company_name || "N/A"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium block mb-1">Products Interested In</span>
                    <p className="font-bold text-gray-800 bg-stone-50 p-3 rounded-xl">
                      {selectedInquiry.product_interest || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium block mb-1">Estimated Quantity</span>
                    <span className="font-bold text-indigo-700 text-sm bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                      {selectedInquiry.quantity || "N/A"} units
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium block mb-1">Customer Message</span>
                    <div className="bg-stone-50 p-4 rounded-xl text-gray-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {selectedInquiry.message || "No detailed message provided."}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                    <span className="text-gray-400 text-[10px]">
                      Received on {new Date(selectedInquiry.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
