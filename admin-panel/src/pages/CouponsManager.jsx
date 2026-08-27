import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { MdConfirmationNumber, MdAdd, MdClose, MdCheckCircle, MdBlock } from "react-icons/md";

const INIT_COUPON = {
  code: "",
  type: "percentage",
  value: "",
  minimum_order_value: 0,
  usage_limit: "",
  expires_at: ""
};

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INIT_COUPON);
  const [toast, setToast] = useState(null);

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons/admin/all");
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const createCoupon = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      alert("Code and Value are required.");
      return;
    }

    try {
      await API.post("/coupons/admin/create", form);
      setToast("Coupon created successfully!");
      setShowForm(false);
      setForm(INIT_COUPON);
      fetchCoupons();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to create coupon:", err);
      alert(err.response?.data?.error || "Failed to create coupon");
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      await API.put(`/coupons/admin/${coupon.id}`, {
        is_active: !coupon.is_active
      });
      setToast(`Coupon ${!coupon.is_active ? "activated" : "deactivated"}`);
      fetchCoupons();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to toggle coupon:", err);
    }
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Coupons Manager" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MdConfirmationNumber className="text-indigo-600 text-2xl" /> Discount Coupons
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
                  {coupons.length} Active Codes
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Create flat or percentage discount coupons with minimum order values and usage limits.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
            >
              <MdAdd className="text-base" /> Create New Coupon
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* Coupons Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No coupons created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Type & Value</th>
                      <th className="p-4">Min. Order</th>
                      <th className="p-4">Usage Count</th>
                      <th className="p-4">Expiry Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-mono font-bold text-indigo-700 text-sm">
                          {c.code}
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                        </td>
                        <td className="p-4 text-gray-600">
                          ₹{c.minimum_order_value || 0}
                        </td>
                        <td className="p-4 text-gray-600">
                          {c.used_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : "(Unlimited)"}
                        </td>
                        <td className="p-4 text-gray-500 whitespace-nowrap">
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              c.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {c.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleCouponStatus(c)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition ${
                              c.is_active
                                ? "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {c.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base">✨ Create New Coupon</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                    <MdClose className="text-xl" />
                  </button>
                </div>

                <form onSubmit={createCoupon} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. WELCOME10"
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Discount Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Value *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        placeholder={form.type === "percentage" ? "10" : "150"}
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Min. Order Value (₹)</label>
                      <input
                        type="number"
                        value={form.minimum_order_value}
                        onChange={(e) => setForm({ ...form, minimum_order_value: e.target.value })}
                        placeholder="0"
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Usage Limit (Optional)</label>
                      <input
                        type="number"
                        value={form.usage_limit}
                        onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                        placeholder="100"
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full bg-stone-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-stone-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                    >
                      Create Coupon
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
