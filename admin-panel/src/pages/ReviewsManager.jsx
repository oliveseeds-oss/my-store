import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdStar, MdCheckCircle, MdDelete, MdFilterList } from "react-icons/md";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved'
  const [toast, setToast] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/admin/all");
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const approveReview = async (id) => {
    try {
      await API.put(`/reviews/admin/${id}/approve`);
      setToast("Review approved successfully!");
      fetchReviews();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to approve review:", err);
      alert("Failed to approve review");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await API.delete(`/reviews/admin/${id}`);
      setToast("Review deleted");
      fetchReviews();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Reviews Manager" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdStar className="text-amber-500 text-2xl" /> Reviews Manager
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {reviews.length} Total Reviews
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Approve or moderate customer product reviews before they appear on the public website.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl shrink-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "pending" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Pending ({reviews.filter((r) => !r.is_approved).length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "approved" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Approved ({reviews.filter((r) => r.is_approved).length})
              </button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* Reviews Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading reviews...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No reviews found under "{filter}" filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Review Text</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-bold text-gray-900 min-w-[140px]">
                          {r.product_name || `Product #${r.product_id}`}
                        </td>
                        <td className="p-4 text-gray-600 min-w-[120px]">
                          <div className="font-semibold">{r.customer_name || "Verified Buyer"}</div>
                          <div className="text-[10px] text-gray-400">{r.customer_email || `User #${r.user_id}`}</div>
                        </td>
                        <td className="p-4 shrink-0">
                          <div className="flex items-center text-amber-500 font-bold">
                            {"★".repeat(r.rating)}
                            <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                            <span className="ml-1 text-[#0D1512] font-mono text-[11px]">({r.rating}/5)</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs leading-relaxed">
                          {r.review_text || <em className="text-gray-400">No written text</em>}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              r.is_approved
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {r.is_approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {!r.is_approved && (
                              <button
                                onClick={() => approveReview(r.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition text-[11px] flex items-center gap-1 shadow-sm"
                              >
                                <MdCheckCircle /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(r.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Review"
                            >
                              <MdDelete className="text-base" />
                            </button>
                          </div>
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
